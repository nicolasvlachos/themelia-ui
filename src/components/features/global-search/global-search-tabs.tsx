/**
 * The group filter strip. `OverflowTabBar`, not `Tabs`: it filters one list, may carry many
 * groups, and scrolls instead of wrapping (a wrap would shift the results while typing).
 */
import { OverflowTabBar } from "@/components/base/navigation"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import type { GlobalSearchTab } from "./global-search.types"
import styles from "./global-search.module.css"

export interface GlobalSearchTabsProps<TGroup extends string = string> {
	value: "all" | TGroup
	onValueChange: (value: "all" | TGroup) => void
	tabs: readonly GlobalSearchTab<TGroup>[]
	/** One per tab value. A group with no results still shows its zero. */
	counts: Record<string, number>
	className?: string
}

export function GlobalSearchTabs<TGroup extends string = string>({
	value,
	onValueChange,
	tabs,
	counts,
	className,
}: GlobalSearchTabsProps<TGroup>) {
	return (
		<div className={cx("global-search-tabs--component", styles.tabs, className)}>
			<OverflowTabBar
				value={value}
				onValueChange={(id) => onValueChange(id as "all" | TGroup)}
				items={tabs.map((tab) => ({
					id: tab.value,
					label: <>{tab.label}{" "}</>,
					/* A quiet tabular count, not a badge, so the strip stays secondary. */
					badge: (
						<Text tag="span" size="xs" type="secondary" numeric className={styles.tabCount}>
							{counts[tab.value] ?? 0}
						</Text>
					),
				}))}
			/>
		</div>
	)
}
