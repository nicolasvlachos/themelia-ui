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
	/**
	 * A Date, an ISO string, or a timestamp. Nothing parseable renders nothing — an empty leaf
	 * would be a claim.
	 */
	date?: Date | string | number | null
	/**
	 * An already-formatted time or range — "09:00 – 10:30" — under the weekday in the stacked
	 * layout.
	 */
	time?: ReactNode
	/** Overrides the machine-readable value, which is otherwise the date's ISO string. */
	dateTime?: string
	/** A calendar leaf, or a phrase at the size of the line it sits in. */
	layout?: DateBlockLayout
	/**
	 * The leaf's box and month band: a bounded surface. Defaults on for stacked and off for
	 * inline; turn it off for a surface that already frames the leaf.
	 * @default true
	 */
	boxed?: boolean
	/** Shows the weekday. */
	showWeekday?: boolean
	/** Shows the month. Without it there is no band. */
	showMonth?: boolean
	/** Adds the year under the month, for a date outside the current one. */
	showYear?: boolean
	/**
	 * date-fns pattern for the weekday. Names come from the `UIProvider`'s date-fns locale, so
	 * these are patterns, not strings: a Greek scope reads "Κυρ" without a strings object.
	 */
	weekdayFormat?: string
	/** date-fns pattern for the day. */
	dayFormat?: string
	/** date-fns pattern for the month, named in the scope's locale. */
	monthFormat?: string
	/** date-fns pattern for the year. */
	yearFormat?: string
}

function toDate(value: DateBlockProps["date"]): Date | null {
	if (value == null) return null
	const parsed = value instanceof Date ? value : new Date(value)
	return isValid(parsed) ? parsed : null
}

/**
 * A date as a calendar leaf, rendered as `<time>` with a machine-readable `dateTime`, so the
 * stacked fragments stay one parseable value.
 */
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
