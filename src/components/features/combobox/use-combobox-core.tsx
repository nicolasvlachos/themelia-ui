/**
 * The state and rendering single and multi share: debounce, threshold, grouping, create
 * row and pagination. The variants differ only in selection, chips and the apply footer.
 */
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react"
import { PlusIcon } from "lucide-react"

import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { DEFAULT_DEBOUNCE_MS } from "@/hooks/use-debounce"
import { Text } from "@/components/base/typography"

import { defaultAsyncComboboxStrings, type AsyncComboboxStrings } from "./combobox.strings"
import type { AsyncComboboxSharedProps } from "./combobox.types"
import { HighlightedText } from "./highlighted-text"
import styles from "./combobox.module.css"

export const DEFAULT_MIN_SEARCH_LENGTH = 3
/** How far down the list a scroll must reach before the next page is requested. */
const LOAD_MORE_THRESHOLD = 0.8
const LOAD_MORE_DEBOUNCE_MS = 100
/** How long after a request before another may be made. See `useLoadMore`. */
const LOAD_MORE_COOLDOWN_MS = 500

/** Marks the create row, a real list item; a symbol cannot collide with the consumer's item keys. */
const CREATE_OPTION = Symbol("combobox-create-option")

export function isCreateOption<T>(item: T): item is T & { [CREATE_OPTION]: string } {
	return typeof item === "object" && item !== null && CREATE_OPTION in (item as object)
}

export function getCreateOptionValue<T>(item: T): string {
	if (!isCreateOption(item)) throw new Error("That item is not a create option.")
	return (item as { [CREATE_OPTION]: string })[CREATE_OPTION]
}

function makeCreateOption<T>(value: string): T {
	return { [CREATE_OPTION]: value } as unknown as T
}

/* ── Debounced search ────────────────────────────────────────────────────────────── */

function useDebouncedSearch({
	searchValue,
	onSearch,
	debounceMs = DEFAULT_DEBOUNCE_MS,
	minSearchLength = DEFAULT_MIN_SEARCH_LENGTH,
}: {
	searchValue: string
	onSearch: ((value: string) => void) | undefined
	debounceMs?: number
	minSearchLength?: number
}): void {
	/* Stable identity despite inline `onSearch`; depending on the raw callback would loop fetches. */
	const emit = useDebouncedCallback((value: string) => onSearch?.(value), debounceMs)

	useEffect(() => {
		const trimmed = searchValue.trim()
		// Below the threshold there is nothing worth asking a server about.
		if (trimmed.length < minSearchLength) return
		emit(trimmed)
		return emit.cancel
	}, [emit, minSearchLength, searchValue])
}

/* ── Scroll pagination ───────────────────────────────────────────────────────────── */

function useLoadMore({
	hasMore,
	onLoadMore,
	loadingMore,
}: {
	hasMore: boolean | undefined
	onLoadMore: (() => void) | undefined
	loadingMore: boolean | undefined
}) {
	const requesting = useRef(false)
	const cooldown = useRef<ReturnType<typeof setTimeout> | null>(null)

	const request = useDebouncedCallback(() => {
		requesting.current = true
		onLoadMore?.()

		/* A cooldown: until the list grows, the scroll stays past the threshold and would re-request. */
		if (cooldown.current) clearTimeout(cooldown.current)
		cooldown.current = setTimeout(() => {
			requesting.current = false
			cooldown.current = null
		}, LOAD_MORE_COOLDOWN_MS)
	}, LOAD_MORE_DEBOUNCE_MS)

	useEffect(() => () => {
		if (cooldown.current) clearTimeout(cooldown.current)
	}, [])

	const handleScroll = useCallback(
		(event: Event) => {
			if (!hasMore || !onLoadMore || loadingMore || requesting.current) return
			const target = event.target as HTMLElement
			const { scrollHeight, scrollTop, clientHeight } = target
			if ((scrollTop + clientHeight) / scrollHeight >= LOAD_MORE_THRESHOLD) request()
		},
		[hasMore, loadingMore, onLoadMore, request],
	)

	return { handleScroll }
}

/* ── The core ────────────────────────────────────────────────────────────────────── */

export interface UseComboboxCoreOptions<T> extends AsyncComboboxSharedProps<T> {
	/** Always present in the list, whatever the current results are. The selection. */
	ensuredItems?: T[]
}

export interface UseComboboxCoreReturn<T> {
	strings: AsyncComboboxStrings
	getKey: (item: T) => string
	trimmedSearch: string
	listRef: React.RefObject<HTMLDivElement | null>
	baseItems: T[]
	/** `baseItems` plus the create row, when one is offered. */
	allItems: T[]
	groupedItems: Map<string, T[]> | null
	createOptionItem: T | null
	showStatus: boolean
	showEmpty: boolean
	showCreateOption: boolean
	renderItemContent: (item: T) => ReactNode
	itemToStringLabel: (item: T) => string
	getItemReactKey: (item: T) => string
	handleScroll: (event: Event) => void
}

