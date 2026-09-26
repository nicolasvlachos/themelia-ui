/**
 * Sticks the transcript to the newest message until the reader scrolls up: new content
 * scrolls only while the reader is at the bottom. The threshold is non-zero because
 * sub-pixel heights leave the position a pixel or two off the true bottom.
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

export interface UseAiChatScrollOptions {
	/** Distance from the bottom, in pixels, still counted as "at the bottom". */
	threshold?: number
	/** Re-runs the auto-scroll when this changes — normally the message count. */
	dependency?: unknown
	disableAutoScroll?: boolean
}

export interface UseAiChatScrollResult {
	/** The scroll viewport. */
	containerRef: RefObject<HTMLDivElement | null>
	/** A sentinel at the very end of the content. */
	endRef: RefObject<HTMLDivElement | null>
	isAtBottom: boolean
	scrollToBottom: (behavior?: ScrollBehavior) => void
}

export function useAiChatScroll({
	threshold = 80,
	dependency,
	disableAutoScroll = false,
}: UseAiChatScrollOptions = {}): UseAiChatScrollResult {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const endRef = useRef<HTMLDivElement | null>(null)
	const [isAtBottom, setIsAtBottom] = useState(true)

	/* Scrolls the container, not `scrollIntoView`, which would also scroll every ancestor (the page). */
	const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
		const element = containerRef.current
		if (!element) return
		element.scrollTo({ top: element.scrollHeight, behavior })
	}, [])

	useEffect(() => {
		const element = containerRef.current
		if (!element) return

		const onScroll = () => {
			const distance = element.scrollHeight - element.clientHeight - element.scrollTop
			setIsAtBottom(distance <= threshold)
		}

		onScroll()
		element.addEventListener("scroll", onScroll, { passive: true })
		return () => element.removeEventListener("scroll", onScroll)
	}, [threshold])

	/* A ref, not a dependency: the effect fires on content changes only, not on reaching the bottom. */
	const pinned = useRef(isAtBottom)
	useEffect(() => {
		pinned.current = isAtBottom
	}, [isAtBottom])

	useEffect(() => {
		if (disableAutoScroll || !pinned.current) return
		/* Next frame: the new message is not laid out yet when the effect runs. */
		const frame = requestAnimationFrame(() => scrollToBottom("auto"))
		return () => cancelAnimationFrame(frame)
	}, [dependency, disableAutoScroll, scrollToBottom])

	return { containerRef, endRef, isAtBottom, scrollToBottom }
}
