/**
 * useAsyncOptions — the option list for an `async_select`, cached by `(filter, query)` for
 * `staleTime` in the nearest `FilterProvider`'s cache (or the hook's own outside one).
 *
 * Each keystroke aborts the previous request, and a request id guards the race where a
 * response is already in flight.
 */
import { useCallback, useEffect, useRef, useState } from "react"

import { useDebounce } from "@/hooks/use-debounce"

import { createFilterCache, useFilterCache, type FilterCache } from "./filter-cache"
import type { FilterConfig, FilterErrorHandler, FilterOption } from "./filters.types"
import { useLatest } from "@/hooks/use-latest"

export interface UseAsyncOptionsResult {
	options: FilterOption[]
	/** The first load, with nothing to show yet. */
	isLoading: boolean
	/** Any load, including a refresh over results already on screen. */
	isFetching: boolean
	isError: boolean
	refetch: () => void
	/** The query is too short to search on. */
	isBelowMinQuery: boolean
	minQueryLength: number
}

export function useAsyncOptions(
	filter: FilterConfig,
	search: string,
	isActive: boolean,
	options: { onError?: FilterErrorHandler } = {},
): UseAsyncOptionsResult {
	const config = filter.asyncConfig
	const onErrorRef = useLatest(options.onError)

	/* The provider's cache, or the hook's own in lazy state (a memo could be discarded; a ref would be written in render). */
	const provided = useFilterCache()
	const [fallback] = useState(createFilterCache)
	const cache: FilterCache = provided ?? fallback

	const debounced = useDebounce(search, config?.debounceMs ?? filter.delay ?? 300)
	const query = (debounced ?? "").trim()

	const limit = config?.limit ?? 10
	const minQueryLength = config?.minQueryLength ?? 0
	const preload = config?.preload ?? true
	const staleTime = config?.staleTime ?? 60_000

	const isBelowMinQuery = query.length > 0 && query.length < minQueryLength
	const shouldFetch =
		isActive && !!config && !isBelowMinQuery && (query.length >= minQueryLength) &&
		(query.length > 0 || preload)

	const cacheKey = `${filter.key}::${query}`

	/** Bumped by `refetch`, which deletes the entry and asks again. */
	const [attempt, setAttempt] = useState(0)

	/* A plain lookup, no memo and no clock: entries expire themselves, so presence means fresh. */
	const cached = cache.getOptions(cacheKey)

	const [fetched, setResult] = useState<FilterOption[]>(cached ?? [])
	const [fetching, setIsFetching] = useState(false)
	const [failed, setIsError] = useState(false)

	/* Derived, not corrected in an effect: a cache hit needs no state write, so no frame shows a wrong answer. */
	const result = cached ?? fetched
	const isFetching = fetching && shouldFetch && !!config && !cached
	const isError = failed && !cached

	/* Monotonic: a response from a superseded request is dropped. */
	const requestId = useRef(0)

	useEffect(() => {
		if (!shouldFetch || !config) return

		/* A fresh cache entry is already the answer, through `cached` above. */
		if (cached) return

		const id = ++requestId.current
		const controller = new AbortController()
		// oxlint-disable-next-line react/set-state-in-effect -- the effect owns a fetch with an AbortController and a monotonic request id; the flag reports the network, not a derivable value
		setIsFetching(true)
		setIsError(false)

		config
			.fetcher({ query, limit, signal: controller.signal })
			.then((items) => {
				if (id !== requestId.current) return
				const mapped = items.map((item) => config.mapToOption(item))
				cache.setOptions(cacheKey, mapped, staleTime)
				setResult(mapped)
			})
			.catch((error: unknown) => {
				if (id !== requestId.current) return
				// An abort is this hook's own doing, not a failure to report.
				if (error instanceof Error && error.name === "AbortError") return
				setIsError(true)
				setResult([])
				onErrorRef.current?.(error, { phase: "fetch-options", filterKey: filter.key })
			})
			.finally(() => {
				if (id === requestId.current) setIsFetching(false)
			})

		return () => controller.abort()
	}, [attempt, cache, cached, cacheKey, config, filter.key, limit, query, shouldFetch, staleTime, onErrorRef])

	const refetch = useCallback(() => {
		cache.deleteOptions(cacheKey)
		setAttempt((value) => value + 1)
	}, [cache, cacheKey])

	return {
		options: result,
		isLoading: isFetching && result.length === 0,
		isFetching,
		isError,
		refetch,
		isBelowMinQuery,
		minQueryLength,
	}
}
