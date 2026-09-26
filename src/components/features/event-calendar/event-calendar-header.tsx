/**
 * The period, and the controls that move it. The month jump is icon-only because the
 * heading beside it already states the period.
 */
import { resolveStrings } from "@/lib/strings"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useMemo } from "react"

import { ActionButtons } from "@/components/base/action-menu"
import { Button, ButtonGroup } from "@/components/base/buttons"
import { DatePicker, MonthYearPicker } from "@/components/base/date-pickers"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { Select } from "@/components/base/choice-inputs"
import { Heading } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultEventCalendarStrings } from "./event-calendar.strings"
import type { CalendarViewMode, EventCalendarHeaderProps } from "./event-calendar.types"
import styles from "./event-calendar.module.css"

export function EventCalendarHeader({
	currentDate,
	viewMode,
	displayLabel,
	onPrevious,
	onNext,
	onToday,
	onViewModeChange,
	onDateChange,
	actions,
	strings,
	rangeMode = "date",
	minDate,
	maxDate,
	prevDisabled = false,
	nextDisabled = false,
	className,
}: EventCalendarHeaderProps) {
	const copy = resolveStrings(defaultEventCalendarStrings, strings)

	const visibleActions = useMemo(
		() => (actions ?? []).filter((action) => action.visible !== false),
		[actions],
	)

	const viewModeOptions = useMemo(
		() => [
			{ value: "month", label: copy.viewMode.month },
			{ value: "week", label: copy.viewMode.week },
			{ value: "agenda", label: copy.viewMode.agenda },
		],
		[copy.viewMode.agenda, copy.viewMode.month, copy.viewMode.week],
	)

	return (
		<div className={cx("event-calendar-header--component", styles.header, className)}>
			{/* An inner row: container queries never match the container element itself. */}
			<div className={styles.headerInner}>
			<div className={styles.headerTitle}>
				<Heading level={3}>{displayLabel}</Heading>

				<Popover>
					<PopoverTrigger
						render={
							<Button
								type="button"
								tone="neutral"
								buttonStyle="ghost"
								iconOnly
								aria-label={copy.jumpToMonth}
							>
								<CalendarIcon />
							</Button>
						}
					/>
					<PopoverContent className={styles.jumpPopover}>
						{rangeMode === "month-year" ? (
							<MonthYearPicker
								value={{ month: currentDate.getMonth(), year: currentDate.getFullYear() }}
								onValueChange={({ month, year }) => {
									const next = new Date(currentDate)
									// Day first: setting the month on the 31st would roll a short month over.
									next.setDate(1)
									next.setFullYear(year, month)
									onDateChange?.(next)
								}}
								minYear={minDate?.getFullYear()}
								maxYear={maxDate?.getFullYear()}
							/>
						) : (
							<DatePicker
								mode="single"
								value={currentDate}
								onValueChange={(value) => {
									if (value instanceof Date) onDateChange?.(value)
								}}
								minDate={minDate}
								maxDate={maxDate}
								closeOnSelect
							/>
						)}
					</PopoverContent>
				</Popover>
			</div>

			<div className={styles.headerControls}>
				{visibleActions.length > 0 && (
					<>
						{/* ActionButtons collapses past `max` into a menu. */}
						<ActionButtons actions={visibleActions} className={styles.headerActions} />
						<span aria-hidden className={styles.headerSeparator} />
					</>
				)}

				<Button type="button" tone="neutral" buttonStyle="outline" onClick={onToday}>
					{copy.today}
				</Button>

				{/* One attached pair: a single control with two directions. */}
				<ButtonGroup>
					<Button
						type="button"
						tone="neutral"
						buttonStyle="outline"
						iconOnly
						onClick={onPrevious}
						disabled={prevDisabled}
						aria-label={copy.previous}
					>
						<ChevronLeftIcon />
					</Button>
					<Button
						type="button"
						tone="neutral"
						buttonStyle="outline"
						iconOnly
						onClick={onNext}
						disabled={nextDisabled}
						aria-label={copy.next}
					>
						<ChevronRightIcon />
					</Button>
				</ButtonGroup>

				{!!onViewModeChange && (
					<Select
						aria-label={copy.viewMode.label}
						value={viewMode}
						options={viewModeOptions}
						onValueChange={(value) => value && onViewModeChange(value as CalendarViewMode)}
						className={styles.viewSelect}
					/>
				)}
			</div>
			</div>
		</div>
	)
}
