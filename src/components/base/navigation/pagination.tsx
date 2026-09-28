/** Pagination: a window around the current page with ellipses, so the width stays constant. */
import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"
import { resolveLinkRenderer, type LinkRenderer } from "@/lib/navigation"

import { defaultPaginationStrings, type PaginationStrings } from "./navigation.strings"
import styles from "./navigation.module.css"
import { paginationRange } from "./pagination.range"

export interface PaginationProps extends Omit<React.ComponentProps<"nav">, "onChange"> {
	/** The current page, 1-indexed. */
	page: number
	/** Total pages. */
	total: number
	/** Called with the page a control goes to. */
	onPageChange: (page: number) => void
	/**
	 * Disables every page control while navigation is unavailable. Linked controls become
	 * disabled buttons until it is available again.
	 */
	disabled?: boolean
	/** Pages shown either side of the current one. */
	siblings?: number
	/**
	 * Whether the arrows carry their words: `icon` (chevrons only), `text` (Previous/Next),
	 * or `responsive`, words from `sm` up and chevrons below — the words are what a pager
	 * under a wide table wants, and the width is what a phone has not got. The words come
	 * from `strings`, so they are the accessible names too.
	 */
	labels?: "icon" | "text" | "responsive"
	/**
	 * `false` drops the numbers and leaves the two arrows alone — a cursor pager, where there
	 * is no page count to show.
	 */
	numbers?: boolean
	/**
	 * The address of a page. With it, every control is a link: a pager is navigation, and on
	 * a server-rendered list each page should be an `<a href>` that works without JavaScript
	 * and opens in a new tab. `onPageChange` still fires. A disabled arrow stays a button,
	 * because there is no href for a page that does not exist.
	 *
	 *   pageHref={(page) => `?page=${page}`}
	 */
	pageHref?: (page: number) => string
	/**
	 * Renders those links through the application's router, as every component's
	 * `renderLink` does; without it, plain anchors. Only used with `pageHref`.
	 */
	renderLink?: LinkRenderer
	/**
	 * Overrides this pager's own copy — the region name, the two arrows, the ellipsis, and
	 * each page control, named by the page it goes to.
	 */
	strings?: Partial<PaginationStrings>
}

export function Pagination({
	page,
	total,
	onPageChange,
	disabled: pagerDisabled = false,
	siblings = 1,
	labels = "responsive",
	numbers = true,
	pageHref,
	renderLink,
	strings,
	className,
	...props
}: PaginationProps) {
	const copy = { ...defaultPaginationStrings, ...strings }
	const pages = numbers ? paginationRange(page, total, siblings) : []

	/*
	 * Decides button vs. the caller's link for every control. A disabled arrow stays a
	 * button: there is no href for a page that does not exist.
	 */
	const control = (
		target: number,
		{ label, current, disabled, children, ...rest }: {
			label: string
			current?: boolean
			disabled?: boolean
			children: React.ReactNode
			iconOnly?: boolean
			appearance?: React.ComponentProps<typeof Button>["appearance"]
			tone?: React.ComponentProps<typeof Button>["tone"]
		},
	) => {
		const isDisabled = pagerDisabled || disabled
		const go = (event: React.MouseEvent) => {
			if (isDisabled) return event.preventDefault()
			onPageChange(target)
		}
		const current_ = current ? ("page" as const) : undefined
		if (pageHref && !isDisabled) {
			const link = resolveLinkRenderer(renderLink)({
				href: pageHref(target),
				"aria-label": label,
				"aria-current": current_,
				onClick: go,
				children,
			})
			/*
			 * The link becomes the Button's `render`, so it keeps the pager's geometry. The
			 * click handler is on the link's props only, so it runs once.
			 */
			return (
				<Button aria-label={label} aria-current={current_} render={link} {...rest}>
					{children}
				</Button>
			)
		}
		/*
		 * An arrow at the end of the range is `aria-disabled`, so focus stays on the button just
		 * pressed. A wholly disabled pager disables natively.
		 */
		const atBoundary = !pagerDisabled && !!disabled
		return (
			<Button
				aria-label={label}
				aria-current={current_}
				disabled={pagerDisabled || undefined}
				aria-disabled={atBoundary || undefined}
				onClick={go}
				{...rest}
			>
				{children}
			</Button>
		)
	}

	/* The arrows: chevron, word, or the word above `sm` — see `labels`. */
	const arrowText = labels !== "icon"
	const arrow = (word: string) =>
		labels === "responsive" ? <span className={styles.paginationArrowWord}>{word}</span> : word

	return (
		<nav aria-label={copy.label} data-slot="pagination" className={cx("pagination--component", className)} {...props}>
			<div className={styles.pagination} data-labels={labels}>
				{control(page - 1, {
					label: copy.previous,
					disabled: page <= 1,
					tone: "neutral",
					appearance: "ghost",
					iconOnly: !arrowText,
					children: (
						<>
							<ChevronLeftIcon />
							{arrowText && arrow(copy.previous)}
						</>
					),
				})}

				{pages.map((entry, index) =>
					entry === null ? (
						/* The announced copy is a sibling of the fixed-size glyph cell, not a child. */
						<React.Fragment key={`gap-${index}`}>
							<span className={styles.paginationEllipsis} aria-hidden>
								…
							</span>
							<VisuallyHidden>{copy.morePages}</VisuallyHidden>
						</React.Fragment>
					) : (
						<React.Fragment key={entry}>
							{control(entry, {
								label: copy.page(entry),
								current: entry === page,
								/* Outline for the current page, like every other "you are here" in the kit. */
								tone: "secondary",
								appearance: entry === page ? "outline" : "ghost",
								iconOnly: true,
								children: entry,
							})}
						</React.Fragment>
					),
				)}

				{control(page + 1, {
					label: copy.next,
					disabled: page >= total,
					tone: "neutral",
					appearance: "ghost",
					iconOnly: !arrowText,
					children: (
						<>
							{arrowText && arrow(copy.next)}
							<ChevronRightIcon />
						</>
					),
				})}
			</div>
		</nav>
	)
}
