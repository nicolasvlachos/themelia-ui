/**
 * Shared layout types. This layer never imports a router: navigation goes through the
 * consumer's `renderLink`.
 */
import type { ComponentType, HTMLAttributes, ReactNode } from "react"

import type { LayoutLinkRenderer } from "@/lib/navigation"

/** Native region props, including typed `data-*` hooks a consumer may attach. */
export type LayoutSlotAttributes<E extends HTMLElement> = HTMLAttributes<E> & {
	[K in `data-${string}`]?: string | number | boolean | undefined
}

/*
 * The link-rendering seam lives in `@/lib/navigation` so a base family can use it without
 * importing this layer; re-exported here under the names consumers already import.
 */
export type { LayoutLinkRenderProps, LayoutLinkRenderer } from "@/lib/navigation"

export interface LayoutNavigationAdapter {
	renderLink?: LayoutLinkRenderer
}

/** Native anchor, with a non-interactive fallback for a disabled or hrefless entry. */
export const defaultRenderLink: LayoutLinkRenderer = ({
	href,
	children,
	active,
	disabled,
	external,
	rel,
	target,
	...props
}) => {
	// The shell styles the active row; a plain anchor has nothing to do with the hint.
	void active

	if (!href || disabled) return <span {...props}>{children}</span>

	return (
		<a
			href={href}
			target={target ?? (external ? "_blank" : undefined)}
			// Without `noopener` the opened page can reach back through `window.opener`.
			rel={rel ?? (external ? "noopener noreferrer" : undefined)}
			{...props}
		>
			{children}
		</a>
	)
}

export function resolveLayoutLinkRenderer({ renderLink }: LayoutNavigationAdapter = {}): LayoutLinkRenderer {
	return renderLink ?? defaultRenderLink
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
