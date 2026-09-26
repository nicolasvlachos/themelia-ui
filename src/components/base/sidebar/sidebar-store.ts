/*
 * The sidebar's shared state and its hooks. Separate from the provider so the provider
 * file exports only a component and stays hot-reloadable.
 */
import { createContext, useContext } from "react"

import type { SidebarStrings } from "./sidebar.strings"

export interface SidebarContextValue {
	state: "expanded" | "collapsed"
	open: boolean
	setOpen: (open: boolean | ((open: boolean) => boolean)) => void
	openMobile: boolean
	setOpenMobile: (open: boolean) => void
	isMobile: boolean
	toggleSidebar: () => void
	/** Resolved copy, so every part of the sidebar reads the same override. */
	strings: SidebarStrings
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)

/** The panel's state from anywhere inside `SidebarProvider`. Throws outside one. */
export function useSidebar(): SidebarContextValue {
	const context = useContext(SidebarContext)
	if (!context) throw new Error("useSidebar must be used inside <SidebarProvider>.")
	return context
}

/**
 * The panel's state, or `null` outside a provider — for the parts a shell renders whether
 * or not it has a sidebar. A header above a plain page still wants its breadcrumbs, and
 * throwing there takes the page down over a toggle that has nothing to toggle.
 */
export function useOptionalSidebar(): SidebarContextValue | null {
	return useContext(SidebarContext)
}

