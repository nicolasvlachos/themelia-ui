/**
 * AsideNavShell: a section with its own navigation beside the content (settings, an
 * account area, docs). Composes TwoColumnLayout and SideNav: nav on the start side, a
 * heading above both, and a sticky aside by default.
 */
import * as React from "react"

import { PageHeading } from "@/components/base/navigation"
import { cx } from "@/lib/cx"

import { TwoColumnLayout } from "../containers"
import { SideNav, type SideNavGroup, type SideNavItem } from "../navigation"

export interface AsideNavShellProps extends Omit<React.ComponentProps<"div">, "title"> {
	title?: React.ReactNode
	description?: React.ReactNode
	/** Flat entries, or captioned groups. Passed straight to SideNav. */
	items?: SideNavItem[]
	groups?: SideNavGroup[]
	/** The path considered current. Matched by longest prefix. */
	currentPath?: string
	/** Replaces the built-in SideNav entirely. */
	aside?: React.ReactNode
	renderLink?: React.ComponentProps<typeof SideNav>["renderLink"]
	/** Actions for the heading row. */
	actions?: React.ReactNode
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
