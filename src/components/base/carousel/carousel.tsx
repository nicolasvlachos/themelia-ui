/**
 * Carousel — a native scroll-snap track with controls. JS only reports the current slide
 * and scrolls to a chosen one.
 */
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import {
	useCallback, useEffect, useMemo, useRef, useState,
	type ComponentProps, type ReactNode,
} from "react"

import { Button } from "@/components/base/buttons"
import { cx } from "@/lib/cx"

import { defaultCarouselStrings, type CarouselStrings } from "./carousel.strings"
import styles from "./carousel.module.css"
import { mediaQueryMatches, observeResize } from "@/lib/observers"
import { readScrollEdges } from "@/lib/scroll-edges"
import { CarouselContext, useCarousel } from "./carousel-context"

export type CarouselOrientation = "horizontal" | "vertical"
/** Where the previous/next controls sit. `overlay` floats them over the track's edges. */
export type CarouselControlPlacement = "outside" | "overlay" | "none"

export interface CarouselProps extends Omit<ComponentProps<"div">, "children"> {
	/** The slides, usually `CarouselSlide`s. */
	children: ReactNode
	/** Which axis snaps. */
	orientation?: CarouselOrientation
	/**
	 * Where the previous/next buttons sit: `outside` the track, `overlay` on its edges, or
	 * `none` when you compose your own with `CarouselControl`.
	 */
	controls?: CarouselControlPlacement
	/** Shows the position indicators, and lets them be clicked. */
	showDots?: boolean
	/** `pill` stretches the active indicator instead of only recolouring it. */
	dotStyle?: "dot" | "pill"
	/**
	 * Overrides this carousel's own copy — the region name, the two icon-only controls, and
	 * each pagination dot. It travels through the context, so a control placed with
	 * `CarouselControl` is named by the same override as one the root rendered.
	 */
	strings?: Partial<CarouselStrings>
	/**
	 * Names the region for assistive technology; unset, `strings.label` does. A carousel with
	 * no name is an unexplained scroll box, and a page with two needs two names.
	 */
	label?: string
	/**
	 * Styles the scroll container rather than the outer frame — for a carousel that needs its
	 * own padding inside the clip.
	 */
	viewportClassName?: string
}

/**
 * A native scroll-snap track with controls. Script only reports the current slide and
 * scrolls to a chosen one.
 */
export function Carousel({
	children,
	orientation = "horizontal",
	controls = "outside",
	showDots = false,
	dotStyle = "dot",
	strings,
	label,
	className,
	viewportClassName,
	...props
}: CarouselProps) {
	const copy = useMemo(() => ({ ...defaultCarouselStrings, ...strings }), [strings])
	const viewport = useRef<HTMLDivElement>(null)
	const [index, setIndex] = useState(0)
	const [count, setCount] = useState(0)
	const [atStart, setAtStart] = useState(true)
	const [atEnd, setAtEnd] = useState(false)

	const axis = orientation === "vertical" ? "vertical" : "horizontal"

	/*
	 * The current slide is derived from scroll position, the source of truth: anything else
	 * (focus, hash links, keyboard) may scroll the track.
	 */
	const sync = useCallback(() => {
		const element = viewport.current
		if (!element) return

		const slides = Array.from(element.children) as HTMLElement[]
		setCount(slides.length)

		const edges = readScrollEdges(element, axis)
		setAtStart(!edges.start)
		setAtEnd(!edges.end)

		if (axis === "horizontal") {
			/* The first slide whose start edge is inside the viewport; the start is the right in RTL. */
			const view = element.getBoundingClientRect()
			const rtl = getComputedStyle(element).direction === "rtl"
			const nearest = slides.findIndex((slide) => {
				const box = slide.getBoundingClientRect()
				return rtl ? box.right <= view.right + 1 : box.left >= view.left - 1
			})
			setIndex(nearest === -1 ? Math.max(0, slides.length - 1) : nearest)
			return
		}

		const { scrollTop } = element
		const nearest = slides.findIndex((slide) => slide.offsetTop >= scrollTop - 1)
		setIndex(nearest === -1 ? Math.max(0, slides.length - 1) : nearest)
	}, [axis])

	useEffect(() => {
		const element = viewport.current
		if (!element) return
		sync()

		element.addEventListener("scroll", sync, { passive: true })
		// Added slides or a resized container change what "at the end" means.
		const stopObserving = observeResize([element, ...Array.from(element.children)], sync)

		return () => {
			element.removeEventListener("scroll", sync)
			stopObserving()
		}
	}, [sync, children])

	const scrollToSlide = useCallback(
		(target: number) => {
			const element = viewport.current
			if (!element) return
			const slide = element.children[target] as HTMLElement | undefined
			if (!slide) return
			const behavior = mediaQueryMatches("(prefers-reduced-motion: reduce)") ? "auto" : "smooth"
			if (axis === "vertical") {
				element.scrollTo({ top: slide.offsetTop, behavior })
				return
			}
			/* In RTL scrollLeft runs from 0 into negatives, so align the slide's right edge instead. */
			const rtl = getComputedStyle(element).direction === "rtl"
			const left = rtl
				? element.scrollLeft + (slide.getBoundingClientRect().right - element.getBoundingClientRect().right)
				: slide.offsetLeft
			element.scrollTo({ left, behavior })
		},
		[axis],
	)

	const dots = useMemo(() => Array.from({ length: count }, (_, position) => position), [count])

	const previous = (
		<Button
			tone="neutral"
			appearance="outline"
			iconOnly
			aria-label={copy.previous}
			disabled={atStart}
			onClick={() => scrollToSlide(Math.max(0, index - 1))}
		>
			<ChevronLeftIcon className={styles.directional} />
		</Button>
	)

	const next = (
		<Button
			tone="neutral"
			appearance="outline"
			iconOnly
			aria-label={copy.next}
			disabled={atEnd}
			onClick={() => scrollToSlide(Math.min(count - 1, index + 1))}
		>
			<ChevronRightIcon className={styles.directional} />
		</Button>
	)

	/* Strings travel through context so caller-placed `CarouselControl`s share the root's overrides. */
	const context = useMemo(
		() => ({ index, count, atStart, atEnd, scrollToSlide, strings: copy }),
		[index, count, atStart, atEnd, scrollToSlide, copy],
	)

	return (
		<CarouselContext.Provider value={context}>
		{/* `atStart`/`atEnd` drive the edge fades, from the same state that disables the arrows. */}
		<div
			data-at-start={atStart || undefined}
			data-at-end={atEnd || undefined}
			className={cx("carousel--component", styles.root, className)}
			{...props}
		>
			<div
				ref={viewport}
				/* Focusable so the scroll container is keyboard-reachable; named so it's worth landing on. */
				tabIndex={0}
				role="region"
				aria-roledescription={copy.roleDescription}
				aria-label={label ?? copy.label}
				className={cx(styles.viewport, axis === "vertical" && styles.vertical, viewportClassName)}
			>
				{children}
			</div>

			{controls === "overlay" && (
				<div className={styles.controlsOverlay}>
					{previous}
					{next}
				</div>
			)}

			{(controls === "outside" || showDots) && (
				<div className={styles.controls}>
					{controls === "outside" && previous}
					{showDots && (
						<div className={cx(styles.dots, dotStyle === "pill" && styles.dotsPill)}>
							{dots.map((position) => (
								<button
									key={position}
									type="button"
									className={styles.dot}
									/* Enlarged hit area for the small dot (styles/targets.css). */
									data-hit-area
									data-active={position === index || undefined}
									aria-label={copy.goToSlide(position + 1)}
									aria-current={position === index || undefined}
									onClick={() => scrollToSlide(position)}
								/>
							))}
						</div>
					)}
					{controls === "outside" && next}
				</div>
			)}
		</div>
		</CarouselContext.Provider>
	)
}

