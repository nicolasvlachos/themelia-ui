/**
 * Layout containers, one responsibility each:
 *
 *   PageViewport      owns page scroll and the page-level container query
 *   Container         owns content width and the inline gutter
 *   Section           owns vertical rhythm between groups
 *   TwoColumnLayout   owns the main/aside grid
 */
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./containers.module.css"

/* ── PageViewport ──────────────────────────────────────────────────────────────── */

export interface PageViewportProps extends React.ComponentProps<"div"> {}

/**
 * The single page-scroll owner. Focusable by default (`tabIndex={0}`) so it can be
 * scrolled by keyboard.
 */
export const PageViewport = React.forwardRef<HTMLDivElement, PageViewportProps>(
	function PageViewport({ className, tabIndex = 0, ...props }, ref) {
		return (
			<div
				ref={ref}
				data-slot="page-viewport"
				tabIndex={tabIndex}
				className={cx("page-viewport--component", styles.pageViewport, className)}
				{...props}
			/>
		)
	},
)

/* ── Container ─────────────────────────────────────────────────────────────────── */

export type ContainerMaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full"
export type ContainerGutter = "none" | "sm" | "md" | "lg"

export interface ContainerProps extends React.ComponentProps<"div"> {
	/** The reading measure. Defaults to `xl`. */
	maxWidth?: ContainerMaxWidth
	/** The inline gutter. Defaults to `md`. */
	gutter?: ContainerGutter
}

const MAX_WIDTH: Record<ContainerMaxWidth, string> = {
	sm: styles.maxSm,
	md: styles.maxMd,
	lg: styles.maxLg,
	xl: styles.maxXl,
	"2xl": styles.max2Xl,
	full: styles.maxFull,
}

const GUTTER: Record<ContainerGutter, string> = {
	none: styles.gutterNone,
	sm: styles.gutterSm,
	md: styles.gutterMd,
	lg: styles.gutterLg,
}

/** The single owner of centred content width and the inline gutter. */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(function Container(
	{ className, maxWidth = "xl", gutter = "md", ...props },
	ref,
) {
	return (
		<div
			ref={ref}
			data-slot="container"
			className={cx(
				"container--component",
				styles.container,
				MAX_WIDTH[maxWidth],
				GUTTER[gutter],
				className,
			)}
			{...props}
		/>
	)
})

/* ── Section ───────────────────────────────────────────────────────────────────── */

export interface SectionProps extends React.ComponentProps<"section"> {}

/**
 * A semantic `<section>` and the vertical rhythm between its children. The gap is one
 * fixed rhythm step, not a per-section prop.
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(function Section(
	{ className, ...props },
	ref,
) {
	return (
		<section
			ref={ref}
			data-slot="section"
			className={cx("section--component", styles.section, className)}
			{...props}
		/>
	)
})

/* ── TwoColumnLayout ───────────────────────────────────────────────────────────── */

export interface TwoColumnLayoutProps extends Omit<React.ComponentProps<"div">, "children"> {
	/** Spans both columns, before the work regions. */
	header?: React.ReactNode
	/** Primary detail, form, or index content. */
	main: React.ReactNode
	/** Secondary summary, support, or action rail. */
	aside: React.ReactNode
	/** Spans both columns, after the work regions. */
	footer?: React.ReactNode
	/**
	 * Keeps the aside in view while the page scrolls. Opt-in: an aside taller than the
	 * viewport must be able to scroll away.
	 */
	stickyAside?: boolean
	/**
	 * Which side the aside is drawn on. Default `end`. Only the grid columns move; the
	 * aside stays second in the DOM.
	 */
	asidePosition?: "start" | "end"
}

/**
 * Main and aside in a stable DOM order: the aside is always second, so keyboard and
 * screen-reader users meet the primary content first. Visual order is the grid's.
 */
export const TwoColumnLayout = React.forwardRef<HTMLDivElement, TwoColumnLayoutProps>(
	function TwoColumnLayout(
		{ header, main, aside, footer, stickyAside = false, asidePosition = "end", className, ...props },
		ref,
	) {
		return (
			<div
				ref={ref}
				data-slot="two-column-layout"
				data-aside={asidePosition}
				className={cx(
					"two-column-layout--component",
					styles.twoColumn,
					asidePosition === "start" && styles.twoColumnAsideStart,
					className,
				)}
				{...props}
			>
				{header != null && (
					<div data-slot="two-column-layout-header" className={styles.twoColumnHeader}>
						{header}
					</div>
				)}
				<div data-slot="two-column-layout-main" className={styles.twoColumnMain}>
					{main}
				</div>
				<aside
					data-slot="two-column-layout-aside"
					className={cx(styles.twoColumnAside, stickyAside && styles.twoColumnAsideSticky)}
				>
					{aside}
				</aside>
				{footer != null && (
					<div data-slot="two-column-layout-footer" className={styles.twoColumnFooter}>
						{footer}
					</div>
				)}
			</div>
		)
	},
)
