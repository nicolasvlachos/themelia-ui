/**
 * EventCalendar — a month grid, a week strip, or an agenda over one list of events. Views
 * change only the day range and layout; placing events onto days is shared. The agenda
 * lists only the days that have events, with full event cards.
 */
import { resolveStrings } from "@/lib/strings"
import { startOfDay } from "date-fns"
import { useMemo, useState, type CSSProperties } from "react"

import { Empty } from "@/components/base/feedback"
import { Text } from "@/components/base/typography"
import { useDatesConfig } from "@/lib/ui-provider"
import { cx } from "@/lib/cx"

import { EventCalendarDayCell } from "./event-calendar-day-cell"
import { EventCalendarEventCard } from "./event-calendar-event-card"
import { EventCalendarHeader } from "./event-calendar-header"
import { EventCalendarLegend } from "./event-calendar-legend"
import { defaultEventCalendarStrings } from "./event-calendar.strings"
import type {
	CalendarDayData, DateRule, EventCalendarProps,
} from "./event-calendar.types"
import { getCategoryById } from "./use-event-calendar-data"
import { useEventCalendar } from "./use-event-calendar"
import styles from "./event-calendar.module.css"

/** Dates, a predicate, or both — OR, so either one matching is enough. */
function matchesRule(rule: DateRule | undefined, date: Date): boolean {
	if (!rule) return false
	if (Array.isArray(rule)) return rule.some((one) => one.toDateString() === date.toDateString())
	if (typeof rule === "function") return rule(date)
	return (
		(rule.dates?.some((one) => one.toDateString() === date.toDateString()) ?? false) ||
		(rule.predicate?.(date) ?? false)
	)
}

