/**
 * SideNav: navigation between the pages of one section, inside the content column
 * (usually a TwoColumnLayout aside), not the app sidebar. Entries are data, so active
 * state, ARIA, disabled handling and routing are decided once.
 */
import { ChevronDownIcon, type LucideIcon } from "lucide-react"
import * as React from "react"

import { Text } from "@/components/base/typography"
import { Badge } from "@/components/base/badge"
import { cx } from "@/lib/cx"
import { resolveActiveHref } from "@/lib/navigation"
import type { StringsProp } from "@/lib/strings"

import styles from "./navigation.module.css"
import { defaultSideNavStrings, type SideNavStrings } from "./navigation.strings"

const isSimpleText = (value: React.ReactNode): value is string | number =>
	typeof value === "string" || typeof value === "number"

export interface SideNavItem {
	label: React.ReactNode
	/** Destination. */
	href: string
	icon?: LucideIcon
	/**
	 * A count or a status beside the label. A string or number is wrapped in a neutral
	 * `Badge`; pass a node to choose the tone.
	 */
	badge?: React.ReactNode
	disabled?: boolean
}

export interface SideNavGroup {
	/** Stable identity, used for the collapsed set. */
	id: string
	/** Caption above the entries. Omit for an uncaptioned block. */
	label?: React.ReactNode
	items: SideNavItem[]
	collapsible?: boolean
	defaultCollapsed?: boolean
}

export interface SideNavProps extends Omit<React.ComponentProps<"nav">, "children"> {
	/** Flat entries. Mutually exclusive with `groups`. */
	items?: SideNavItem[]
	/** Captioned blocks of entries. Mutually exclusive with `items`. */
	groups?: SideNavGroup[]
	/**
	 * The path considered current. Matched by longest prefix, so `/settings/members` marks
	 * the members entry, not the `/settings` index.
	 */
	currentPath?: string
	/**
	 * Renders each entry: receives the link props and returns the router's link element.
	 * Without it, entries are plain anchors.
	 */
	renderLink?: (props: {
		href: string
		className: string
		children: React.ReactNode
		"aria-current"?: "page"
		"aria-disabled"?: boolean
	}) => React.ReactElement
	strings?: StringsProp<SideNavStrings>
}

/** Longest match wins, so exactly one entry is current. Uses the shared matcher. */
function activeHrefOf(items: SideNavItem[], currentPath: string | undefined) {
	if (!currentPath) return undefined
	return resolveActiveHref(currentPath, items.map((item) => item.href))
}

export function SideNav({
	items,
	groups,
	currentPath,
	renderLink,
	strings,
	className,
	...props
}: SideNavProps) {
	const copy = { ...defaultSideNavStrings, ...strings }
	const resolvedGroups: SideNavGroup[] = groups ?? [{ id: "default", items: items ?? [] }]
	const allItems = resolvedGroups.flatMap((group) => group.items)
	const activeHref = activeHrefOf(allItems, currentPath)

	const [collapsed, setCollapsed] = React.useState<Set<string>>(
		() => new Set(resolvedGroups.filter((group) => group.defaultCollapsed).map((group) => group.id)),
	)

	const toggle = (id: string) =>
		setCollapsed((current) => {
			const next = new Set(current)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})

	return (
		<nav
			aria-label={copy.label}
			data-slot="side-nav"
			className={cx("side-nav--component", styles.sideNav, className)}
			{...props}
		>
			{resolvedGroups.map((group) => {
				const isCollapsed = collapsed.has(group.id)
				return (
					<div
						key={group.id}
						className={styles.group}
						data-collapsed={group.collapsible && isCollapsed ? "" : undefined}
					>
						{!!group.label &&
							(group.collapsible ? (
								<button
									type="button"
									className={styles.groupLabel}
									// Drawn under 24px; the TARGET must not be. See styles/targets.css.
									data-hit-area
									aria-expanded={!isCollapsed}
									onClick={() => toggle(group.id)}
								>
									{group.label}
									<ChevronDownIcon aria-hidden className={styles.groupChevron} />
								</button>
							) : (
								<Text
									tag="span"
									size="xs"
									weight="medium"
									type="secondary"
									className={styles.groupLabelStatic}
								>
									{group.label}
								</Text>
							))}

						<ul className={styles.list}>
							{group.items.map((item) => {
								const isActive = item.href === activeHref
								const content = (
									<>
										{!!item.icon && <item.icon aria-hidden className={styles.itemIcon} />}
										<span className={styles.itemLabel}>{item.label}</span>
										{isSimpleText(item.badge) ? (
											<Badge tone="neutral">{item.badge}</Badge>
										) : (
											item.badge
										)}
									</>
								)
								const linkProps = {
									href: item.href,
									className: styles.item,
									children: content,
									"aria-current": isActive ? ("page" as const) : undefined,
									"aria-disabled": item.disabled || undefined,
								}

								return (
									<li key={item.href}>
										{renderLink ? renderLink(linkProps) : <a {...linkProps} />}
									</li>
								)
							})}
						</ul>
					</div>
				)
			})}
		</nav>
	)
}
