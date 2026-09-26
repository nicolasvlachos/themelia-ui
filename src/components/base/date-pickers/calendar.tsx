/**
 * Calendar — a month grid built on date-fns (no calendar library). Days are real
 * `<button>`s inside a `role="grid"`, so focus and announcement come from the platform.
 */
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import {
	addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format,
	addYears, isAfter, isBefore, isSameDay, isSameMonth, isToday, startOfDay, startOfMonth,
	startOfWeek, subMonths,
} from "date-fns"
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react"

import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"
import { useDatesConfig } from "@/lib/ui-provider"

import { defaultCalendarStrings, type CalendarStrings } from "./date-pickers.strings"
import styles from "./calendar.module.css"
import type { CalendarConstraints, DateRangeValue, DateSelectionMode } from "./calendar.types"

export interface CalendarProps extends CalendarConstraints {
	/** Overrides this calendar's own copy — the three caption controls. */
	strings?: Partial<CalendarStrings>
	mode?: DateSelectionMode
	/** The selection, in the shape the mode uses. */
	value?: Date | Date[] | DateRangeValue
	onValueChange?: (value: Date | Date[] | DateRangeValue | undefined) => void
	/** The month shown. Uncontrolled unless supplied. */
	month?: Date
	onMonthChange?: (month: Date) => void
	/** How many months to show side by side. Two is the usual range picker. */
	numberOfMonths?: number
	/** 0 is Sunday. Falls back to the provider's formatting config. */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	className?: string
}

type View = "days" | "months" | "years"

function isDisabled(date: Date, { minDate, maxDate, disabledDates }: CalendarConstraints) {
	if (minDate && isBefore(startOfDay(date), startOfDay(minDate))) return true
	if (maxDate && isAfter(startOfDay(date), startOfDay(maxDate))) return true
	return disabledDates?.(date) ?? false
}

function asRange(value: CalendarProps["value"]): DateRangeValue {
	return (value ?? {}) as DateRangeValue
}

/** The first selected day in whatever shape the mode uses, or nothing. */
function firstSelected(value: CalendarProps["value"]): Date | undefined {
	if (!value) return undefined
	if (Array.isArray(value)) return value[0]
	if (value instanceof Date) return value
	return asRange(value).from
}

