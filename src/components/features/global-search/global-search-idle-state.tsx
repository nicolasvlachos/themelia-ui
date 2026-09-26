/**
 * What the palette shows before there is anything to search: recent queries and
 * suggestions, both supplied by the consumer (the palette keeps no history).
 */
import { ClockIcon, SearchIcon, SparklesIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Text } from "@/components/base/typography"
import { Item, ItemContent, ItemMedia } from "@/components/base/item"
import { cx } from "@/lib/cx"

import type { GlobalSearchIdleSection } from "./global-search.types"
import styles from "./global-search.module.css"

export interface GlobalSearchIdleStateProps {
	sections: readonly GlobalSearchIdleSection[]
	/** Heading glyphs for sections without one: the first gets `recent`, the rest `suggestions`. */
	fallbackIcons?: { recent?: ReactNode; suggestions?: ReactNode }
	className?: string
}

export function GlobalSearchIdleState({
	sections,
	fallbackIcons,
	className,
}: GlobalSearchIdleStateProps) {
	return (
		<div className={cx("global-search-idle-state--component", styles.idle, className)}>
			{sections.map((section, index) => {
				const icon =
					section.icon ??
					(index === 0
						? (fallbackIcons?.recent ?? <ClockIcon />)
						: (fallbackIcons?.suggestions ?? <SparklesIcon />))

				return (
					<div key={section.id}>
						<div className={styles.idleHeader}>
							<span className={styles.idleIcon}>{icon}</span>
							{/* The same label role as a result group heading, so idle and results share one hierarchy. */}
							<Text tag="span" size="xs" type="secondary" weight="medium">{section.label}</Text>
						</div>

						<ul className={styles.list}>
							{section.items.map((item) => (
								<li key={item.id}>
									<Item
										render={<button type="button" onClick={item.onSelect} />}
										className={styles.idleItem}
									>
										<ItemMedia variant="icon">{item.icon ?? <SearchIcon />}</ItemMedia>
										<ItemContent>
											<Text tag="span" truncate>{item.label}</Text>
										</ItemContent>
									</Item>
								</li>
							))}
						</ul>
					</div>
				)
			})}
		</div>
	)
}
