/**
 * AsideNavShell: a section with its own navigation beside the content (settings, an
 * account area, docs). Composes TwoColumnLayout and SideNav: nav on the start side, a
 * heading above both, and a sticky aside by default.
 */
import * as React from "react"

import { PageHeading } from "@/components/base/navigation"
import { cx } from "@/lib/cx"
import type { LinkRenderer } from "@/lib/navigation"

import { TwoColumnLayout } from "../containers"
import { SideNav, type SideNavGroup, type SideNavItem } from "../navigation"

export interface AsideNavShellProps extends Omit<React.ComponentProps<"div">, "title"> {
	/** The section heading, above both columns. */
	title?: React.ReactNode
	/** A line under the title, in the section heading above both columns. */
	description?: React.ReactNode
	/**
	 * Flat entries, passed straight to the SideNav the shell draws — the same entries,
	 * current-path matching and router hook as SideNav's own.
	 */
	items?: SideNavItem[]
	/** Captioned groups of entries, passed straight to the SideNav. */
	groups?: SideNavGroup[]
	/** The current path, passed straight to the SideNav. Matched by longest prefix. */
	currentPath?: string
	/** Replaces the built-in SideNav entirely. */
	aside?: React.ReactNode
	/** The router hook, passed straight to the SideNav. */
	renderLink?: LinkRenderer
	/** Actions for the heading row. */
	actions?: React.ReactNode
	/**
	 * Keeps the rail in view while the content scrolls. A settings rail is short and the
	 * content beside it usually is not.
	 */
	stickyAside?: boolean
}

export function AsideNavShell({
	title,
	description,
	items,
	groups,
	currentPath,
	aside,
	renderLink,
	actions,
	stickyAside = true,
	className,
	children,
	...props
}: AsideNavShellProps) {
	const nav = aside ?? (
		<SideNav items={items} groups={groups} currentPath={currentPath} renderLink={renderLink} />
	)

	return (
		<div
			data-slot="aside-nav-shell"
			className={cx("aside-nav-shell--component", className)}
			{...props}
		>
			<TwoColumnLayout
				/* The nav is the aside: second in the DOM, drawn at the start by the grid. */
				header={
					title || description || actions ? (
						<PageHeading title={title} description={description} actions={actions} />
					) : undefined
				}
				main={children}
				aside={nav}
				asidePosition="start"
				stickyAside={stickyAside}
			/>
		</div>
	)
}
