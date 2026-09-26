/**
 * useGlobalSearch: the palette's active row, active tab and key handling. `flat` is both
 * what the rows render and what the keys walk, so the highlight and Enter always agree.
 * Handlers close over values (or use updaters) instead of reading refs written in render.
 */
import { useCallback, useMemo, useState, type KeyboardEvent } from "react"

import type { GlobalSearchResult } from "./global-search.types"

export interface UseGlobalSearchOptions<TGroup extends string = string> {
	results: readonly GlobalSearchResult<TGroup>[]
	query: string
	onResultSelect?: (result: GlobalSearchResult<TGroup>) => void
	onClose?: () => void
}

export interface UseGlobalSearchResult<TGroup extends string = string> {
	/** Results bucketed by group, in first-seen order. */
	grouped: Record<string, GlobalSearchResult<TGroup>[]>
	/** One per tab key, plus `all`. */
	tabCounts: Record<string, number>
	activeTab: "all" | TGroup
	/** Also resets the highlight to the top. */
	setActiveTab: (tab: "all" | TGroup) => void
	/** `grouped`, narrowed to the active tab. */
	visibleGrouped: Record<string, GlobalSearchResult<TGroup>[]>
	/** Exactly what is rendered, in render order. The keys walk this. */
	flat: GlobalSearchResult<TGroup>[]
	activeIndex: number
	setActiveIndex: (index: number) => void
	setActiveById: (id: string) => void
	/** Bind to the input. Arrows move, Enter opens, Escape closes. */
	onKeyDown: (event: KeyboardEvent) => void
	selectActive: () => void
}

export function useGlobalSearch<TGroup extends string = string>({
	results,
	query,
	onResultSelect,
	onClose,
}: UseGlobalSearchOptions<TGroup>): UseGlobalSearchResult<TGroup> {
	const [activeTab, setActiveTabState] = useState<"all" | TGroup>("all")
	const [requestedIndex, setActiveIndex] = useState(0)

	/*
	 * A new query resets both tab and highlight. Adjusted during render, so the first render
	 * for a new query already shows "all".
	 */
	const [lastQuery, setLastQuery] = useState(query)
	if (query !== lastQuery) {
		setLastQuery(query)
		setActiveTabState("all")
		setActiveIndex(0)
	}

	const grouped = useMemo(() => {
		const buckets: Record<string, GlobalSearchResult<TGroup>[]> = Object.create(null)
		for (const result of results) (buckets[result.group] ??= []).push(result)
		return buckets
	}, [results])

	const tabCounts = useMemo(() => {
		const counts: Record<string, number> = Object.assign(Object.create(null), { all: results.length })
		for (const [key, bucket] of Object.entries(grouped)) counts[key] = bucket.length
		return counts
	}, [grouped, results.length])

	const visibleGrouped = useMemo(() => {
		if (activeTab === "all") return grouped
		const bucket = grouped[activeTab]
		return bucket ? { [activeTab]: bucket } : {}
	}, [activeTab, grouped])

	const flat = useMemo(
		() => Object.values(visibleGrouped).flat(),
		[visibleGrouped],
	)

	const activeIndex = Math.max(0, Math.min(requestedIndex, flat.length - 1))
	if (requestedIndex !== activeIndex) setActiveIndex(activeIndex)

	const setActiveTab = useCallback((tab: "all" | TGroup) => {
		setActiveTabState(tab)
		setActiveIndex(0)
	}, [])

	const setActiveById = useCallback(
		(id: string) => {
			const index = flat.findIndex((result) => result.id === id)
			if (index >= 0) setActiveIndex(index)
		},
		[flat],
	)

	const selectActive = useCallback(() => {
		const result = flat[activeIndex]
		if (result) onResultSelect?.(result)
	}, [activeIndex, flat, onResultSelect])

	const onKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.nativeEvent.isComposing || event.keyCode === 229) return
			if (event.key === "ArrowDown") {
				event.preventDefault()
				setActiveIndex((index) => Math.max(0, Math.min(index + 1, flat.length - 1)))
			} else if (event.key === "ArrowUp") {
				event.preventDefault()
				setActiveIndex((index) => Math.max(index - 1, 0))
			} else if (event.key === "Enter") {
				const result = flat[activeIndex]
				if (result) {
					// Only with something to open; otherwise Enter belongs to the surrounding form.
					event.preventDefault()
					onResultSelect?.(result)
				}
			} else if (event.key === "Escape") {
				onClose?.()
			}
		},
		[activeIndex, flat, onClose, onResultSelect],
	)

	return {
		grouped, tabCounts, activeTab, setActiveTab, visibleGrouped, flat,
		activeIndex, setActiveIndex, setActiveById, onKeyDown, selectActive,
	}
}
