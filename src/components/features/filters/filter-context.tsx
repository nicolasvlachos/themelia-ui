/**
 * FilterProvider — the filter state. Always controlled (`activeFilters` in,
 * `onFilterChange` out), so the URL or the consumer's state stays the single source of truth.
 *
 * It owns the async option/label cache (see filter-cache.ts) unless one is passed in.
 */
import { resolveStrings } from "@/lib/strings"
import {
	useCallback, useEffect, useMemo, useRef, useState,
	type ReactNode,
} from "react"

import { FilterCacheContext, createFilterCache, type FilterCache } from "./filter-cache"
import { getDefaultOperatorForType } from "./filter-operators"
import { defaultFilterStrings, type FilterStrings } from "./filters.strings"
import { validateFilterValue } from "./filter-utils"
import type {
	ActiveFilter, FilterConfig, FilterContextValue, FilterErrorHandler, FilterOperator,
	FilterOption,
} from "./filters.types"
import { useLatest } from "@/hooks/use-latest"
import { FilterContext, FilterDraftResetContext } from "./filter-store"

export interface FilterProviderProps {
	children: ReactNode
	filters: FilterConfig[]
	activeFilters: ActiveFilter[]
	onFilterChange: (filters: ActiveFilter[]) => void
	/** A change is in flight. The bar dims rather than pretending it has applied. */
	navigating?: boolean
	strings?: Partial<FilterStrings>
	/** Receives fetch, validation, apply, and render failures. */
	onError?: FilterErrorHandler
	/**
	 * The async option and label cache. Defaults to one per mounted provider; pass a
	 * `createFilterCache()` instance to keep results and pill labels across navigation.
	 */
	cache?: FilterCache
}