export function Calendar({
	strings,
	mode = "single",
	value,
	onValueChange,
	month: monthProp,
	onMonthChange,
	numberOfMonths = 1,
	weekStartsOn,
	className,
	...constraints
}: CalendarProps) {
	const copy = { ...defaultCalendarStrings, ...strings }
	const captionHintId = useId()
	const { weekStartsOn: configuredWeekStart, locale: dateLocale } = useDatesConfig()
	const firstDay = weekStartsOn ?? configuredWeekStart ?? 1

	/*
	 * `dateLocale` translates month and weekday names; the `yyyy-MM-dd` formats are DOM query
	 * keys and deliberately take no locale.
	 */

	/* Opens on the selection; today is the fallback for an empty value. */
	const [internalMonth, setInternalMonth] = useState(() =>
		startOfMonth(monthProp ?? firstSelected(value) ?? new Date()),
	)
	const month = monthProp ? startOfMonth(monthProp) : internalMonth
	const [view, setView] = useState<View>("days")

	const setMonth = (next: Date) => {
		if (!monthProp) setInternalMonth(startOfMonth(next))
		onMonthChange?.(startOfMonth(next))
	}

	const selectedDays = useMemo<Date[]>(() => {
		if (!value) return []
		if (Array.isArray(value)) return value
		if (value instanceof Date) return [value]
		const range = asRange(value)
		return [range.from, range.to].filter((entry): entry is Date => !!entry)
	}, [value])

	const isSelected = (date: Date) => selectedDays.some((entry) => isSameDay(entry, date))

	const range = mode === "range" ? asRange(value) : undefined

	/*
	 * One tab stop for the whole calendar, following the keyboard cursor across visible
	 * months; falls back to a visible selected day, then today, then the first selectable day.
	 */
	const rootRef = useRef<HTMLDivElement>(null)
	const [focused, setFocused] = useState<Date | null>(null)
	const lastVisible = endOfMonth(addMonths(month, numberOfMonths - 1))
	const isVisible = (date: Date) => !isBefore(date, month) && !isAfter(date, lastVisible)
	const firstSelectable = () => {
		for (let day = month; !isAfter(day, endOfMonth(month)); day = addDays(day, 1)) {
			if (!isDisabled(day, constraints)) return day
		}
		return month
	}
	const today = startOfDay(new Date())
	const tabTarget =
		(focused && isVisible(focused) ? focused : undefined) ??
		selectedDays.find(isVisible) ??
		(isVisible(today) ? today : undefined) ??
		firstSelectable()

	/* Pages only when the destination is outside every visible month. */
	const moveFocus = (next: Date) => {
		setFocused(next)
		if (!isVisible(next)) {
			setMonth(isBefore(next, month) ? startOfMonth(next) : startOfMonth(addMonths(next, -(numberOfMonths - 1))))
		}
		// The destination may not be mounted until the paged month renders; focus after paint.
		requestAnimationFrame(() => {
			rootRef.current
				?.querySelector<HTMLButtonElement>(`[data-day="${format(next, "yyyy-MM-dd")}"]:not([data-outside])`)
				?.focus()
		})
	}

	/*
	 * Date-grid keys: arrows by day/week, Home/End to the week's ends, PageUp/PageDown by
	 * month (Shift: year). Disabled days stay focusable.
	 */
	const onDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
		const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === "rtl" : false
		const horizontal = (step: number) => (rtl ? -step : step)
		const next =
			event.key === "ArrowLeft" ? addDays(date, horizontal(-1))
			: event.key === "ArrowRight" ? addDays(date, horizontal(1))
			: event.key === "ArrowUp" ? addDays(date, -7)
			: event.key === "ArrowDown" ? addDays(date, 7)
			: event.key === "Home" ? startOfWeek(date, { weekStartsOn: firstDay })
			: event.key === "End" ? endOfWeek(date, { weekStartsOn: firstDay })
			: event.key === "PageUp" ? (event.shiftKey ? addYears(date, -1) : addMonths(date, -1))
			: event.key === "PageDown" ? (event.shiftKey ? addYears(date, 1) : addMonths(date, 1))
			: null
		if (!next) return
		event.preventDefault()
		moveFocus(next)
	}

	const inRange = (date: Date) => {
		if (!range?.from || !range.to) return false
		const day = startOfDay(date)
		return !isBefore(day, startOfDay(range.from)) && !isAfter(day, startOfDay(range.to))
	}

	const select = (date: Date) => {
		if (mode === "single") {
			onValueChange?.(date)
			return
		}
		if (mode === "multiple") {
			const current = Array.isArray(value) ? value : []
			const exists = current.some((entry) => isSameDay(entry, date))
			onValueChange?.(exists ? current.filter((entry) => !isSameDay(entry, date)) : [...current, date])
			return
		}

		/*
		 * Range: first click sets the start, second closes it; clicking before the start
		 * re-anchors rather than inverting the range.
		 */
		const current = asRange(value)
		if (!current.from || current.to) {
			onValueChange?.({ from: date, to: undefined })
			return
		}
		if (isBefore(date, current.from)) {
			onValueChange?.({ from: date, to: undefined })
			return
		}
		onValueChange?.({ from: current.from, to: date })
	}

	return (
		<div ref={rootRef} className={cx("calendar--component", styles.calendar, className)}>
			<div className={styles.header}>
				<button
					type="button"
					className={styles.navButton}
					aria-label={copy.previousMonth}
					onClick={() => setMonth(subMonths(month, 1))}
				>
					<ChevronLeftIcon aria-hidden />
				</button>

				{/*
 * One month: the caption sits between the arrows. Several: each grid captions itself,
 * so the second month isn't unlabelled.
 */}
				{numberOfMonths === 1 ? (
					<>
					<VisuallyHidden id={captionHintId}>{copy.chooseMonth}</VisuallyHidden>
					<button
						type="button"
						className={styles.caption}
						/* The month is the name; the action is a localized description, not glued into the name. */
						aria-describedby={captionHintId}
						onClick={() => setView(view === "days" ? "months" : "days")}
					>
						{format(month, "MMMM yyyy", { locale: dateLocale })}
					</button>
					</>
				) : (
					<span className={styles.captionRange}>
						{format(month, "MMMM yyyy", { locale: dateLocale })} – {format(addMonths(month, numberOfMonths - 1), "MMMM yyyy", { locale: dateLocale })}
					</span>
				)}

				<button
					type="button"
					className={styles.navButton}
					aria-label={copy.nextMonth}
					onClick={() => setMonth(addMonths(month, 1))}
				>
					<ChevronRightIcon aria-hidden />
				</button>
			</div>

			{view === "days" && (
				<div className={styles.months}>
					{Array.from({ length: numberOfMonths }, (_, offset) => (
						<MonthGrid
							key={offset}
							month={addMonths(month, offset)}
							showCaption={numberOfMonths > 1}
							firstDay={firstDay}
							constraints={constraints}
							isSelected={isSelected}
							inRange={inRange}
							range={range}
							onSelect={select}
							tabTarget={tabTarget}
							onDayKeyDown={onDayKeyDown}
							onDayFocus={setFocused}
						/>
					))}
				</div>
			)}

			{view === "months" && (
				<div className={styles.monthGrid}>
					{Array.from({ length: 12 }, (_, index) => {
						const candidate = new Date(month.getFullYear(), index, 1)
						return (
							<button
								key={index}
								type="button"
								className={styles.monthCell}
								data-selected={candidate.getMonth() === month.getMonth() || undefined}
								onClick={() => {
									setMonth(candidate)
									setView("days")
								}}
							>
								{format(candidate, "MMM", { locale: dateLocale })}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}

function MonthGrid({
	month,
	showCaption = false,
	firstDay,
	constraints,
	isSelected,
	inRange,
	range,
	onSelect,
	tabTarget,
	onDayKeyDown,
	onDayFocus,
}: {
	month: Date
	showCaption?: boolean
	firstDay: 0 | 1 | 2 | 3 | 4 | 5 | 6
	constraints: CalendarConstraints
	isSelected: (date: Date) => boolean
	inRange: (date: Date) => boolean
	range?: DateRangeValue
	onSelect: (date: Date) => void
	tabTarget: Date
	onDayKeyDown: (event: KeyboardEvent<HTMLButtonElement>, date: Date) => void
	onDayFocus: (date: Date) => void
}) {
	const { locale: dateLocale } = useDatesConfig()

	/* Whole weeks, so the grid is rectangular and columns line up with their headings. */
	const days = useMemo(
		() =>
			eachDayOfInterval({
				start: startOfWeek(startOfMonth(month), { weekStartsOn: firstDay }),
				end: endOfWeek(endOfMonth(month), { weekStartsOn: firstDay }),
			}),
		[firstDay, month],
	)

	/* Weeks for ARIA rows; the interval spans whole weeks, so every chunk is seven. */
	const weeks = useMemo(() => {
		const out: Date[][] = []
		for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7))
		return out
	}, [days])

	const weekdays = useMemo(
		() => days.slice(0, 7).map((day) => format(day, "EEEEEE", { locale: dateLocale })),
		[days, dateLocale],
	)

	return (
		<div className={styles.monthColumn}>
			{showCaption && <div className={styles.monthCaption}>{format(month, "MMMM yyyy", { locale: dateLocale })}</div>}
			<div className={styles.grid} role="grid" aria-label={format(month, "MMMM yyyy", { locale: dateLocale })}>
				<div className={styles.row} role="row">
					{weekdays.map((weekday) => (
						<div key={weekday} className={styles.weekday} role="columnheader" aria-label={weekday}>
							{weekday}
						</div>
					))}
				</div>
				{weeks.map((week) => (
					<div key={week[0]!.toISOString()} className={styles.row} role="row">
						{week.map((day) => {
					const outside = !isSameMonth(day, month)
					const disabled = isDisabled(day, constraints)
					const selected = isSelected(day)
					const within = inRange(day)

					return (
						<div
							key={day.toISOString()}
							className={styles.cell}
							role="gridcell"
							data-in-range={within || undefined}
							data-range-start={(range?.from && isSameDay(day, range.from)) || undefined}
							data-range-end={(range?.to && isSameDay(day, range.to)) || undefined}
						>
							<button
								type="button"
								className={styles.day}
								data-day={format(day, "yyyy-MM-dd")}
								data-today={isToday(day) || undefined}
								data-outside={outside || undefined}
								data-selected={selected || undefined}
								aria-disabled={disabled || undefined}
								aria-pressed={selected}
								aria-label={format(day, "d MMMM yyyy", { locale: dateLocale })}
								/* The calendar's single tab stop — see `tabTarget` in Calendar. */
								tabIndex={!outside && isSameDay(day, tabTarget) ? 0 : -1}
								onClick={() => {
									if (!disabled) onSelect(day)
								}}
								onFocus={() => onDayFocus(day)}
								onKeyDown={(event) => onDayKeyDown(event, day)}
							>
								{format(day, "d", { locale: dateLocale })}
							</button>
							</div>
						)
					})}
					</div>
				))}
			</div>
		</div>
	)
}
