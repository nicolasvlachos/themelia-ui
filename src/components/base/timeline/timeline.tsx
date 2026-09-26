/**
 * Timeline — an ordered run of events on one rail (an `<ol>`): the shared geometry under
 * every dated list in the kit (changelogs, milestones, order progress).
 */
import type { LucideIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./timeline.module.css"

/**
 * Progress states first, then outcomes. `progress` is a position (a step walked past) and
 * takes the primary tone of `current`; `completed` is an outcome (a milestone that landed).
 * `pending` is the only unfilled dot.
 */
export type TimelineStatus =
	| "progress"
	| "completed"
	| "current"
	| "pending"
	| "success"
	| "warning"
	| "destructive"
	| "neutral"

export interface TimelineItem {
	/** Stable identity for the row. */
	id: string
	title: ReactNode
	/** Supporting copy under the title. */
	description?: ReactNode
	/** Already formatted — the kit's date primitives decide the format, not this. */
	timestamp?: ReactNode
	/** The title row's trailing lane when it holds something other than a time; replaces `timestamp`. */
	trailing?: ReactNode
	/** Decorative glyph inside the dot. */
	icon?: LucideIcon
	status?: TimelineStatus
	/** Anything the entry carries below its description — a card, a diff, an action row. */
	children?: ReactNode
}

export interface TimelineProps extends Omit<ComponentProps<"ol">, "children"> {
	items: TimelineItem[]
}

export function Timeline({ items, className, ...props }: TimelineProps) {
	return (
		<ol className={cx("timeline--component", styles.timeline, className)} {...props}>
			{items.map((item, index) => (
				<li
					key={item.id}
					data-status={item.status ?? "neutral"}
					className={cx("timeline--item", styles.item)}
				>
					{/* Decoration: the entry's words already say what the dot's tone and icon show. */}
					<div className={styles.rail} aria-hidden="true">
						<span className={styles.dot}>
							{item.icon ? <item.icon className={styles.icon} /> : null}
						</span>
						{index < items.length - 1 ? <span className={styles.line} /> : null}
					</div>

					<div className={cx("timeline--content", styles.content)}>
						<div className={styles.head}>
							<Text weight="medium" className="timeline--title">
								{item.title}
							</Text>
							{item.trailing != null ? (
								<span className={cx("timeline--trailing", styles.timestamp)}>
									{item.trailing}
								</span>
							) : (
								item.timestamp != null && (
									<Text
										size="xs"
										type="secondary"
										numeric
										className={cx("timeline--timestamp", styles.timestamp)}
									>
										{item.timestamp}
									</Text>
								)
							)}
						</div>

						{item.description != null && (
							<Text size="xs" type="secondary" className="timeline--description">
								{item.description}
							</Text>
						)}

						{item.children != null && <div className={styles.body}>{item.children}</div>}
					</div>
				</li>
			))}
		</ol>
	)
}
