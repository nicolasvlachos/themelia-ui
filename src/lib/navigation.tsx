/**
 * Navigation primitives every tier may use: path matching and the link-rendering seam. In
 * `lib` so base modules can reach them. Not a router matcher: the kit never imports a router.
 */
import type { AriaAttributes, MouseEvent, ReactElement, ReactNode } from "react"

/** What a component hands its link renderer. Spread everything but `active`, `disabled` and `external` onto the element. */
export interface LinkRenderProps {
	/** Destination. When absent, render non-interactive content. */
	href?: string
	children: ReactNode
	className?: string
	target?: string
	rel?: string
	onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
	"aria-label"?: string
	/** Set on the link to the current page or step. */
	"aria-current"?: AriaAttributes["aria-current"]
	/** Set on an entry that is disabled; it styles and announces the state. */
	"aria-disabled"?: AriaAttributes["aria-disabled"]
	/** Hint for active styling. A renderer may ignore it — the component styles the row itself. */
	active?: boolean
	/** The entry goes nowhere: render non-interactive content. */
	disabled?: boolean
	/** Opens elsewhere: the default renderer adds `target="_blank"` and `rel="noopener noreferrer"`. */
	external?: boolean
}

/**
 * How a component renders a link: through the application's router. Every component that
 * navigates takes one as `renderLink`, and without one renders a plain anchor. Return one
 * element: the component may merge its own props into it, such as a menu item's role or a
 * button's styling.
 *
 * ```tsx
 * const renderLink: LinkRenderer = ({ href, children, active, disabled, external, ...rest }) =>
 *   disabled || !href ? <span {...rest}>{children}</span> : <Link to={href} {...rest}>{children}</Link>
 * ```
 */
export type LinkRenderer = (props: LinkRenderProps) => ReactElement

/** A native anchor, and non-interactive content for a disabled or hrefless entry. */
export const defaultRenderLink: LinkRenderer = ({ href, children, active, disabled, external, rel, target, ...props }) => {
	// The component styles the active row; a plain anchor has nothing to do with the hint.
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

/** The caller's renderer, or the native anchor. */
export const resolveLinkRenderer = (renderLink?: LinkRenderer): LinkRenderer => renderLink ?? defaultRenderLink

/** Reduces an href to a comparable path. Handles hash routing, queries, and fragments. */
export function toPath(href: string): string {
	if (href.startsWith("#/")) {
		return href.slice(1).split("?")[0]?.split("#")[0] || "/"
	}

	try {
		// A base is required for a relative href; the origin is discarded either way.
		return new URL(href, "http://local.invalid").pathname
	} catch {
		return href
	}
}

/**
 * True when `currentUrl` is at `path` or below it (`/invoice` does not match `/invoices`).
 * Matches every ancestor, so use `resolveActiveHref` to pick the current row.
 */
export function isPathMatch(currentUrl: string, path: string): boolean {
	const current = toPath(currentUrl)
	if (current === path) return true
	// `/` is a prefix of everything; only an exact match should light the root entry.
	if (path === "/") return false
	return current.startsWith(`${path}/`)
}

/**
 * The single current entry: the longest matching href, so an index entry does not light
 * up beside its children. `undefined` when nothing matches.
 */
export function resolveActiveHref(currentUrl: string, hrefs: (string | undefined)[]): string | undefined {
	let best: string | undefined
	let bestLength = -1

	for (const href of hrefs) {
		if (!href) continue
		const path = toPath(href)
		if (!isPathMatch(currentUrl, path)) continue
		if (path.length > bestLength) {
			best = href
			bestLength = path.length
		}
	}

	return best
}
