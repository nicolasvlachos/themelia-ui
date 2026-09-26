import { useEffect, useRef, type RefObject } from "react"

/**
 * The latest value, readable from a callback that must stay stable. Assigned after
 * commit, not during render, so read it only from events and effects, never in render.
 */
export function useLatest<T>(value: T): RefObject<T> {
	const ref = useRef(value)

	useEffect(() => {
		ref.current = value
	})

	return ref
}
