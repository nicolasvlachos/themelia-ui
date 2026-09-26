/** Partitions the filter list into the four groups a bar draws differently; exported for custom bars. */
import { useMemo } from "react"

import { useFilters } from "./filter-store"
import { FilterType, type FilterConfig } from "./filters.types"

export interface UseFilterGroupsOptions {
	/** Swaps a filter's options at render time, for options loaded by the parent. */
	dynamicFilterOptions?: Record<string, FilterConfig["options"]>
}

export interface UseFilterGroupsResult {
	processedFilters: FilterConfig[]
	/** Always inline, never in a pill — a search box IS its own control. */
	searchFilters: FilterConfig[]
	/** `display: "always"`, and currently empty. */
	alwaysVisibleFilters: FilterConfig[]
	activeFilters: FilterConfig[]
	/** Everything else that is empty: behind the add button. */
	popoverFilters: FilterConfig[]
	activeFilterKeys: string[]
	hasActive: boolean
}

export function useFilterGroups({
	dynamicFilterOptions,
}: UseFilterGroupsOptions = {}): UseFilterGroupsResult {
	const { filters, isFilterActive } = useFilters()

	const processedFilters = useMemo(() => {
		if (!dynamicFilterOptions) return filters
		return filters.map((filter) => {
			const dynamic = dynamicFilterOptions[filter.key]
			return Array.isArray(dynamic) ? { ...filter, options: dynamic } : filter
		})
	}, [dynamicFilterOptions, filters])

	return useMemo(() => {
		const searchFilters = processedFilters.filter((filter) => filter.type === FilterType.SEARCH)

		const visible = processedFilters.filter(
			(filter) =>
				filter.type !== FilterType.SEARCH &&
				!filter.displayConfig?.hidden &&
				filter.displayConfig?.display !== "hidden",
		)

		/* By priority, then authored order, so pills never reorder as values change. */
		const byPriority = [...visible].sort(
			(left, right) =>
				(left.displayConfig?.priority ?? 0) - (right.displayConfig?.priority ?? 0),
		)

		const active = byPriority.filter((filter) => isFilterActive(filter.key))
		const alwaysVisibleFilters = byPriority.filter(
			(filter) => !isFilterActive(filter.key) && filter.displayConfig?.display === "always",
		)
		const popoverFilters = byPriority.filter(
			(filter) => !isFilterActive(filter.key) && filter.displayConfig?.display !== "always",
		)

		return {
			processedFilters,
			searchFilters,
			alwaysVisibleFilters,
			activeFilters: active,
			popoverFilters,
			activeFilterKeys: active.map((filter) => filter.key),
			hasActive: active.length > 0 || searchFilters.some((filter) => isFilterActive(filter.key)),
		}
	}, [isFilterActive, processedFilters])
}
