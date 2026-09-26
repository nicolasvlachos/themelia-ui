/**
 * One day in the grid. The cell is not a button (it contains the event chip buttons): the
 * day number is the keyboard affordance, and the cell's click only widens the pointer target.
 */
import { resolveStrings } from "@/lib/strings"
import { VisuallyHidden } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { EventCalendarEventBadge } from "./event-calendar-event-badge"
import { defaultEventCalendarStrings } from "./event-calendar.strings"
import { resolveCategoryColorToken, type EventCalendarDayCellProps } from "./event-calendar.types"
import { getCategoryById } from "./use-event-calendar-data"
import styles from "./event-calendar.module.css"

export function EventCalendarDayCell({
	data,
	categories,
	maxEvents = 3,
	onClick,
	onEventClick,
	compact = false,
	strings,
	renderEvent,
}: EventCalendarDayCellProps) {
	const copy = resolveStrings(defaultEventCalendarStrings, strings)
	const { date, isCurrentMonth, isToday, isWeekend, events, eventCount } = data

	const shown = events.slice(0, maxEvents)
	const remaining = Math.max(0, eventCount - maxEvents)

	/* Overflow dots show the hidden events' categories. */
	const overflowTokens = [
		...new Set(
			events
				.slice(maxEvents)
				.map((event) => resolveCategoryColorToken(getCategoryById(categories, event.category))),
		),
	].slice(0, 3)

	return (
		<div
			className={cx("event-calendar-day-cell--component", styles.cell)}
			data-today={isToday || undefined}
			data-weekend={isWeekend || undefined}
			data-outside={!isCurrentMonth || undefined}
			data-compact={compact || undefined}
			onClick={onClick}
		>
			<button
				type="button"
				className={styles.dayNumber}
				onClick={(event) => {
					event.stopPropagation()
					onClick()
				}}
				aria-label={date.toDateString()}
			>
				{/* `inherit`, so `.cell[data-outside] .dayNumber` can mute it. */}
				<Text tag="span" type="inherit" size={compact ? "xs" : "sm"} weight={isToday ? "semibold" : "normal"} numeric>
					{date.getDate()}
				</Text>
			</button>

			<div className={styles.cellEvents}>
				{shown.map((event) => {
					const category = getCategoryById(categories, event.category)
					if (renderEvent) return <div key={event.id}>{renderEvent(event, category)}</div>
					return (
						<EventCalendarEventBadge
							key={event.id}
							event={event}
							category={category}
							compact={compact}
							onClick={() => (onEventClick ? onEventClick(event) : onClick())}
						/>
					)
				})}

				{remaining > 0 && (
					<div data-slot="event-calendar-overflow" className={styles.overflow}>
						<span aria-hidden className={styles.overflowDots}>
							{overflowTokens.map((token) => (
								<span key={token} data-token={token} className={styles.dot} />
							))}
						</span>
						<VisuallyHidden>{copy.moreEvents(remaining)}</VisuallyHidden>
						<Text aria-hidden size="xs" type="secondary" weight="medium">
							<span data-overflow-label="full">{copy.moreEvents(remaining)}</span>
							<span data-overflow-label="compact">+{remaining}</span>
						</Text>
					</div>
				)}
			</div>
		</div>
	)
}
