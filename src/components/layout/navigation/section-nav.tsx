/**
 * SectionNav: the in-page table of contents. Points at headings in the current page and
 * tracks which is on screen with an IntersectionObserver.
 */
import * as React from "react"

import { cx } from "@/lib/cx"
import type { StringsProp } from "@/lib/strings"

import styles from "./navigation.module.css"
import { defaultSectionNavStrings, type SectionNavStrings } from "./navigation.strings"
import { observeIntersection } from "@/lib/observers"

export interface SectionNavItem {
	/** The element id this entry points at. */
	id: string
	label: React.ReactNode
	/** Nesting depth. 1 is top level; deeper entries are indented. */
	depth?: number
}

export interface SectionNavProps extends Omit<React.ComponentProps<"nav">, "children" | "onSelect"> {
	items: SectionNavItem[]
	/**
	 * Which part of the viewport counts as "here". The default makes a heading current once
	 * it reaches the upper quarter.
	 */
	rootMargin?: string
	onSelect?: (id: string) => void
	strings?: StringsProp<SectionNavStrings>
}

export function SectionNav({
	items,
	rootMargin = "-10% 0px -70% 0px",
	onSelect,
	strings,
	className,
	...props
}: SectionNavProps) {
	const copy = { ...defaultSectionNavStrings, ...strings }
	const [activeId, setActiveId] = React.useState<string | undefined>(items[0]?.id)

	/* A string key, so an inline `items` array does not rebuild the observer every render. */
	const ids = items.map((item) => item.id).join("|")

	React.useEffect(() => {
		if (typeof IntersectionObserver === "undefined") return

		const elements = ids
			.split("|")
			.filter(Boolean)
			.map((id) => document.getElementById(id))
			.filter((element): element is HTMLElement => element !== null)

		if (elements.length === 0) return

		return observeIntersection(
			elements,
			(entries) => {
				/* The topmost intersecting heading wins; entry order is unspecified. */
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

				if (visible[0]) setActiveId(visible[0].target.id)
			},
			{ rootMargin },
		)
	}, [ids, rootMargin])

	return (
		<nav
			aria-label={copy.label}
			data-slot="section-nav"
			className={cx("section-nav--component", styles.sectionNav, className)}
			{...props}
		>
			{items.map((item) => (
				<a
					key={item.id}
					href={`#${item.id}`}
					/*
					 * `aria-current="true"`, not `"page"` — these are locations within the
					 * current page, and claiming each is a page would be a lie to a screen
					 * reader about where the reader is.
					 */
					aria-current={item.id === activeId ? "true" : undefined}
					className={cx(styles.sectionItem, (item.depth ?? 1) > 1 && styles.sectionItemNested)}
					onClick={() => onSelect?.(item.id)}
				>
					{item.label}
				</a>
			))}
		</nav>
	)
}
