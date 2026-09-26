/**
 * Which ends of a scroller have more content past them. `readScrollEdges` is the one
 * measurement; `useScrollEdges` keeps it current. Offsets are read as magnitudes because
 * `scrollLeft` runs negative in RTL.
 */
import { useCallback, useEffect, useState, type DependencyList, type RefObject } from "react"

import { observeResize } from "./observers"

export type ScrollAxis = "horizontal" | "vertical"

export interface ScrollEdges {
	/** Larger than its box along the axis. */
	overflow: boolean
	/** More content before the visible part. */
	start: boolean
	/** More content after it. */
	end: boolean
}

export function readScrollEdges(element: HTMLElement, axis: ScrollAxis = "horizontal"): ScrollEdges {
	const horizontal = axis === "horizontal"
	const max = horizontal ? element.scrollWidth - element.clientWidth : element.scrollHeight - element.clientHeight
	const offset = Math.abs(horizontal ? element.scrollLeft : element.scrollTop)
	// 1px of slack: a fractional scroll size never reaches an integer offset.
	const overflow = max > 1
	return { overflow, start: overflow && offset > 1, end: overflow && offset < max - 1 }
}

export const sameScrollEdges = (a: ScrollEdges, b: ScrollEdges) =>
	a.overflow === b.overflow && a.start === b.start && a.end === b.end

const NONE: ScrollEdges = { overflow: false, start: false, end: false }

/**
 * The edges of `ref` along `axis`, re-measured on scroll and when the element or its
 * children resize. `deps` are the caller's: whatever changes the content.
 */
export function useScrollEdges(
	ref: RefObject<HTMLElement | null>,
	deps: DependencyList = [],
	axis: ScrollAxis = "horizontal",
): ScrollEdges {
	const [edges, setEdges] = useState<ScrollEdges>(NONE)

	const measure = useCallback(() => {
		const element = ref.current
		if (!element) return
		const next = readScrollEdges(element, axis)
		setEdges((old) => (sameScrollEdges(old, next) ? old : next))
	}, [ref, axis])

	useEffect(() => {
		const element = ref.current
		if (!element) return
		measure()
		element.addEventListener("scroll", measure, { passive: true })
		const stop = observeResize([element, ...element.children], measure)
		return () => {
			element.removeEventListener("scroll", measure)
			stop()
		}
		// oxlint-disable-next-line react-hooks/exhaustive-deps -- `deps` is the caller's: what changes the content
	}, [measure, ...deps])

	return edges
}
