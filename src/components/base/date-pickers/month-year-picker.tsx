/**
 * MonthYearPicker — a month and a year, no days, for values that are a month (a billing
 * period, an expiry); a day grid would imply a precision the value lacks.
 */
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useDatesConfig } from "@/lib/ui-provider"
import { format, setMonth, setYear } from "date-fns"
import { useMemo, useState, type ComponentProps } from "react"

import { cx } from "@/lib/cx"

import { defaultCalendarStrings, type CalendarStrings } from "./date-pickers.strings"
import styles from "./calendar.module.css"

export interface MonthYearValue {
	/** 0-indexed, as `Date` months are — so it can be handed straight to `setMonth`. */
	month: number
	year: number
}

export interface MonthYearPickerProps extends Omit<ComponentProps<"div">, "onChange" | "value"> {
	value?: MonthYearValue
	onValueChange?: (value: MonthYearValue) => void
	minYear?: number
	maxYear?: number
	/** Refuses individual months — a period already closed, say. */
	disabledMonths?: (value: MonthYearValue) => boolean
	/** Overrides this picker's own copy — the two year controls. */
	strings?: Partial<CalendarStrings>
}

export function MonthYearPicker({
	value,
	onValueChange,
	minYear,
	maxYear,
	disabledMonths,
	strings,
	className,
	...props
}: MonthYearPickerProps) {
	const copy = { ...defaultCalendarStrings, ...strings }
	const now = new Date()
	const current = value ?? { month: now.getMonth(), year: now.getFullYear() }
	const { locale } = useDatesConfig()
	const [year, setDisplayYear] = useState(current.year)

	/* Month names come from date-fns and the scope's locale, not a hard-coded list. */
	const months = useMemo(
		() => Array.from({ length: 12 }, (_, index) => format(setMonth(new Date(), index), "MMM", { locale })),
		[locale],
	)

	const atMinYear = minYear !== undefined && year <= minYear
	const atMaxYear = maxYear !== undefined && year >= maxYear

	return (
		<div className={cx("month-year-picker--component", styles.calendar, className)} {...props}>
			<div className={styles.header}>
				<button
					type="button"
					className={styles.navButton}
					aria-label={copy.previousYear}
					disabled={atMinYear}
					onClick={() => setDisplayYear((previous) => previous - 1)}
				>
					<ChevronLeftIcon aria-hidden />
				</button>
				<span className={styles.caption} aria-live="polite">
					{year}
				</span>
				<button
					type="button"
					className={styles.navButton}
					aria-label={copy.nextYear}
					disabled={atMaxYear}
					onClick={() => setDisplayYear((previous) => previous + 1)}
				>
					<ChevronRightIcon aria-hidden />
				</button>
			</div>

			<div className={styles.monthGrid}>
				{months.map((label, index) => {
					const candidate = { month: index, year }
					const selected = current.month === index && current.year === year
					const disabled = disabledMonths?.(candidate) ?? false

					return (
						<button
							key={label}
							type="button"
							className={styles.monthCell}
							data-selected={selected || undefined}
							data-today={
								(index === now.getMonth() && year === now.getFullYear()) || undefined
							}
							disabled={disabled}
							aria-pressed={selected}
							aria-label={format(setYear(setMonth(new Date(), index), year), "MMMM yyyy", { locale })}
							onClick={() => onValueChange?.(candidate)}
						>
							{label}
						</button>
					)
				})}
			</div>
		</div>
	)
}
