import { useCallback, useEffect, useMemo, useRef } from "react"

import { DEFAULT_DEBOUNCE_MS } from "./use-debounce"

export interface DebouncedCallback<TArgs extends unknown[]> {
	(...args: TArgs): void
	/** Drops a scheduled invocation. Safe to call when nothing is pending. */
	cancel: () => void
	/** Runs a scheduled invocation now. No-op when nothing is pending. */
	flush: () => void
}

/**
 * Debounces a callback with latest-wins semantics and a stable identity: the returned
 * function never changes across renders, even when `callback` or `delay` does, so it is
 * safe in a dependency array. Fires the newest callback with the newest arguments;
 * pending work is dropped on unmount.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
	callback: (...args: TArgs) => void,
	delay: number = DEFAULT_DEBOUNCE_MS,
): DebouncedCallback<TArgs> {
	const callbackRef = useRef(callback)
	const delayRef = useRef(delay)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const argsRef = useRef<TArgs | null>(null)

	useEffect(() => {
		callbackRef.current = callback
		delayRef.current = delay
	}, [callback, delay])

	const cancel = useCallback(() => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		argsRef.current = null
	}, [])

	const invokePending = useCallback(() => {
		const args = argsRef.current
		argsRef.current = null
		timeoutRef.current = null
		if (args) callbackRef.current(...args)
	}, [])

	const flush = useCallback(() => {
		if (timeoutRef.current === null) return
		clearTimeout(timeoutRef.current)
		invokePending()
	}, [invokePending])

	useEffect(() => cancel, [cancel])

	return useMemo(() => {
		const debounced = ((...args: TArgs) => {
			argsRef.current = args
			if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
			timeoutRef.current = setTimeout(invokePending, delayRef.current)
		}) as DebouncedCallback<TArgs>
		debounced.cancel = cancel
		debounced.flush = flush
		return debounced
	}, [cancel, flush, invokePending])
}