export function EventCalendar({
	events,
	categories,
	viewMode,
	defaultViewMode,
	onViewModeChange,
	date,
	defaultDate,
	onDateChange,
	onEventClick,
	onDayClick,
	maxEventsPerDay = 3,
	showLegend = true,
	showHeader = true,
	showWeekends = true,
	weekStartsOn: weekStartsOnProp,
	locale,
	enableCategoryFilter = false,
	visibleCategories: controlledVisibleCategories,
	onVisibleCategoriesChange,
	loading = false,
	emptyStateMessage,
	className,
	compact = false,
	actions,
	strings,
	dayHeadingVariant = "default",
	dayHeadingClassName,
	renderDayHeading,
	rangeMode = "date",
	minDate,
	maxDate,
	disabledDates,
	filterEvent,
	renderEvent,
	renderDayCell,
}: EventCalendarProps) {
	const copy = resolveStrings(defaultEventCalendarStrings, strings)

	const [internalVisible, setInternalVisible] = useState<string[]>([])
	const visibleCategories = controlledVisibleCategories ?? internalVisible

	/* The prop, then the provider's dates config (shared with the date pickers), then Monday. */
	const { weekStartsOn: configWeekStartsOn, locale: configLocale } = useDatesConfig()
	const weekStartsOn = weekStartsOnProp ?? configWeekStartsOn ?? 1
	const resolvedLocale = locale ?? configLocale

	const calendar = useEventCalendar({
		events,
		date,
		defaultDate,
		viewMode,
		defaultViewMode,
		onDateChange,
		onViewModeChange,
		dataOptions: {
			weekStartsOn,
			showWeekends,
			visibleCategories: visibleCategories.length > 0 ? visibleCategories : undefined,
		},
	})

	/*
	 * Pressing a chip hides its category. Since empty means "all", the first press yields
	 * everything-but-this, and a list that grows back to the full set collapses to empty.
	 */
	const toggleCategory = (categoryId: string) => {
		const showingAll = visibleCategories.length === 0
		const next = showingAll
			? categories.filter((category) => category.id !== categoryId).map((category) => category.id)
			: visibleCategories.includes(categoryId)
				? visibleCategories.filter((id) => id !== categoryId)
				: [...visibleCategories, categoryId]

		const collapsed = next.length === categories.length ? [] : next
		if (onVisibleCategoriesChange) onVisibleCategoriesChange(collapsed)
		else setInternalVisible(collapsed)
	}

	/* Rotated to `weekStartsOn`, and trimmed when weekends are hidden. */
	const weekdays = useMemo(() => {
		const days = copy.weekdaysShort
		const rotated = [...days.slice(weekStartsOn), ...days.slice(0, weekStartsOn)]
		if (showWeekends) return rotated
		return rotated.filter((_, index) => {
			const weekday = (weekStartsOn + index) % 7
			return weekday !== 0 && weekday !== 6
		})
	}, [copy.weekdaysShort, showWeekends, weekStartsOn])

	const isDayDisabled = (day: Date) => {
		if (matchesRule(disabledDates, day)) return true
		const dayStart = startOfDay(day)
		if (minDate && dayStart < startOfDay(minDate)) return true
		if (maxDate && dayStart > startOfDay(maxDate)) return true
		return false
	}

	/* Filtered here, at render, so counts and the overflow line agree with what is drawn. */
	const days = useMemo(() => {
		if (!filterEvent) return calendar.calendarDays
		return calendar.calendarDays.map((day) => {
			const kept = day.events.filter(filterEvent)
			return { ...day, events: kept, eventCount: kept.length, hasMultipleEvents: kept.length > 1 }
		})
	}, [calendar.calendarDays, filterEvent])

	const navDisabled = useMemo(() => {
		const first = days[0]?.date
		const last = days[days.length - 1]?.date
		if (!first || !last) return { prev: false, next: false }
		return {
			prev: !!minDate && startOfDay(first) <= startOfDay(minDate),
			next: !!maxDate && startOfDay(last) >= startOfDay(maxDate),
		}
	}, [days, maxDate, minDate])

	const handleDayClick = (day: CalendarDayData) => {
		if (isDayDisabled(day.date)) return
		onDayClick?.(day.date, day.events)
	}

	if (loading) {
		return (
			<div className={cx("event-calendar--component", styles.loading, className)}>
				<Text type="secondary">{copy.loading}</Text>
			</div>
		)
	}

	const gridColumns = showWeekends ? 7 : 5

	return (
		<div
			data-slot="event-calendar"
			className={cx("event-calendar--component", styles.root, className)}
			style={{ "--calendar-columns": gridColumns } as CSSProperties}
		>
			{showHeader && (
				<EventCalendarHeader
					currentDate={calendar.currentDate}
					viewMode={calendar.viewMode}
					displayLabel={calendar.displayLabel}
					onPrevious={calendar.goToPreviousPeriod}
					onNext={calendar.goToNextPeriod}
					onToday={calendar.goToToday}
					/* The hook's setter (not the consumer's handler), so uncontrolled calendars can switch views. */
					onViewModeChange={calendar.setViewMode}
					onDateChange={calendar.setDate}
					locale={resolvedLocale}
					actions={actions}
					rangeMode={rangeMode}
					minDate={minDate}
					maxDate={maxDate}
					prevDisabled={navDisabled.prev}
					nextDisabled={navDisabled.next}
					strings={copy}
				/>
			)}

			{showLegend && categories.length > 0 && (
				<EventCalendarLegend
					categories={categories}
					visibleCategories={visibleCategories}
					onToggleCategory={enableCategoryFilter ? toggleCategory : undefined}
					enableFiltering={enableCategoryFilter}
					strings={copy}
				/>
			)}

			{!calendar.hasEvents && emptyStateMessage ? (
				<Empty title={emptyStateMessage} description={false} padding="md" border />
			) : calendar.viewMode === "agenda" ? (
				<AgendaView
					days={days}
					categories={categories}
					emptyLabel={copy.emptyDay}
					onEventClick={onEventClick}
					renderEvent={renderEvent}
				/>
			) : (
				<div className={styles.grid}>
					<div className={styles.weekdays} data-variant={dayHeadingVariant}>
						{weekdays.map((day, index) =>
							renderDayHeading ? (
								<div key={day}>{renderDayHeading(day, index)}</div>
							) : (
								<div key={day} className={cx(styles.weekday, dayHeadingClassName)}>
									{/* `inherit`, so each heading variant's colour reaches the text. */}
									<Text type="inherit" size="xs" weight={dayHeadingVariant === "accent" ? "medium" : "normal"}>
										{day}
									</Text>
								</div>
							),
						)}
					</div>

					<div className={styles.days}>
						{days.map((day) => {
							const disabled = isDayDisabled(day.date)
							const defaultRender = () => (
								<EventCalendarDayCell
									data={day}
									categories={categories}
									maxEvents={maxEventsPerDay}
									onClick={() => handleDayClick(day)}
									onEventClick={onEventClick}
									compact={compact}
									strings={copy}
									renderEvent={renderEvent}
								/>
							)

							return (
								<div
									key={day.date.toISOString()}
									className={styles.dayWrap}
									data-disabled={disabled || undefined}
									aria-disabled={disabled || undefined}
								>
									{renderDayCell ? renderDayCell(day, defaultRender) : defaultRender()}
								</div>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}

/** Only the days that have events. */
function AgendaView({
	days,
	categories,
	emptyLabel,
	onEventClick,
	renderEvent,
}: {
	days: CalendarDayData[]
	categories: EventCalendarProps["categories"]
	emptyLabel: string
	onEventClick?: EventCalendarProps["onEventClick"]
	renderEvent?: EventCalendarProps["renderEvent"]
}) {
	const withEvents = days.filter((day) => day.eventCount > 0)

	if (withEvents.length === 0) {
		return <Empty title={emptyLabel} description={false} padding="md" border />
	}

	return (
		<div className={styles.agenda}>
			{withEvents.map((day) => (
				<section key={day.date.toISOString()} className={styles.agendaDay} data-today={day.isToday || undefined}>
					<div className={styles.agendaDate}>
						<Text size="xs" type="secondary" weight="medium">
							{day.date.toLocaleDateString(undefined, { weekday: "short" })}
						</Text>
						{/* `inherit`, so today's accent on the rail reaches the number. */}
						<Text type="inherit" size="lg" weight="semibold" numeric>{day.date.getDate()}</Text>
					</div>

					<div className={styles.agendaEvents}>
						{day.events.map((event) => {
							const category = getCategoryById(categories, event.category)
							if (renderEvent) return <div key={event.id}>{renderEvent(event, category)}</div>
							return (
								<EventCalendarEventCard
									key={event.id}
									event={event}
									category={category}
									onClick={onEventClick ? () => onEventClick(event) : undefined}
								/>
							)
						})}
					</div>
				</section>
			))}
		</div>
	)
}
