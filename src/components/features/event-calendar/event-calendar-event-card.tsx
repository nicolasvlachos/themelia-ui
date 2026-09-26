/**
 * One event, in full — for an agenda row or a popover. Reads `customerName`, `guestCount`
 * and `serviceName` from `metadata` by convention when present; replace the card through
 * `renderEvent` for anything else.
 */
import { CalendarIcon, ExternalLinkIcon, UserIcon, UsersIcon } from "lucide-react"

import { DatePrimitive, DateTime } from "@/components/primitives"
import { Heading, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import {
	defaultEventCalendarEventCardStrings, type EventCalendarEventCardStrings,
} from "./event-calendar.strings"
import { resolveCategoryColorToken, type EventCalendarEventCardProps } from "./event-calendar.types"
import styles from "./event-calendar.module.css"

export interface EventCalendarEventCardPropsWithStrings extends EventCalendarEventCardProps {
	strings?: Partial<EventCalendarEventCardStrings>
	className?: string
}

export function EventCalendarEventCard({
	event,
	category,
	onClick,
	strings,
	className,
}: EventCalendarEventCardPropsWithStrings) {
	const copy = { ...defaultEventCalendarEventCardStrings, ...strings }
	const metadata = event.metadata ?? {}
	const customerName = typeof metadata.customerName === "string" ? metadata.customerName : undefined
	const guestCount = typeof metadata.guestCount === "number" ? metadata.guestCount : undefined
	const serviceName = typeof metadata.serviceName === "string" ? metadata.serviceName : undefined

	const body = (
		<>
			<div className={styles.cardHeader}>
				<div className={styles.cardTitleGroup}>
					{/* Level 4, one below the calendar header; `size` pinned since level alone would imply `base`. */}
						<Heading level={4} size="sm">
							{event.title}
						</Heading>
					{!!category && (
						<span className={styles.cardCategory}>
							<span
								aria-hidden
								data-token={resolveCategoryColorToken(category)}
								className={styles.dot}
							/>
							<Text tag="span" size="xs" weight="medium">{category.label}</Text>
						</span>
					)}
				</div>
				{!!onClick && !!event.url && <ExternalLinkIcon aria-hidden className={styles.cardGlyph} />}
			</div>

			{(!!customerName || guestCount !== undefined) && (
				<div className={styles.cardFacts}>
					{!!customerName && (
						<span className={styles.cardFact}>
							<UserIcon aria-hidden className={styles.cardGlyph} />
							<Text tag="span">{customerName}</Text>
						</span>
					)}
					{guestCount !== undefined && guestCount > 0 && (
						<span className={styles.cardFact}>
							<UsersIcon aria-hidden className={styles.cardGlyph} />
							<Text tag="span">
								{guestCount} {guestCount === 1 ? copy.guest : copy.guests}
							</Text>
						</span>
					)}
				</div>
			)}

			{!!serviceName && <Text type="secondary">{serviceName}</Text>}

			<div className={styles.cardWhen}>
				<CalendarIcon aria-hidden className={styles.cardGlyph} />
				{event.allDay ? (
					<DatePrimitive value={event.startDate} size="xs" type="secondary" />
				) : (
					<DateTime value={event.startDate} size="xs" type="secondary" />
				)}
			</div>
		</>
	)

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				data-slot="event-calendar-event-card"
				className={cx("event-calendar-event-card--component", styles.card, styles.cardButton, className)}
			>
				{body}
			</button>
		)
	}

	return (
		<div
			data-slot="event-calendar-event-card"
			className={cx("event-calendar-event-card--component", styles.card, className)}
		>
			{body}
		</div>
	)
}
