/**
 * useAsyncPreview — fetching tied to a popover's open state. Handles:
 * - abort: closing aborts the request (the consumer's fetch gets the signal);
 * - races: only the newest request id may write state;
 * - repeats: a module cache keyed by `cacheKey`, with a staleness window.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type {
	AsyncPreviewLoadingState, AsyncPreviewReason, AsyncPreviewRootProps,
	AsyncPreviewState, AsyncPreviewStatus,
} from "./async-preview.types"

interface CacheEntry {
	timestamp: number
	data: unknown
	status: "success" | "empty"
	meta: Record<string, unknown>
}

/* Module scope, so the cache survives unmounts and is shared across tables. */
const cache = new Map<string, CacheEntry>()

/** Clears one key, or everything. Call it after a mutation invalidates a record. */
export function clearAsyncPreviewCache(cacheKey?: string) {
	if (cacheKey) cache.delete(cacheKey)
	else cache.clear()
}

function readCache(key: string | undefined, staleTime: number): CacheEntry | undefined {
	if (!key) return undefined
	const entry = cache.get(key)
	if (!entry) return undefined
	// Evicted on read rather than on a timer: nothing else wakes up to do it.
	if (Date.now() - entry.timestamp > staleTime) {
		cache.delete(key)
		return undefined
	}
	return entry
}

export interface UseAsyncPreviewOptions<TData, TContext = unknown, TType extends string = string>
	extends Omit<AsyncPreviewRootProps<TData, TContext, TType>, "children" | "strings"> {}

export type UseAsyncPreviewReturn<TData, TContext = unknown, TType extends string = string> =
	AsyncPreviewState<TData, TContext, TType> & { setOpen: (open: boolean) => void }