export function useComboboxCore<T>({
	items,
	searchValue,
	getItemLabel,
	getItemKey,
	loading = false,
	showListContent = true,
	minSearchLength = DEFAULT_MIN_SEARCH_LENGTH,
	strings,
	renderItem,
	onSearch,
	debounceMs = DEFAULT_DEBOUNCE_MS,
	creatable,
	onCreate,
	getItemGroup,
	hasMore,
	onLoadMore,
	loadingMore,
	highlightMatch,
	ensuredItems = [],
}: UseComboboxCoreOptions<T>): UseComboboxCoreReturn<T> {
	const copy = { ...defaultAsyncComboboxStrings, ...strings }
	const { formatCreate } = copy
	const getKey = getItemKey ?? getItemLabel
	const listRef = useRef<HTMLDivElement | null>(null)
	const trimmedSearch = searchValue.trim()

	// The status row REPLACES the list: loading, or not enough typed to search yet.
	const showStatus = showListContent && (loading || trimmedSearch.length < minSearchLength)

	useDebouncedSearch({ searchValue, onSearch, debounceMs, minSearchLength })

	const { handleScroll } = useLoadMore({
		// Pagination is meaningless while the status row is up.
		hasMore: showListContent && !showStatus ? hasMore : false,
		onLoadMore,
		loadingMore,
	})

	useEffect(() => {
		const element = listRef.current
		if (!showListContent || showStatus || !element || !hasMore || !onLoadMore) return
		element.addEventListener("scroll", handleScroll)
		return () => element.removeEventListener("scroll", handleScroll)
	}, [handleScroll, hasMore, onLoadMore, showListContent, showStatus])

	/** The selection merged ahead of the results, de-duplicated by key, so chosen items stay listed. */
	const baseItems = useMemo(() => {
		if (!showListContent || showStatus) return []
		if (ensuredItems.length === 0) return items
		const merged = [...ensuredItems]
		for (const item of items) {
			if (!ensuredItems.some((ensured) => getKey(ensured) === getKey(item))) merged.push(item)
		}
		return merged
	}, [ensuredItems, getKey, items, showListContent, showStatus])

	const groupedItems = useMemo(() => {
		if (!getItemGroup) return null
		const groups = new Map<string, T[]>()
		for (const item of baseItems) {
			const key = getItemGroup(item)
			const existing = groups.get(key)
			if (existing) existing.push(item)
			else groups.set(key, [item])
		}
		return groups
	}, [baseItems, getItemGroup])

	const showCreateOption = useMemo(() => {
		if (!showListContent || showStatus) return false
		if (!creatable || !onCreate) return false
		// Nothing typed is nothing to create — reachable once `minSearchLength` is 0.
		if (trimmedSearch === "" || trimmedSearch.length < minSearchLength) return false
		// No create row for a case-insensitive exact match.
		const needle = trimmedSearch.toLowerCase()
		return !baseItems.some((item) => getItemLabel(item).toLowerCase() === needle)
	}, [baseItems, creatable, getItemLabel, minSearchLength, onCreate, showListContent, showStatus, trimmedSearch])

	const createOptionItem = useMemo(
		() => (showCreateOption ? makeCreateOption<T>(trimmedSearch) : null),
		[showCreateOption, trimmedSearch],
	)

	const allItems = useMemo(
		() => (createOptionItem ? [...baseItems, createOptionItem] : baseItems),
		[baseItems, createOptionItem],
	)

	/* Against `items`, not `baseItems`: merged selections do not make an empty search non-empty. */
	const showEmpty =
		showListContent &&
		!loading &&
		trimmedSearch.length >= minSearchLength &&
		items.length === 0 &&
		!showCreateOption

	const renderItemContent = useCallback(
		(item: T): ReactNode => {
			if (isCreateOption(item)) {
				return (
					<span className={styles.createRow}>
						<PlusIcon aria-hidden />
						<Text tag="span" size="inherit" type="inherit" weight="medium" lineHeight="tight">
							{formatCreate(getCreateOptionValue(item))}
						</Text>
					</span>
				)
			}

			// A custom renderer takes over entirely, highlighting included.
			if (renderItem) return renderItem(item)

			/* The same weight as a base `ComboboxItem`, so both read as one control. */
			const label = getItemLabel(item)
			if (highlightMatch && trimmedSearch) {
				return <HighlightedText text={label} highlight={trimmedSearch} />
			}
			return (
				<Text tag="span" size="inherit" type="inherit" lineHeight="tight">
					{label}
				</Text>
			)
		},
		// The formatter, not the whole `copy` object — that one is new every render.
		[formatCreate, getItemLabel, highlightMatch, renderItem, trimmedSearch],
	)

	const itemToStringLabel = useCallback(
		(item: T) => (isCreateOption(item) ? getCreateOptionValue(item) : getItemLabel(item)),
		[getItemLabel],
	)

	const getItemReactKey = useCallback(
		(item: T) =>
			// Namespaced, so a create row for "blue" cannot collide with an item keyed "blue".
			isCreateOption(item) ? `__create__:${getCreateOptionValue(item)}` : String(getKey(item)),
		[getKey],
	)

	return {
		strings: copy,
		getKey,
		trimmedSearch,
		listRef,
		baseItems,
		allItems,
		groupedItems,
		createOptionItem,
		showStatus,
		showEmpty,
		showCreateOption,
		renderItemContent,
		itemToStringLabel,
		getItemReactKey,
		handleScroll,
	}
}
