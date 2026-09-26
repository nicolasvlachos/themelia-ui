/**
 * OverflowTabBar — a pill tab row from data that scrolls rather than wrapping. Renders
 * through `Tabs`, or through `NavigationTabs` (a `<nav>` of links) when every item has an `href`.
 */
import type { ComponentProps, ReactNode } from "react"

import { cx } from "@/lib/cx"

import { defaultOverflowTabBarStrings, type OverflowTabBarStrings } from "./navigation-tabs.strings"
import { NavigationTabs } from "./navigation-tabs"
import { Tab, TabList, Tabs } from "./tabs"

export interface OverflowTabItem {
	id: string
	label: ReactNode
	icon?: ReactNode
	/**
	 * Renders the entry as a link. When every item has one, the row is a `<nav>` of links;
	 * in a mixed set it stays tabs and the caller routes in `onValueChange`.
	 */
	href?: string
	disabled?: boolean
	/** Trailing content — a count, a dot. */
	badge?: ReactNode
}

export interface OverflowTabBarProps extends Omit<ComponentProps<"div">, "children" | "onChange" | "defaultValue"> {
	items: OverflowTabItem[]
	value?: string
	onValueChange?: (id: string) => void
	/** Overrides this row's own copy — the region name. */
	strings?: Partial<OverflowTabBarStrings>
}

export function OverflowTabBar({
	items,
	value,
	onValueChange,
	strings,
	className,
	...props
}: OverflowTabBarProps) {
	const copy = { ...defaultOverflowTabBarStrings, ...strings }
	const classes = cx("overflow-tab-bar--component", className)

	if (items.length > 0 && items.every((item) => item.href)) {
		const idByHref = new Map(items.map((item) => [item.href as string, item.id]))
		const current = items.find((item) => item.id === value)?.href
		return (
			<NavigationTabs
				{...(props as Omit<ComponentProps<"nav">, "children">)}
				className={classes}
				items={items.map((item) => ({
					label: item.label,
					href: item.href as string,
					icon: item.icon,
					badge: item.badge,
					disabled: item.disabled,
				}))}
				currentPath={current ?? ""}
				variant="pill"
				strings={{ label: copy.label }}
				// A plain anchor, with the caller told which entry was chosen.
				renderLink={({ href, children, active: _active, disabled, external: _external, ...rest }) => (
					<a
						{...rest}
						href={disabled ? undefined : href}
						onClick={() => {
							const id = href ? idByHref.get(href) : undefined
							if (id) onValueChange?.(id)
						}}
					>
						{children}
					</a>
				)}
			/>
		)
	}

	// With nothing selected, the first enabled tab takes the tab stop, or the row is unreachable.
	const selected = items.some((item) => item.id === value)
	const firstEnabled = items.find((item) => !item.disabled)?.id

	return (
		<Tabs {...props} value={value ?? ""} onValueChange={(next) => onValueChange?.(next)} className={classes}>
			{/* Chips, not an underline: the bar picks what one list shows. */}
			<TabList label={copy.label} variant="pill" edgeFade>
				{items.map((item) => (
					<Tab
						key={item.id}
						value={item.id}
						disabled={item.disabled}
						data-tab-id={item.id}
						{...(!selected && item.id === firstEnabled ? { tabIndex: 0 } : null)}
					>
						{item.icon}
						{item.label}
						{item.badge}
					</Tab>
				))}
			</TabList>
		</Tabs>
	)
}