export function useAsyncPreview<TData, TContext = unknown, TType extends string = string>(
	options: UseAsyncPreviewOptions<TData, TContext, TType>,
): UseAsyncPreviewReturn<TData, TContext, TType> {
	const {
		type,
		context,
		cacheKey,
		cachePolicy = "cache-first",
		staleTime = 300_000,
		open: openProp,
		defaultOpen = false,
		onOpenChange,
		onBeforeShow,
		onData,
		onError,
		onSettled,
		onRefresh,
	} = options

	/* `hasOwnProperty`: `data={null}` is a static source with an empty result, not a missing prop. */
	const isStatic = Object.prototype.hasOwnProperty.call(options, "data")
	const staticData = isStatic ? ((options.data ?? null) as TData | null) : null
	const onShow = isStatic ? undefined : options.onShow

	const isControlled = openProp !== undefined
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
	const open = openProp ?? uncontrolledOpen

	const initial = readCache(cacheKey, staleTime)
	const [data, setData] = useState<TData | null>(
		() => (initial?.status === "success" ? (initial.data as TData) : null),
	)
	const [status, setStatus] = useState<AsyncPreviewStatus>(() => initial?.status ?? "idle")
	const [error, setError] = useState<unknown>(null)
	const [loading, setLoading] = useState<AsyncPreviewLoadingState>(false)
	const [meta, setMeta] = useState<Record<string, unknown>>(() => initial?.meta ?? {})
	const [cached, setCached] = useState(() => initial !== undefined)

	const resolvedData = isStatic ? staticData : data
	const resolvedStatus: AsyncPreviewStatus = isStatic
		? staticData === null ? "empty" : "success"
		: status

	const abortRef = useRef<AbortController | null>(null)
	/** Monotonic. Only the newest request may write state. */
	const requestRef = useRef(0)
	const prefetchedRef = useRef(false)
	const wasOpenRef = useRef(false)
	const metaRef = useRef(meta)
	const openedForRef = useRef<string | null>(null)
	const stateRef = useRef<AsyncPreviewState<TData, TContext, TType> | null>(null)

	const setOpen = useCallback(
		(next: boolean) => {
			if (!isControlled) setUncontrolledOpen(next)
			const state = stateRef.current
			if (state) onOpenChange?.(next, { ...state, open: next })
		},
		[isControlled, onOpenChange],
	)

	const run = useCallback(
		async (reason: AsyncPreviewReason) => {
			if (isStatic || !onShow) return
			const entry = readCache(cacheKey, staleTime)
			// Opening consumes the hover request, including when caching is disabled.
			if (reason === "open" && prefetchedRef.current) {
				prefetchedRef.current = false
				const ready = stateRef.current?.status === "success" || stateRef.current?.status === "empty"
				if (abortRef.current || (ready && (!cacheKey || entry))) return
			}

			// A refresh always goes to the network; that is what refreshing means.
			if (reason !== "refresh" && entry && cachePolicy === "cache-first") {
				setCached(true)
				setError(null)
				metaRef.current = entry.meta
				setMeta(entry.meta)
				setData(entry.status === "success" ? (entry.data as TData) : null)
				setStatus(entry.status)
				setLoading(false)
				return
			}

			abortRef.current?.abort()
			const controller = new AbortController()
			abortRef.current = controller
			const requestId = ++requestRef.current

			metaRef.current = {}
			setMeta({})
			setCached(false)
			setError(null)
			setStatus("loading")
			setLoading({})

			/** The race guard. A stale response reaches here and writes nothing. */
			const ifCurrent = (apply: () => void) => {
				if (requestRef.current !== requestId || controller.signal.aborted) return
				apply()
			}

			const snapshot = (patch: Partial<AsyncPreviewState<TData, TContext, TType>>) =>
				stateRef.current ? { ...stateRef.current, ...patch } : null

			const before = snapshot({ error: null, loading: {}, status: "loading", cached: false })
			try {
				if (before) {
					onBeforeShow?.(before)
					if (reason === "refresh") onRefresh?.(before)
				}
				const result = await onShow({
					type,
					context,
					signal: controller.signal,
					reason,
					cached: entry !== undefined,
					setLoading: (next) => ifCurrent(() => setLoading(next)),
					setMeta: (next) =>
						ifCurrent(() => {
							const merged = { ...metaRef.current, ...next }
							metaRef.current = merged
							setMeta(merged)
						}),
				})

				ifCurrent(() => {
					// `null` and `undefined` both mean "no record", not "failed".
					const nextStatus = result == null ? ("empty" as const) : ("success" as const)
					const nextData = nextStatus === "success" ? (result as TData) : null

					setData(nextData)
					setStatus(nextStatus)
					setLoading(false)
					setError(null)
					setCached(false)

					if (cacheKey) {
						cache.set(cacheKey, {
							timestamp: Date.now(),
							data: nextData,
							status: nextStatus,
							meta: metaRef.current,
						})
					}

					const settled = snapshot({
						data: nextData,
						error: null,
						loading: false,
						status: nextStatus,
						meta: metaRef.current,
						cached: false,
					})
					if (nextData !== null && settled) onData?.(nextData, settled)
					if (settled) onSettled?.(settled)
				})
			} catch (thrown) {
				// An abort is this hook's own doing, not an error the consumer should see.
				if (controller.signal.aborted) return
				ifCurrent(() => {
					setError(thrown)
					setStatus("error")
					setLoading(false)
					const settled = snapshot({ error: thrown, loading: false, status: "error", cached: false })
					if (settled) {
						onError?.(thrown, settled)
						onSettled?.(settled)
					}
				})
			} finally {
				if (requestRef.current === requestId && abortRef.current === controller) {
					abortRef.current = null
				}
			}
		},
		[cacheKey, cachePolicy, context, isStatic, onBeforeShow, onData, onError, onRefresh, onSettled, onShow, staleTime, type],
	)

	const refresh = useCallback(() => void run("refresh"), [run])
	const close = useCallback(() => setOpen(false), [setOpen])

	const prefetch = useCallback(() => {
		if (isStatic || prefetchedRef.current) return
		prefetchedRef.current = true
		void run("prefetch")
	}, [isStatic, run])

	const state = useMemo<AsyncPreviewState<TData, TContext, TType>>(
		() => ({
			type, context, data: resolvedData, error, loading, status: resolvedStatus,
			meta, open, cached, refresh, prefetch, close,
		}),
		[cached, close, context, error, loading, meta, open, prefetch, refresh, resolvedData, resolvedStatus, type],
	)
	/* Refs synced in an effect (not during render), declared first so later effects see them current. */
	useEffect(() => {
		stateRef.current = state
		metaRef.current = meta
	})

	// Changing records invalidates both a visible fetch and a closed hover prefetch.
	useEffect(() => {
		return () => {
			abortRef.current?.abort()
			abortRef.current = null
			requestRef.current += 1
			openedForRef.current = null
			prefetchedRef.current = false
		}
	}, [cacheKey, type, isStatic, staleTime])

	useEffect(() => {
		const entry = readCache(cacheKey, staleTime)
		// oxlint-disable-next-line react/set-state-in-effect -- record identity owns the request/cache lifecycle
		setData(entry?.status === "success" ? entry.data as TData : null)
		setStatus(entry?.status ?? "idle")
		setLoading(false)
		setError(null)
		setCached(!!entry)
		metaRef.current = entry?.meta ?? {}
		setMeta(metaRef.current)
	}, [cacheKey, type, isStatic, staleTime])

	// Only an actual open → closed transition cancels. A closed hover may prefetch.
	useEffect(() => {
		if (!open || isStatic) return
		return () => {
			abortRef.current?.abort()
			abortRef.current = null
			requestRef.current += 1
			openedForRef.current = null
			prefetchedRef.current = false
		}
	}, [open, isStatic])

	useEffect(() => {
		const justClosed = wasOpenRef.current && !open
		wasOpenRef.current = open
		if (!open) {
			openedForRef.current = null
			if (justClosed) {
				// oxlint-disable-next-line react/set-state-in-effect -- cancel the visible request while leaving closed hover prefetches alone
				setLoading(false)
				setStatus((current) => current === "loading" ? "idle" : current)
			}
			return
		}
		if (isStatic) return
		const key = cacheKey ?? type
		if (openedForRef.current === key) return
		openedForRef.current = key
		void run("open")
	}, [cacheKey, isStatic, open, run, type])

	return { ...state, setOpen }
}
