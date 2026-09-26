import { useEffect, useState } from "react"

/** The kit-wide debounce window, in milliseconds, so typed input feels the same everywhere. */
export const DEFAULT_DEBOUNCE_MS = 300

/** Debounces a VALUE. For debouncing a callback, use `useDebouncedCallback`. */
export function useDebounce<T>(value: T, delay: number = DEFAULT_DEBOUNCE_MS): T {
	const [debounced, setDebounced] = useState<T>(value)

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay)
		return () => clearTimeout(timer)
	}, [value, delay])

	return debounced
}
