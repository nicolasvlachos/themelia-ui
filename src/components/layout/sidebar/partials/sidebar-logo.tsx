/** SidebarLogo: the product mark in the rail's header; swaps to the compact mark when collapsed. */
import type { ReactNode } from "react"

import { useSidebar } from "@/components/base/sidebar"
import { cx } from "@/lib/cx"

import styles from "../layout-sidebar.module.css"

export interface SidebarLogoProps {
	/** Shown while the rail is expanded. */
	logo: ReactNode
	/** Shown while it is collapsed. Without one the header is empty there. */
	collapsedLogo?: ReactNode
	className?: string
}

export function SidebarLogo({ logo, collapsedLogo = null, className }: SidebarLogoProps) {
	const { state } = useSidebar()
	const content = state === "collapsed" ? collapsedLogo : logo
	if (!content) return null

	return (
		<div data-slot="sidebar-logo" className={cx("sidebar-logo--component", styles.logo, className)}>
			{content}
		</div>
	)
}
