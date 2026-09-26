/**
 * The inline search boxes. A `search` filter never becomes a pill; it debounces locally so
 * the URL is not rewritten on every keystroke.
 */
import { SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Input } from "@/components/base/text-inputs"
import { useDebounce } from "@/hooks/use-debounce"

import { useFilterDraftReset, useFilters } from "./filter-store"
import type { FilterConfig } from "./filters.types"
import styles from "./filters.module.css"
import { useSyncedState } from "@/hooks/use-synced-state"
import { cx } from "@/lib/cx"

export interface SearchFilterProps {
	filter: FilterConfig
	className?: string
}

export function SearchFilter({ filter, className }: SearchFilterProps) {
	const { getFilterValue, setFilterValue, isNavigating, strings } = useFilters()
	const applied = getFilterValue(filter.key)[0] ?? ""

	/* Re-seeded only when `applied` changes (clear, saved tab, Back), so typing's own echo never interrupts. */
	const [draft, setDraft] = useSyncedState(applied)
	const reset = useFilterDraftReset()
	const [lastReset, setLastReset] = useState(reset)
	if (reset !== lastReset) {
		setLastReset(reset)
		setDraft(applied)
	}
	const debounced = useDebounce(draft, filter.delay ?? 300)

	useEffect(() => {
		// Skip while the debounced value lags a re-seeded draft, so a stale value cannot overwrite it.
		if (isNavigating || debounced !== draft) return
		const next = debounced.trim() ? debounced : ""
		if (next === applied) return
		setFilterValue(filter.key, next ? [next] : [])
	}, [applied, debounced, draft, filter.key, isNavigating, setFilterValue])

	return (
		<Input
			value={draft}
			disabled={isNavigating}
			onChange={(event) => setDraft(event.target.value)}
			placeholder={filter.placeholder ?? strings.searchPlaceholder(filter.label.toLowerCase())}
			aria-label={filter.label}
			startIcon={SearchIcon}
			clearable
			onClear={() => setDraft("")}
			/* The cap class always applies; the caller's class layers on top of it. */
			className={cx("search-filter--component", styles.searchInput, className)}
		/>
	)
}

export interface SearchFiltersProps {
	filters: FilterConfig[]
	className?: string
}

export function SearchFilters({ filters, className }: SearchFiltersProps) {
	if (filters.length === 0) return null
	return (
		<>
			{filters.map((filter) => (
				<SearchFilter key={filter.key} filter={filter} className={cx("search-filters--component", className)} />
			))}
		</>
	)
}
