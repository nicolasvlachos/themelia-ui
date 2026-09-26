import type { ReactNode } from "react"

import type { LayoutIconSource, LayoutLinkRenderer } from "../layout.types"

export interface SidebarNavItem {
	label: ReactNode
	href?: string
	/** Stable id. Keys the entry and looks up its live badge. */
	handle?: string
	icon?: LayoutIconSource
	disabled?: boolean
	external?: boolean
	badge?: string | number
	/** Nested entries. A parent with children renders as a disclosure. */
	children?: SidebarNavItem[]
}

export type SidebarFlatNavItem = Omit<SidebarNavItem, "children">

export interface SidebarItemContext {
	depth: number
	active: boolean
	/** Whether the row's children are shown: the reader's toggle if they used it, else derived from the current URL. */
	expanded: boolean
	badge?: string | number
	renderLink: LayoutLinkRenderer
	/**
	 * Flips `expanded` for a row with children; wire it to a custom parent row's click.
	 * AppSidebar always supplies it; optional for hand-built contexts.
	 */
	toggle?: () => void
}
