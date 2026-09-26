/** Pagination: a window around the current page with ellipses, so the width stays constant. */
import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"

import { defaultPaginationStrings, type PaginationStrings } from "./navigation.strings"
import styles from "./navigation.module.css"
import { paginationRange } from "./pagination.range"

export interface PaginationProps extends Omit<React.ComponentProps<"nav">, "onChange"> {
	page: number
	total: number
	onPageChange: (page: number) => void
	/** Disables every page control, including links, while navigation is unavailable. */
	disabled?: boolean
	/** Pages either side of the current one. */
	siblings?: number
	/**
	 * Whether the arrows carry their words: `icon` (chevrons only), `text` (Previous/Next),
	 * or `responsive` (the default: words from `sm` up). The words, from `strings`, are also
	 * the accessible names.
	 */
	labels?: "icon" | "text" | "responsive"
	/** Drops the numbers, leaving the two arrows. For a cursor pager with no page count. */
	numbers?: boolean
	/**
	 * Renders each control as the caller's own link, so pages work as `<a href>` without JS.
	 * `onPageChange` still fires. Disabled arrows stay buttons.
	 *
	 *   renderLink={(page, props) => <Link href={`?page=${page}`} {...props} />}
	 */
	renderLink?: (page: number, props: PaginationLinkProps) => React.ReactNode
	/** Overrides this pager's own copy — the region, the two arrows, each page. */
	strings?: Partial<PaginationStrings>
}

/** What a `renderLink` element must spread to be the control it replaces. */
export interface PaginationLinkProps {
	"aria-label": string
	"aria-current"?: "page"
	onClick: (event: React.MouseEvent) => void
	children: React.ReactNode
}

export function Pagination({
	page,
	total,
	onPageChange,
	disabled: pagerDisabled = false,
	siblings = 1,
	labels = "responsive",
	numbers = true,
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
			buttonStyle?: React.ComponentProps<typeof Button>["buttonStyle"]
			tone?: React.ComponentProps<typeof Button>["tone"]
		},
	) => {
		const isDisabled = pagerDisabled || disabled
		const go = (event: React.MouseEvent) => {
			if (isDisabled) return event.preventDefault()
			onPageChange(target)
		}
		const current_ = current ? ("page" as const) : undefined
		if (renderLink && !isDisabled) {
			const link = renderLink(target, { "aria-label": label, "aria-current": current_, onClick: go, children })
			/*
			 * The caller's element becomes the Button's `render`, so it keeps the pager's
			 * geometry. The click handler is on the link's props only, so it runs once.
			 */
			if (React.isValidElement(link)) {
				return (
					<Button aria-label={label} aria-current={current_} render={link} {...rest}>
						{children}
					</Button>
				)
			}
			return link
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
					buttonStyle: "ghost",
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
								buttonStyle: entry === page ? "outline" : "ghost",
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
					buttonStyle: "ghost",
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
