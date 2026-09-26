/**
 * Header: the shell's sticky top bar. Contents are slots; the header owns the arrangement
 * (which region shrinks, which stays fixed). Breadcrumbs are built in so the trail never moves.
 */
import * as React from "react"

import { type Crumb } from "@/components/base/navigation"
import { cx } from "@/lib/cx"

import type { LayoutNavigationAdapter } from "../layout.types"
import { HeaderBreadcrumbs } from "./partials/header-breadcrumbs"
import type { HeaderBreadcrumbsStrings } from "./header.strings"
import styles from "./header.module.css"

/** The regions `Header` arranges, passed as its `slots`. */
export interface HeaderSlots {
	/** Product mark. Hidden below `md`, where the sidebar trigger stands in for it. */
	brand?: React.ReactNode
	/** Replaces the built-in breadcrumbs entirely. */
	breadcrumbs?: React.ReactNode
	left?: React.ReactNode
	/** Shrinks before the right cluster — put a search field here. */
	center?: React.ReactNode
	/** Fixed-size controls: notifications, account, theme. Never shrinks. */
	right?: React.ReactNode
}

export interface HeaderProps
	extends React.ComponentProps<"header">,
		LayoutNavigationAdapter {
	/** Off for a shell whose pages carry their own trail. */
	showBreadcrumbs?: boolean
	/** Renders the sidebar collapse control before the trail. */
	showSidebarTrigger?: boolean
	/** The trail, rendered by the built-in Breadcrumbs. */
	breadcrumbs?: Crumb[]
	/**
	 * Prepended to the trail, for a root that is not part of the route. `null` omits it
	 * deliberately.
	 */
	homeCrumb?: Crumb | null
	/** Overrides the trail's copy — its landmark name, for a page carrying two headers. */
	breadcrumbsStrings?: Partial<HeaderBreadcrumbsStrings>
	/** The regions. `brand` is hidden below `md`, where the sidebar trigger stands in for it. */
	slots?: HeaderSlots
	/** For the inner content row, when the bar itself must stay untouched. */
	contentClassName?: string
}

export function Header({
	showBreadcrumbs = true,
	showSidebarTrigger = true,
	breadcrumbs = [],
	homeCrumb = null,
	breadcrumbsStrings,
	slots,
	renderLink,
	className,
	contentClassName,
	children,
	...props
}: HeaderProps) {
	return (
		<header
			data-slot="header"
			className={cx("header--component", styles.header, className)}
			{...props}
		>
			<div className={cx("header--content", styles.content, contentClassName)}>
				{!!slots?.brand && <div className={styles.brand}>{slots.brand}</div>}

				{!!showBreadcrumbs &&
					(slots?.breadcrumbs ?? (
						<div className={styles.breadcrumbs}>
							<HeaderBreadcrumbs
								breadcrumbs={breadcrumbs}
								homeCrumb={homeCrumb}
								strings={breadcrumbsStrings}
								showSidebarTrigger={showSidebarTrigger}
								renderLink={renderLink}
							/>
						</div>
					))}

				{!!slots?.left && <div className={styles.left}>{slots.left}</div>}
				{!!slots?.center && <div className={styles.center}>{slots.center}</div>}
				{children}
				{!!slots?.right && <div className={styles.right}>{slots.right}</div>}
			</div>
		</header>
	)
}
