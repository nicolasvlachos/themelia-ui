import type { ReactNode } from "react"

/**
 * A navigation entry as configuration (server or config file), so it survives JSON: `icon`
 * is a name that the rendering component resolves through its `iconMap`.
 */
export interface NavItem {
	title: string
	href: string
	icon?: string
	/** A count or a short chip. Already formatted. */
	badge?: ReactNode
	children?: NavItem[]
}