export interface CarouselControlProps extends ComponentProps<"button"> {
	/** Which way the control moves the track. */
	direction: "previous" | "next"
}

/**
 * A single previous/next control placed by the caller rather than by the root, for composing
 * your own layout with `controls="none"`. Must sit inside a `Carousel`.
 */
export function CarouselControl({ direction, className, children, ...props }: CarouselControlProps) {
	const { index, count, atStart, atEnd, scrollToSlide, strings } = useCarousel()
	const isPrevious = direction === "previous"

	return (
		<Button
			tone="neutral"
			appearance="outline"
			iconOnly
			aria-label={isPrevious ? strings.previous : strings.next}
			// Disabled at the end, not wrapped: jumping back to the start disorients.
			disabled={isPrevious ? atStart : atEnd}
			className={cx("carousel-control--component", className)}
			onClick={() => scrollToSlide(isPrevious ? Math.max(0, index - 1) : Math.min(count - 1, index + 1))}
			{...props}
		>
			{children ?? (isPrevious ? <ChevronLeftIcon className={styles.directional} /> : <ChevronRightIcon className={styles.directional} />)}
		</Button>
	)
}

export interface CarouselDotsProps extends ComponentProps<"div"> {
	/** `pill` stretches the active indicator instead of only recolouring it. */
	dotStyle?: "dot" | "pill"
}

/**
 * The position indicators on their own, placed by the caller outside the track. Must sit
 * inside a `Carousel`.
 */
export function CarouselDots({ dotStyle = "dot", className, ...props }: CarouselDotsProps) {
	const { index, count, scrollToSlide, strings } = useCarousel()

	return (
		<div
			className={cx("carousel-dots--component", styles.dots, dotStyle === "pill" && styles.dotsPill, className)}
			{...props}
		>
			{Array.from({ length: count }, (_, position) => (
				<button
					key={position}
					type="button"
					className={styles.dot}
					/* Enlarged hit area for the small dot, as on Carousel's own dots. */
					data-hit-area
					data-active={position === index || undefined}
					aria-label={strings.goToSlide(position + 1)}
					aria-current={position === index || undefined}
					onClick={() => scrollToSlide(position)}
				/>
			))}
		</div>
	)
}

/*
 * Compound parts, for controls placed outside the root (beside a heading, in a footer).
 * They read the same context, so both APIs agree on the current slide.
 */

export interface CarouselSlideProps extends ComponentProps<"div"> {
	/** Track width this slide occupies — "100%", "50%", "18rem". */
	size?: string
}

/** One slide of the track, announced as a slide. */
export function CarouselSlide({ size = "100%", className, style, ...props }: CarouselSlideProps) {
	const { strings } = useCarousel()

	return (
		<div
			role="group"
			aria-roledescription={strings.slideRoleDescription}
			className={cx("carousel-slide--component", styles.slide, className)}
			style={{ flexBasis: size, ...style }}
			{...props}
		/>
	)
}
