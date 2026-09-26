/**
 * useEventCalendar — the current date and view, each independently controllable. The prop
 * wins when given; setters always call the consumer's handler.
 */
import { addMonths, addWeeks, format, subMonths, subWeeks } from "date-fns"
import { useDatesConfig } from "@/lib/ui-provider"
import { useCallback, useMemo, useState } from "react"

import type {
	CalendarEvent, CalendarViewMode, UseEventCalendarDataOptions, UseEventCalendarResult,
} from "./event-calendar.types"
import { useEventCalendarData } from "./use-event-calendar-data"

export interface UseEventCalendarOptions {
	events: CalendarEvent[]
	date?: Date
	defaultDate?: Date
	viewMode?: CalendarViewMode
	defaultViewMode?: CalendarViewMode
	onDateChange?: (date: Date) => void
	onViewModeChange?: (mode: CalendarViewMode) => void
	dataOptions?: UseEventCalendarDataOptions
}

export function useEventCalendar({
	events,
	date,
	defaultDate,
	viewMode,
	defaultViewMode = "month",
	onDateChange,
	onViewModeChange,
	dataOptions = {},
}: UseEventCalendarOptions): UseEventCalendarResult {
	const { locale } = useDatesConfig()
	/* Lazy, so `new Date()` is not re-created on every render. */
	const [internalDate, setInternalDate] = useState<Date>(() => defaultDate ?? new Date())
	const [internalViewMode, setInternalViewMode] = useState<CalendarViewMode>(defaultViewMode)

	const currentDate = date ?? internalDate
	const currentViewMode = viewMode ?? internalViewMode

	const commitDate = useCallback(
		(next: Date) => {
			if (date === undefined) setInternalDate(next)
			onDateChange?.(next)
		},
		[date, onDateChange],
	)

	const setViewMode = useCallback(
		(mode: CalendarViewMode) => {
			if (viewMode === undefined) setInternalViewMode(mode)
			onViewModeChange?.(mode)
		},
		[onViewModeChange, viewMode],
	)

	const calendarDays = useEventCalendarData(events, currentDate, currentViewMode, dataOptions)

	const { visibleCategories } = dataOptions
	const visibleEvents = useMemo(
		() =>
			visibleCategories && visibleCategories.length > 0
				? events.filter((event) => visibleCategories.includes(event.category))
				: events,
		[events, visibleCategories],
	)

	const goToToday = useCallback(() => commitDate(new Date()), [commitDate])

	/* Agenda steps by month, like the month view: its range is the month. */
	const goToNextPeriod = useCallback(
		() =>
			commitDate(
				currentViewMode === "week" ? addWeeks(currentDate, 1) : addMonths(currentDate, 1),
			),
		[commitDate, currentDate, currentViewMode],
	)

	const goToPreviousPeriod = useCallback(
		() =>
			commitDate(
				currentViewMode === "week" ? subWeeks(currentDate, 1) : subMonths(currentDate, 1),
			),
		[commitDate, currentDate, currentViewMode],
	)

	/* The week label is read off the grid, so it matches the days shown (e.g. without weekends). */
	const displayLabel = useMemo(() => {
		if (currentViewMode === "week") {
			const first = calendarDays[0]?.date
			const last = calendarDays[calendarDays.length - 1]?.date
			if (first && last)
				return `${format(first, "MMM d", { locale })} – ${format(last, "MMM d, yyyy", { locale })}`
		}
		return format(currentDate, "MMMM yyyy", { locale })
		/* `locale` included, so the label re-renders on a language switch. */
	}, [calendarDays, currentDate, currentViewMode, locale])

	return {
		currentDate,
		viewMode: currentViewMode,
		calendarDays,
		visibleEvents,
		goToToday,
		goToNextPeriod,
		goToPreviousPeriod,
		setDate: commitDate,
		setViewMode,
		displayLabel,
		hasEvents: visibleEvents.length > 0,
	}
}
