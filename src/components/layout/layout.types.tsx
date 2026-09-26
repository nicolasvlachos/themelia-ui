/**
 * Shared layout types. This layer never imports a router: navigation goes through the
 * consumer's `renderLink`.
 */
import type { ComponentType, HTMLAttributes, ReactNode } from "react"

import type { LinkRenderer } from "@/lib/navigation"

/** Native region props, including typed `data-*` hooks a consumer may attach. */
export type LayoutSlotAttributes<E extends HTMLElement> = HTMLAttributes<E> & {
	[K in `data-${string}`]?: string | number | boolean | undefined
}

export interface LayoutNavigationAdapter {
	/** Renders links through the application's router; without it, plain anchors. */
	renderLink?: LinkRenderer
}

/** An icon as a component, a rendered node, or a name resolved through an `iconMap`. */
export type LayoutIconSource = ComponentType<{ className?: string }> | ReactNode | string

/**
 * The signed-in person, as a shell displays them.
 *
 * Deliberately four optional-ish fields and no id: this is what a header, a sidebar
 * footer, and a workspace switcher need to RENDER someone. Anything more — permissions, a
 * tenant, a token — belongs to the application's own user model, and a layout type that
 * grew those fields would start being one.
 */
export interface LayoutUser {
	name: string
	email?: string
	/** Image URL. Without one the shell derives initials from the name. */
	avatar?: string
	/** A job title or a role name, shown where there is room for a third line. */
	role?: string
}

export interface NavLink {
	label: ReactNode
	href?: string
	/** Stable id, for live badges and for keying an entry whose label is a node. */
	handle?: string
	icon?: LayoutIconSource
	disabled?: boolean
	external?: boolean
}
