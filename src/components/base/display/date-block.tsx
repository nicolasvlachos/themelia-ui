/**
 * DateBlock — a date as a calendar leaf, rendered as `<time>` with a machine-readable
 * `dateTime` so the stacked fragments stay one parseable value.
 */
import { format, isValid } from "date-fns"
import type { ComponentProps, ReactNode } from "react"

import { cx } from "@/lib/cx"
import { useDatesConfig } from "@/lib/ui-provider"

import styles from "./display.module.css"

export type DateBlockLayout = "stacked" | "inline"

export interface DateBlockProps extends Omit<ComponentProps<"time">, "children" | "dateTime"> {
	/** A Date, an ISO string, or a timestamp. */
	date?: Date | string | number | null
	/** Already-formatted time or range — "09:00 – 10:30". */
	time?: ReactNode
	/** Overrides the machine-readable value. */
	dateTime?: string
	layout?: DateBlockLayout
	/** A bounded surface. Defaults on for stacked, off for inline. */
	boxed?: boolean
	showWeekday?: boolean
	showMonth?: boolean
	/** Adds the year under the month, for a date outside the current one. */
	showYear?: boolean
	/**
	 * date-fns patterns for the fragments. Names come from the scope's date-fns locale, so
	 * these are patterns, not strings.
	 */
	weekdayFormat?: string
	dayFormat?: string
	monthFormat?: string
	yearFormat?: string
}

function toDate(value: DateBlockProps["date"]): Date | null {
	if (value == null) return null
	const parsed = value instanceof Date ? value : new Date(value)
	return isValid(parsed) ? parsed : null
}

export function DateBlock({
	date,
	time,
	dateTime,
	layout = "stacked",
	boxed,
	showWeekday = true,
	showMonth = true,
	showYear = false,
	weekdayFormat = "EEE",
	dayFormat = "d",
	monthFormat = "MMM",
	yearFormat = "yyyy",
	className,
	...props
}: DateBlockProps) {
	// The date-fns locale object translates "Thu" and "Aug".
	const { locale } = useDatesConfig()
	const parsed = toDate(date)
	const isBoxed = boxed ?? layout === "stacked"

	// No valid date renders nothing.
	if (!parsed) return null

	return (
		<time
			// Always ISO: only the visible format follows the locale.
			dateTime={dateTime ?? parsed.toISOString()}
			className={cx(
				"date-block--component",
				styles.dateBlock,
				layout === "inline" && styles.dateBlockInline,
				isBoxed && styles.dateBlockBoxed,
				className,
			)}
			{...props}
		>
			{showWeekday && <span className={styles.dateBlockWeekday}>{format(parsed, weekdayFormat, { locale })}</span>}
			<span className={styles.dateBlockDay}>{format(parsed, dayFormat, { locale })}</span>
			{showMonth && <span className={styles.dateBlockMonth}>{format(parsed, monthFormat, { locale })}</span>}
			{showYear && <span className={styles.dateBlockYear}>{format(parsed, yearFormat, { locale })}</span>}
			{time != null && <span className={styles.dateBlockTime}>{time}</span>}
		</time>
	)
}
