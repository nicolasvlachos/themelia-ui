/**
 * Bookings: the upcoming list and one booking's detail. Dates render through
 * `base/display`'s DateBlock (a real `<time>`, locale names); the boxed tile is opt-in.
 */
import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/base/buttons"
import { ContentBlock, DateBlock } from "@/components/base/display"
import {
	Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle,
} from "@/components/base/item"
import { Stack } from "@/components/base/structure"
import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./commerce.module.css"

/* ══ UpcomingBookings ══════════════════════════════════════════════════════════════ */

export interface Booking {
	id: string
	/** A Date, an ISO string, or a timestamp — DateBlock owns the formatting. */
	date: Date | string | number
	/** What was booked. */
	service: string
	customer: string
	/** Already formatted — "14:00". */
	time: string
	/** Already formatted, including its currency. */
	amount: string
}

export interface UpcomingBookingsProps extends Omit<ComponentProps<"div">, "children"> {
	/** Soonest first. This does not sort them — the order shown is the order given. */
	bookings: Booking[]
	/** Draws each date as a compact rounded tile. Appointment times stay beside the service. */
	boxedDate?: boolean
}

export function UpcomingBookings({
	bookings,
	boxedDate = false,
	className,
	...props
}: UpcomingBookingsProps) {
	return (
		<div className={cx("upcoming-bookings--component", className)} {...props}>
			<ItemGroup ruled>
				{bookings.map((booking) => (
					<Item key={booking.id} className={styles.commerceLine}>
						<ItemMedia className={styles.summaryLineMedia}>
							<DateBlock date={booking.date} showWeekday={false} boxed={boxedDate} className={styles.bookingDate} />
						</ItemMedia>
						<ItemContent className={styles.summaryLineBody}>
							<ItemTitle className={styles.summaryLineTitle}>{booking.service}</ItemTitle>
							<Stack direction="horizontal" align="baseline" wrap gap="sm">
								<Text tag="span" size="xs" numeric>{booking.time}</Text>
								<ItemDescription>{booking.customer}</ItemDescription>
							</Stack>
						</ItemContent>
						<ItemContent className={styles.summaryLinePrice}>
							<Text tag="span" weight="semibold" numeric>
								{booking.amount}
							</Text>
						</ItemContent>
					</Item>
				))}
			</ItemGroup>
		</div>
	)
}

/* ══ BookingCard ═══════════════════════════════════════════════════════════════════ */

export interface BookingDetail {
	id: string
	label: ReactNode
	value: ReactNode
	/** Spans the row and sits on its own ground — for a note or an address. */
	fullWidth?: boolean
}

export interface BookingCardProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	/** A chip, usually — the booking's state. */
	status?: ReactNode
	details: BookingDetail[]
	actionLabel?: ReactNode
	onAction?: () => void
}

export function BookingCard({
	status,
	details,
	actionLabel,
	onAction,
	className,
	...props
}: BookingCardProps) {
	return (
		<ContentBlock
			titleSuffix={status}
			className={cx("booking-card--component", styles.block, className)}
			{...props}
		>
			{/* A description list, so each value is paired with its label. */}
			<dl className={cx("booking-card--details", styles.bookingDetails)}>
				{details.map((detail) => (
					<div
						key={detail.id}
						data-full={detail.fullWidth ? "" : undefined}
						className={styles.bookingDetail}
					>
						<dt>
							<DisplayLabel>{detail.label}</DisplayLabel>
						</dt>
						<dd className={styles.bookingValue}><Text tag="div">{detail.value}</Text></dd>
					</div>
				))}
			</dl>

			{actionLabel != null && onAction && (
				<div className={styles.bookingAction}>
					<Button onClick={onAction}>{actionLabel}</Button>
				</div>
			)}
		</ContentBlock>
	)
}
