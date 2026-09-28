/**
 * DateBlock — a date as a calendar leaf, rendered as `<time>` with a machine-readable
 * `dateTime` so the stacked fragments stay one parseable value.
 */
import { format, isValid } from "date-fns"
import type { ComponentProps, ReactNode } from "react"

import { Text, textClassName } from "@/components/base/typography"
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
	const inline = layout === "inline"
	const isBoxed = boxed ?? layout === "stacked"

	// No valid date renders nothing.
	if (!parsed) return null

	/* Stacked, each part has its own step; inline, every part takes the line's size and case. */
	const label = inline ? "inherit" : "xs"

	return (
		<time
			// Always ISO: only the visible format follows the locale.
			dateTime={dateTime ?? parsed.toISOString()}
			className={cx(
				"date-block--component",
				styles.dateBlock,
				inline && styles.dateBlockInline,
				inline && textClassName({ size: "sm" }),
				isBoxed && styles.dateBlockBoxed,
				className,
			)}
			{...props}
		>
			{showWeekday && (
				<Text tag="span" size={label} weight="medium" caps={!inline} type="secondary" className={styles.dateBlockWeekday}>
					{format(parsed, weekdayFormat, { locale })}
				</Text>
			)}
			{/* `type="inherit"`: the day takes the colour of the line it sits in. */}
			<Text tag="span" size={inline ? "inherit" : "xl"} weight="semibold" numeric type="inherit">
				{format(parsed, dayFormat, { locale })}
			</Text>
			{showMonth && (
				<Text
					tag="span"
					size={label}
					weight={isBoxed ? "semibold" : "medium"}
					caps={!inline}
					type="secondary"
					className={styles.dateBlockMonth}
				>
					{format(parsed, monthFormat, { locale })}
				</Text>
			)}
			{showYear && (
				<Text tag="span" size={label} numeric type="secondary" className={styles.dateBlockYear}>
					{format(parsed, yearFormat, { locale })}
				</Text>
			)}
			{time != null && (
				<Text tag="span" size={label} numeric type="secondary" className={styles.dateBlockTime}>
					{time}
				</Text>
			)}
		</time>
	)
}
