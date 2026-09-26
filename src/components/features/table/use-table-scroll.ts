/**
 * Horizontal-overflow state for a table and the nudges that move it, exported so a custom
 * toolbar uses the same answer to "can this scroll right" as the built-in one.
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { readScrollEdges } from "@/lib/scroll-edges"

const DEFAULT_STEP = 300

/**
 * The scrollable element inside the wrapper: the Table primitive's `.table--container`
 * (the class is the contract the primitive publishes).
 */
export function getDataTableScrollContainer(
	tableArea: HTMLDivElement | null,
): HTMLDivElement | null {
	return tableArea?.querySelector<HTMLDivElement>(".table--container") ?? null
}

export interface UseDataTableScrollStateResult {
	canScrollLeft: boolean
	canScrollRight: boolean
	scrollBy: (delta: number) => void
	scrollLeft: () => void
	scrollRight: () => void
}

export function useDataTableScrollState(
	tableAreaRef: RefObject<HTMLDivElement | null>,
	options: { stepPx?: number; deps?: readonly unknown[] } = {},
): UseDataTableScrollStateResult {
	const { stepPx = DEFAULT_STEP, deps = [] } = options
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)
	const frame = useRef(0)

	/* A ref: the listeners attach inside a timeout, after the effect's own return has run. */
	const cleanup = useRef<(() => void) | null>(null)

	const measure = useCallback(() => {
		const element = getDataTableScrollContainer(tableAreaRef.current)
		if (!element) {
			setCanScrollLeft(false)
			setCanScrollRight(false)
			return
		}
		/* The arrows are physical: in RTL the start is the right-hand end. */
		const { start, end } = readScrollEdges(element)
		const rtl = getComputedStyle(element).direction === "rtl"
		setCanScrollLeft(rtl ? end : start)
		setCanScrollRight(rtl ? start : end)
	}, [tableAreaRef])

	useEffect(() => {
		// Deferred a tick: the Table's container does not exist on the first pass.
		const timer = window.setTimeout(() => {
			const element = getDataTableScrollContainer(tableAreaRef.current)
			if (!element) return

			measure()

			// Throttled to animation frames.
			const onScroll = () => {
				cancelAnimationFrame(frame.current)
				frame.current = requestAnimationFrame(measure)
			}

			element.addEventListener("scroll", onScroll, { passive: true })

			const observer = new ResizeObserver(measure)
			observer.observe(element)
			// The inner table too: showing or hiding a column changes content width only.
			if (element.firstElementChild) observer.observe(element.firstElementChild)

			cleanup.current = () => {
				element.removeEventListener("scroll", onScroll)
				cancelAnimationFrame(frame.current)
				observer.disconnect()
			}
		}, 0)

		return () => {
			window.clearTimeout(timer)
			cleanup.current?.()
			cleanup.current = null
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` is the documented escape hatch for a consumer whose layout changes outside this hook's knowledge.
	}, [measure, tableAreaRef, ...deps])

	const scrollBy = useCallback(
		(delta: number) => {
			getDataTableScrollContainer(tableAreaRef.current)?.scrollBy({
				left: delta,
				behavior: "smooth",
			})
		},
		[tableAreaRef],
	)

	const scrollLeft = useCallback(() => scrollBy(-stepPx), [scrollBy, stepPx])
	const scrollRight = useCallback(() => scrollBy(stepPx), [scrollBy, stepPx])

	return { canScrollLeft, canScrollRight, scrollBy, scrollLeft, scrollRight }
}
