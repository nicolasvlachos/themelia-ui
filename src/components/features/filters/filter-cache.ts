/**
 * The `async_select` state that must outlive the popover: query results (so reopening does
 * not refetch) and the labels of chosen values (so a pill can name `usr_8812`).
 *
 * Owned, not module-scoped: one per `FilterProvider` by default, or created and passed in
 * to survive navigation — so separate roots, users and tests never share entries.
 * Entries schedule their own expiry, so a read is a plain lookup: present means fresh.
 */
import { createContext, useContext } from "react"

import type { FilterOption } from "./filters.types"

export interface FilterCache {
	/** Cached options for a `(filter, query)` key, or `undefined` when there are none. */
	getOptions(key: string): FilterOption[] | undefined
	/** Remember a query's options and schedule their expiry `staleTime` ms from now. */
	setOptions(key: string, options: FilterOption[], staleTime: number): void
	/** Forget one query's options — what `refetch` does before asking again. */
	deleteOptions(key: string): void
	/** The option behind a value a pill is displaying, if this cache ever saw it. */
	getLabel(filterKey: string, value: string): FilterOption | undefined
	/** Remember the labels in a result set. Returns whether any were new, so callers can skip re-rendering pills. */
	rememberLabels(filterKey: string, options: FilterOption[]): boolean
	/** Drop everything and cancel every pending expiry. */
	clear(): void
}

/**
 * A cache with its own lifetime.
 *
 * ```tsx
 * // One cache for the whole session, so filters survive navigation:
 * const cache = useMemo(() => createFilterCache(), [])
 * <FilterProvider cache={cache} …>
 * ```
 *
 * Passing none is the ordinary case — `FilterProvider` makes one per mount.
 */
export function createFilterCache(): FilterCache {
	const options = new Map<string, FilterOption[]>()
	const labels = new Map<string, Map<string, FilterOption>>()
	const expiries = new Map<string, ReturnType<typeof setTimeout>>()

	const cancel = (key: string) => {
		const timer = expiries.get(key)
		if (timer !== undefined) {
			clearTimeout(timer)
			expiries.delete(key)
		}
	}

	return {
		getOptions: (key) => options.get(key),

		setOptions(key, value, staleTime) {
			cancel(key)
			options.set(key, value)

			/* Non-finite or non-positive means never expire (`setTimeout(fn, Infinity)` fires immediately). */
			if (!Number.isFinite(staleTime) || staleTime <= 0) return

			const timer = setTimeout(() => {
				options.delete(key)
				expiries.delete(key)
			}, staleTime)
			/* Node: do not keep the process alive for an expiry timer. Browsers have no `unref`. */
			timer.unref?.()
			expiries.set(key, timer)
		},

		deleteOptions(key) {
			cancel(key)
			options.delete(key)
		},

		getLabel: (filterKey, value) => labels.get(filterKey)?.get(value),

		rememberLabels(filterKey, incoming) {
			let bucket = labels.get(filterKey)
			if (!bucket) {
				bucket = new Map()
				labels.set(filterKey, bucket)
			}

			let added = false
			for (const option of incoming) {
				if (!bucket.has(option.value)) added = true
				bucket.set(option.value, option)
			}
			return added
		},

		clear() {
			for (const key of [...expiries.keys()]) cancel(key)
			options.clear()
			labels.clear()
		},
	}
}

/** The cache the nearest provider owns. `null` outside one, which is a valid place to be. */
export const FilterCacheContext = createContext<FilterCache | null>(null)

/** The filter cache in scope, or `null` (then `useAsyncOptions` makes its own short-lived one). */
export function useFilterCache(): FilterCache | null {
	return useContext(FilterCacheContext)
}
