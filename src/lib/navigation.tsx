/**
 * Navigation primitives every layer may use: path matching and the link-rendering seam.
 * In `lib` so base families can reach them; `layout` re-exports them. Not a router
 * matcher: the kit never imports a router.
 */
import type { MouseEvent, ReactNode } from "react"

export interface LayoutLinkRenderProps {
	/** Destination. When absent, render non-interactive content. */
	href?: string
	children: ReactNode
	className?: string
	target?: string
	rel?: string
	onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
	"aria-label"?: string
	/** Hint for active styling. A renderer may ignore it — the shell styles the row itself. */
	active?: boolean
	disabled?: boolean
	external?: boolean
}

/**
 * The navigation seam.
 *
 * ```tsx
 * <AppSidebar renderLink={({ href, children, ...rest }) => (
 *   <Link to={href ?? "#"} {...rest}>{children}</Link>
 * )} />
 * ```
 */
export type LayoutLinkRenderer = (props: LayoutLinkRenderProps) => ReactNode

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
