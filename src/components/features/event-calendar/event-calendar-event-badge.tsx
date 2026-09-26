/**
 * One event, as a chip in a day cell: a category dot, the title and the start time. At the
 * narrowest widths only the dot remains.
 */
import { format } from "date-fns"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { resolveStrings } from "@/lib/strings"
import { useDatesConfig } from "@/lib/ui-provider"

import { defaultEventCalendarEventCardStrings } from "./event-calendar.strings"
import { resolveCategoryColorToken, type EventCalendarEventBadgeProps } from "./event-calendar.types"
import styles from "./event-calendar.module.css"

export function EventCalendarEventBadge({
	event,
	category,
	compact = false,
	onClick,
	strings,
}: EventCalendarEventBadgeProps) {
	const copy = resolveStrings(defaultEventCalendarEventCardStrings, strings)
	const { locale, timeFormat } = useDatesConfig()
	const time = event.allDay ? null : format(event.startDate, timeFormat ?? "HH:mm", { locale })

	/* `metadata.cellTitle`, when given, is a shorter title for the chip. */
	const raw = event.metadata?.cellTitle
	const title = typeof raw === "string" && raw.trim() !== "" ? raw : event.title

	return (
		<button
			type="button"
			data-slot="event-calendar-event-badge"
			data-compact={compact || undefined}
			data-token={resolveCategoryColorToken(category)}
			className={cx("event-calendar-event-badge--component", styles.badge)}
			// Keeps the day cell's handler from firing too.
			onClick={(clickEvent) => {
				clickEvent.stopPropagation()
				onClick?.()
			}}
			aria-label={time ? copy.eventAt(title, time) : title}
			title={title}
		>
			<span aria-hidden className={styles.dot} />
			{/* The xs step, pinned: a chip label, not body copy. */}
			<Text tag="span" size="xs" weight="medium" className={styles.badgeTitle}>
				{title}
			</Text>
			{!!time && (
				<Text tag="span" size="xs" type="secondary" numeric className={styles.badgeTime}>
					{time}
				</Text>
			)}
		</button>
	)
}