export function FilterProvider({
	children,
	filters,
	activeFilters,
	onFilterChange,
	navigating = false,
	strings,
	onError,
	cache,
}: FilterProviderProps) {
	const [draftReset, setDraftReset] = useState(0)
	const copy = useMemo<FilterStrings>(
		() => (resolveStrings(defaultFilterStrings, strings)),
		[strings],
	)

	/* Refs, so the callbacks below keep their identity when the parent passes new inline handlers. */
	const filtersRef = useRef(filters)
	const onChangeRef = useRef(onFilterChange)
	const onErrorRef = useLatest(onError)
	useEffect(() => {
		filtersRef.current = filters
	}, [filters])
	useEffect(() => {
		onChangeRef.current = onFilterChange
	}, [onFilterChange])

	/* One cache per mounted provider, in lazy state: a memo may be discarded, and a ref would be written in render. */
	const [ownCache] = useState(createFilterCache)
	const activeCache = cache ?? ownCache

	/* Only what this provider made. A cache handed in belongs to the caller's lifetime. */
	useEffect(() => {
		if (cache !== undefined) return
		return () => ownCache.clear()
	}, [cache, ownCache])

	/** Bumped when a new async label lands, so the pills that show one re-render. */
	const [, setLabelVersion] = useState(0)

	const reportError = useCallback<FilterErrorHandler>((error, context) => {
		onErrorRef.current?.(error, context)
	}, [onErrorRef])

	const addFilter = useCallback(
		(filter: ActiveFilter) => onChangeRef.current([...activeFilters, filter]),
		[activeFilters],
	)

	/* By key or id: a consumer parsing filters from elsewhere may have only one. */
	const removeFilter = useCallback(
		(key: string) =>
			onChangeRef.current(
				activeFilters.filter((filter) => filter.id !== key && filter.key !== key),
			),
		[activeFilters],
	)

	const updateFilter = useCallback(
		(key: string, updates: Partial<ActiveFilter>) =>
			onChangeRef.current(
				activeFilters.map((filter) =>
					filter.id === key || filter.key === key ? { ...filter, ...updates } : filter,
				),
			),
		[activeFilters],
	)

	const clearFilters = useCallback(() => {
		setDraftReset((version) => version + 1)
		onChangeRef.current([])
	}, [])
	const replaceFilters = useCallback(
		(next: ActiveFilter[]) => {
			setDraftReset((version) => version + 1)
			onChangeRef.current(next)
		},
		[],
	)

	const getFilterByKey = useCallback(
		(key: string) => filtersRef.current.find((filter) => filter.key === key),
		[],
	)

	const getFilterValue = useCallback(
		(key: string) => activeFilters.find((filter) => filter.key === key)?.value ?? [],
		[activeFilters],
	)

	const setFilterValue = useCallback(
		(key: string, value: string[]) => {
			const existing = activeFilters.find((filter) => filter.key === key)

			// An empty value removes the filter.
			if (value.length === 0) {
				if (existing) removeFilter(key)
				return
			}

			if (existing) {
				updateFilter(key, { value })
				return
			}

			const config = filtersRef.current.find((filter) => filter.key === key)
			addFilter({
				id: key,
				key,
				value,
				operator:
					config?.operator ??
					config?.operators?.[0]?.value ??
					(config ? getDefaultOperatorForType(config.type) : "equals"),
			})
		},
		[activeFilters, addFilter, removeFilter, updateFilter],
	)

	const isFilterActive = useCallback(
		(key: string) =>
			activeFilters.some((filter) => filter.key === key && filter.value.length > 0),
		[activeFilters],
	)

	const getFilterOperator = useCallback(
		(key: string): FilterOperator => {
			const active = activeFilters.find((filter) => filter.key === key)
			if (active) return active.operator
			const config = filtersRef.current.find((filter) => filter.key === key)
			// An inactive pill still shows the operator it would use.
			return config
				? (config.operator ??
						config.operators?.[0]?.value ??
						getDefaultOperatorForType(config.type))
				: "equals"
		},
		[activeFilters],
	)

	const setFilterOperator = useCallback(
		(key: string, operator: FilterOperator) => {
			if (activeFilters.some((filter) => filter.key === key)) {
				updateFilter(key, { operator })
			}
		},
		[activeFilters, updateFilter],
	)

	const validateFilter = useCallback(
		(key: string, value: unknown) => {
			const config = filtersRef.current.find((filter) => filter.key === key)
			if (!config) return false
			try {
				return validateFilterValue(config, value, copy)
			} catch (error) {
				reportError(error, { phase: "validate", filterKey: key })
				return copy.validation.invalidFormat
			}
		},
		[copy, reportError],
	)

	const getDependentFilters = useCallback(
		(key: string) =>
			filtersRef.current.filter((filter) =>
				filter.dependencies?.some((dependency) => dependency.key === key),
			),
		[],
	)

	const cacheAsyncOptions = useCallback(
		(filterKey: string, options: FilterOption[]) => {
			// Re-render pills only when a label is new.
			if (activeCache.rememberLabels(filterKey, options)) {
				setLabelVersion((version) => version + 1)
			}
		},
		[activeCache],
	)

	const getAsyncOptionLabel = useCallback(
		(filterKey: string, value: string) => activeCache.getLabel(filterKey, value)?.label,
		[activeCache],
	)

	const value = useMemo<FilterContextValue>(
		() => ({
			activeFilters, filters, addFilter, removeFilter, updateFilter, clearFilters,
			replaceFilters, getFilterByKey, getFilterValue, setFilterValue, isFilterActive,
			getFilterOperator, setFilterOperator, validateFilter, getDependentFilters,
			isNavigating: navigating, strings: copy, cacheAsyncOptions, getAsyncOptionLabel,
			reportError,
		}),
		[
			activeFilters, addFilter, cacheAsyncOptions, clearFilters, copy, filters,
			getAsyncOptionLabel, getDependentFilters, getFilterByKey, getFilterOperator,
			getFilterValue, isFilterActive, navigating, removeFilter, replaceFilters,
			reportError, setFilterOperator, setFilterValue, updateFilter, validateFilter,
		],
	)

	return (
		<FilterCacheContext.Provider value={activeCache}>
			<FilterDraftResetContext.Provider value={draftReset}>
				<FilterContext.Provider value={value}>{children}</FilterContext.Provider>
			</FilterDraftResetContext.Provider>
		</FilterCacheContext.Provider>
	)
}
