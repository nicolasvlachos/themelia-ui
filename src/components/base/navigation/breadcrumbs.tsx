/**
 * Breadcrumbs. The current page is a `<span aria-current="page">`, not a link; separators
 * are `aria-hidden`.
 */
import * as React from "react"
import { resolveStrings } from "@/lib/strings"

import { defaultBreadcrumbsStrings, type BreadcrumbsStrings } from "./navigation.strings"
import { ChevronRightIcon } from "lucide-react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./navigation.module.css"

/** One entry in a `Breadcrumbs` trail. */
export type Crumb = {
	/** What the crumb reads as. */
	label: React.ReactNode
	/** Where the crumb goes, as a plain anchor. */
	href?: string
	/**
	 * A router link element, so the library never imports a router. It replaces the plain
	 * anchor, and `label` becomes its content.
	 */
	render?: React.ReactElement<{ className?: string; children?: React.ReactNode }>
}

export interface BreadcrumbsProps extends Omit<React.ComponentProps<"nav">, "children"> {
	/** The trail. The last entry renders as the current page. */
	items: Crumb[]
	/**
	 * Replaces the chevron between crumbs. It is decorative either way — the trail's meaning
	 * is in the links.
	 */
	separator?: React.ReactNode
	/** Names this one trail. Overrides the strings default. */
	label?: string
	/** Overrides the default name for every trail. */
	strings?: Partial<BreadcrumbsStrings>
}

/**
 * The trail to the current page, in a `<nav>`. The current page is a span marked
 * `aria-current="page"`, not a link: a link to the page you are on is a dead control.
 */
export function Breadcrumbs({
	items,
	separator,
	label,
	strings,
	className,
	...props
}: BreadcrumbsProps) {
	const copy = resolveStrings(defaultBreadcrumbsStrings, strings)

	return (
		<nav aria-label={label ?? copy.label} data-slot="breadcrumbs" className={cx("breadcrumbs--component", className)} {...props}>
			<ol className={styles.breadcrumb}>
				{items.map((item, index) => {
					const isLast = index === items.length - 1
					const content = isLast ? (
						<Text tag="span" size="sm" weight="medium" className={styles.breadcrumbCurrent} aria-current="page">
							{item.label}
						</Text>
					) : item.render ? (
						/*
						 * Both branches carry `data-hit-area`: a crumb is drawn under 24px
						 * (styles/targets.css). The cast admits the data attribute.
						 */
						React.cloneElement(item.render as React.ReactElement<Record<string, unknown>>, {
							className: cx(styles.breadcrumbLink, item.render.props.className),
							children: item.label,
							"data-hit-area": "",
						})
					) : (
						<a href={item.href} data-hit-area className={styles.breadcrumbLink}>
							{/* Inherits the link's muted colour (Text paints its own otherwise). */}
							<Text tag="span" size="sm" type="inherit">
								{item.label}
							</Text>
						</a>
					)

					return (
						<li key={index} className={styles.breadcrumbItem}>
							{content}
							{!isLast && (
								<span className={styles.breadcrumbSeparator} aria-hidden>
									{separator ?? <ChevronRightIcon />}
								</span>
							)}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
