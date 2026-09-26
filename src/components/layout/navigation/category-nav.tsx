/**
 * CategoryNav: a filter rail of categories with counts, not routes (see `SideNav`). Built
 * on `Item`.
 */
import type { ComponentProps, ComponentType, ReactNode } from "react"
import { ChevronRightIcon } from "lucide-react"

import { Badge } from "@/components/base/badge"
import {
	Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle,
} from "@/components/base/item"
import { cx } from "@/lib/cx"

import styles from "./navigation.module.css"

export interface CategoryNavItem {
	/** Stable identity. The row reports this, not its index. */
	id: string
	label: ReactNode
	icon?: ComponentType<{ className?: string }>
	/** A count of what the row selects. `0` renders — "none" is information. */
	count?: number
	/** A second line under the label. */
	hint?: ReactNode
}

export interface CategoryNavProps extends Omit<ComponentProps<"nav">, "onSelect" | "title"> {
	/** Names the region. A page with two rails needs two names. */
	label?: string
	items: CategoryNavItem[]
	activeId?: string
	onSelect?: (id: string) => void
}

export function CategoryNav({
	label,
	items,
	activeId,
	onSelect,
	className,
	...props
}: CategoryNavProps) {
	return (
		<nav
			data-slot="category-nav"
			aria-label={label}
			className={cx("category-nav--component", styles.categoryNav, className)}
			{...props}
		>
			<ItemGroup>
				{items.map((entry) => {
					const Icon = entry.icon
					const active = entry.id === activeId

					return (
						<Item
							key={entry.id}
							render={<button type="button" />}
							/* Announced, not just tinted. */
							aria-current={active || undefined}
							data-active={active || undefined}
							onClick={() => onSelect?.(entry.id)}
							className={styles.categoryRow}
						>
							{!!Icon && (
								<ItemMedia variant="icon">
									<Icon />
								</ItemMedia>
							)}
							<ItemContent>
								<ItemTitle>{entry.label}</ItemTitle>
								{!!entry.hint && <ItemDescription>{entry.hint}</ItemDescription>}
							</ItemContent>
							<ItemActions>
								{typeof entry.count === "number" && (
									<Badge tone={active ? "primary" : "neutral"}>{entry.count}</Badge>
								)}
								<ChevronRightIcon aria-hidden className={styles.categoryChevron} />
							</ItemActions>
						</Item>
					)
				})}
			</ItemGroup>
		</nav>
	)
}
