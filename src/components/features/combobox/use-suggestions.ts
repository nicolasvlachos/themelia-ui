/**
 * useSuggestions — the fetch lifecycle for an async list: debounce, abort, and superseded
 * responses writing nothing. Runs `ResourceCombobox` and `SuggestionsCombobox`; public for
 * non-combobox surfaces too.
 *
 * `query`, `value` and `open` are each independently controllable. Results and errors are
 * stored with the query that produced them: an unanswered query reports loading (not
 * empty), and an error hides as soon as the query changes.
 */
import { useCallback, useEffect, useRef, useState } from "react"

import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { DEFAULT_DEBOUNCE_MS } from "@/hooks/use-debounce"

export type MaybePromise<T> = T | Promise<T>

export interface SuggestionsFetchContext {
	/** Aborted when a newer query starts or the surface unmounts. Pass it to fetch. */
	signal?: AbortSignal
}

export interface UseSuggestionsConfig<T> {
	fetchData: (query: string, context?: SuggestionsFetchContext) => MaybePromise<T[]>
	/**
	 * Characters required before a request is issued, not counting surrounding whitespace.
	 * Defaults to 1.
	 */
	minQueryLength?: number
	/** The quiet period that collapses a burst of typing into one request. Defaults to 300. */
	debounceMs?: number
	/**
	 * A further wait before the fetcher runs, after the loading state is showing (unlike
	 * `debounceMs`, which delays deciding to fetch). For rate-limited endpoints.
	 */
	requestDelay?: number
	/** Fetches the empty query, so there is something before typing. Not debounced. */
	preload?: boolean
	query?: string
	defaultQuery?: string
	onQueryChange?: (query: string) => void
	/** `null` is an explicit empty selection; `undefined` means uncontrolled. */
	value?: T | null
	defaultValue?: T | null
	onValueChange?: (value: T | null) => void
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	/** Aborts never reach this. */
	onError?: (error: unknown, query: string) => void
}

export interface UseSuggestionsResult<T> {
	/** The latest answered results. Kept while the next query loads; empty below the threshold. */
	items: T[]
	/** True from the moment a qualifying query is typed until it is answered — the debounce included. */
	isLoading: boolean
	error: unknown | null
	isError: boolean
	retry: () => void
	query: string
	setQuery: (value: string) => void
	value: T | null
	setValue: (value: T | null) => void
	open: boolean
	setOpen: (value: boolean) => void
}

/** An abort is this hook's own doing, never a failure the consumer should hear about. */
function isAbortError(error: unknown) {
	return Boolean(error && (error as { name?: string }).name === "AbortError")
}

/** A cancellable wait, so `requestDelay` does not outlive the query that started it. */
function wait(ms: number, signal: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) {
			reject(new DOMException("Aborted", "AbortError"))
			return
		}
		const timer = setTimeout(resolve, ms)
		signal.addEventListener("abort", () => {
			clearTimeout(timer)
			reject(new DOMException("Aborted", "AbortError"))
		})
	})
}

/* One shared empty list, so `items` keeps its identity for downstream memos. */
const EMPTY: never[] = []

export function useSuggestions<T>(config: UseSuggestionsConfig<T>): UseSuggestionsResult<T> {
	const {
		fetchData,
		minQueryLength = 1,
		debounceMs = DEFAULT_DEBOUNCE_MS,
		requestDelay = 0,
		preload = false,
		query: controlledQuery,
		defaultQuery = "",
		onQueryChange,
		value: controlledValue,
		defaultValue = null,
		onValueChange,
		open: controlledOpen,
		defaultOpen = false,
		onOpenChange,
		onError,
	} = config

	/* Results and failures are stored with their query; reported state compares it with the current one. */
	const [settled, setSettled] = useState<{ query: string; items: T[] } | null>(null)
	const [failed, setFailed] = useState<{ query: string; error: unknown } | null>(null)
	const [inFlight, setInFlight] = useState(false)
	const [internalQuery, setInternalQuery] = useState(defaultQuery)
	const [internalValue, setInternalValue] = useState<T | null>(defaultValue)
	const [internalOpen, setInternalOpen] = useState(defaultOpen)
	const [retryTick, setRetryTick] = useState(0)
	/** Set by `retry`: the next fetch skips the debounce. */
	const immediate = useRef(false)

	/* Refs, so inline callbacks with a new identity each render do not re-run the fetch effect. */
	const fetchDataRef = useRef(fetchData)
	const onErrorRef = useRef(onError)
	useEffect(() => {
		fetchDataRef.current = fetchData
		onErrorRef.current = onError
	})

	// `null` is a controlled value ("nothing selected"), so value checks `undefined` explicitly.
	const query = controlledQuery ?? internalQuery
	const value = controlledValue !== undefined ? controlledValue : internalValue
	const open = controlledOpen ?? internalOpen

	const setQuery = useCallback(
		(next: string) => {
			if (controlledQuery === undefined) setInternalQuery(next)
			onQueryChange?.(next)
		},
		[controlledQuery, onQueryChange],
	)

	const setValue = useCallback(
		(next: T | null) => {
			if (controlledValue === undefined) setInternalValue(next)
			onValueChange?.(next)
		},
		[controlledValue, onValueChange],
	)

	const setOpen = useCallback(
		(next: boolean) => {
			if (controlledOpen === undefined) setInternalOpen(next)
			onOpenChange?.(next)
		},
		[controlledOpen, onOpenChange],
	)

	const retry = useCallback(() => {
		immediate.current = true
		setRetryTick((tick) => tick + 1)
	}, [])

	/* Empty query: `preload` decides. Typed: the trimmed length vs. the threshold, as the status row counts it. */
	const typed = query.trim().length
	const shouldQuery = typed >= minQueryLength || (preload && typed === 0)

	/* Derived, not cleared in an effect, so an invalidated list never renders for a frame. */
	const answered = settled?.query === query || failed?.query === query
	const items = shouldQuery && settled ? settled.items : EMPTY
	const isLoading = shouldQuery && (inFlight || !answered)
	const error = shouldQuery && failed?.query === query ? failed.error : null

	const runFetch = useDebouncedCallback(
		(nextQuery: string, delay: number, signal: AbortSignal) => {
			void (async () => {
				setInFlight(true)
				setFailed(null)
				try {
					// `requestDelay`, after loading is already showing.
					if (delay > 0) await wait(delay, signal)
					if (signal.aborted) return

					const result = await fetchDataRef.current(nextQuery, { signal })
					// A non-array result is a fetcher bug; render `[]` rather than crash.
					if (!signal.aborted) setSettled({ query: nextQuery, items: Array.isArray(result) ? result : [] })
				} catch (thrown) {
					if (signal.aborted || isAbortError(thrown)) return
					// Stale results beside an error are worse than none.
					setSettled({ query: nextQuery, items: [] })
					setFailed({ query: nextQuery, error: thrown })
					onErrorRef.current?.(thrown, nextQuery)
				} finally {
					if (!signal.aborted) setInFlight(false)
				}
			})()
		},
		debounceMs,
	)

	useEffect(() => {
		if (!shouldQuery) return

		const controller = new AbortController()
		runFetch(query, requestDelay, controller.signal)
		/* Preload and retry skip the debounce: nothing was typed. */
		if (immediate.current || query.trim() === "") runFetch.flush()
		immediate.current = false

		return () => {
			runFetch.cancel()
			controller.abort()
		}
	}, [query, requestDelay, retryTick, runFetch, shouldQuery])

	return {
		items,
		isLoading,
		error,
		isError: error !== null,
		retry,
		query,
		setQuery,
		value,
		setValue,
		open,
		setOpen,
	}
}
