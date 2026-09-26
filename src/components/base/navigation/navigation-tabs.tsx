/**
 * NavigationTabs — tabs that are routes: a `<nav>` of links with `aria-current`, not a
 * `tablist`. Use `Tabs` when the panels are in the page.
 */
import { useRef, type ComponentProps, type ReactNode } from "react"

import { cx } from "@/lib/cx"
import { resolveActiveHref, type LayoutLinkRenderer } from "@/lib/navigation"
import { useScrollEdges } from "@/lib/scroll-edges"

import { defaultNavigationTabsStrings, type NavigationTabsStrings } from "./navigation-tabs.strings"
import styles from "./navigation.module.css"

export interface NavigationTabItem {
	label: ReactNode
	href: string
	icon?: ReactNode
	/** Trailing content — a count, a dot. */
	badge?: ReactNode
	disabled?: boolean
}

export interface NavigationTabsProps extends Omit<ComponentProps<"nav">, "children"> {
	items: NavigationTabItem[]
	/** The current route. The active tab follows from this. */
	currentPath?: string
	/** Routes entries through the app's router. Without it they are plain anchors. */
	renderLink?: LayoutLinkRenderer
	/** `pill` draws the current route as a filled chip, as `TabList variant="pill"` does. */
	variant?: "underline" | "pill"
	/** Overrides this row's own copy — the region name. */
	strings?: Partial<NavigationTabsStrings>
}

export function NavigationTabs({
	items,
	currentPath = "/",
	renderLink,
	variant = "underline",
	strings,
	className,
	...props
}: NavigationTabsProps) {
	const copy = { ...defaultNavigationTabsStrings, ...strings }
	// Longest match wins (an index tab is a prefix of its siblings); see lib/navigation.ts.
	const activeHref = resolveActiveHref(currentPath, items.map((item) => item.href))

	// Scrolls rather than wraps, with a fade on each edge that has more past it.
	const trackRef = useRef<HTMLDivElement>(null)
	const edges = useScrollEdges(trackRef, [items])

	return (
		<nav
			aria-label={copy.label}
			data-fade-start={edges.start || undefined}
			data-fade-end={edges.end || undefined}
			className={cx("navigation-tabs--component", styles.tabBarWrap, className)}
			{...props}
		>
			<div ref={trackRef} className={cx(styles.tabBar, variant === "pill" && styles.tabsPill)}>
			{items.map((item) => {
				const active = !!activeHref && item.href === activeHref
				const content = (
					<>
						{item.icon}
						{item.label}
						{item.badge}
					</>
				)

				const shared = {
					className: styles.tab,
					"data-active": active || undefined,
					// `page`, not `true`: this marks the current PAGE, not a selected tab.
					"aria-current": active ? ("page" as const) : undefined,
					"aria-disabled": item.disabled || undefined,
				}

				return renderLink ? (
					<span key={item.href} style={{ display: "contents" }}>
						{renderLink({ href: item.href, children: content, active, disabled: item.disabled, ...shared })}
					</span>
				) : (
					<a key={item.href} href={item.disabled ? undefined : item.href} {...shared}>
						{content}
					</a>
				)
			})}
			</div>
		</nav>
	)
}
