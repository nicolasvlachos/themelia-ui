/**
 * Places events onto days. Day keys are built from local date parts, never
 * `toISOString()`: local midnight ahead of UTC serialises to the previous UTC day.
 */
import {
	eachDayOfInterval, endOfMonth, endOfWeek, isSameDay, isSameMonth, isToday, isWeekend,
	startOfDay, startOfMonth, startOfWeek,
} from "date-fns"
import { useMemo } from "react"

import type {
	CalendarDayData, CalendarEvent, CalendarViewMode, UseEventCalendarDataOptions,
} from "./event-calendar.types"

function localDayKey(date: Date): string {
	const month = `${date.getMonth() + 1}`.padStart(2, "0")
	const day = `${date.getDate()}`.padStart(2, "0")
	return `${date.getFullYear()}-${month}-${day}`
}

/** All-day first, then by start time — the order a day is read in. */
function byStart(a: CalendarEvent, b: CalendarEvent): number {
	if (a.allDay && !b.allDay) return -1
	if (!a.allDay && b.allDay) return 1
	return a.startDate.getTime() - b.startDate.getTime()
}

export function useEventCalendarData(
	events: CalendarEvent[],
	currentDate: Date,
	viewMode: CalendarViewMode,
	options: UseEventCalendarDataOptions = {},
): CalendarDayData[] {
	const { weekStartsOn = 1, showWeekends = true, visibleCategories } = options

	return useMemo(() => {
		const monthStart = startOfMonth(currentDate)
		const monthEnd = endOfMonth(currentDate)

		/* Month spans whole weeks (neighbouring days drawn muted); agenda spans the month exactly. */
		const [rangeStart, rangeEnd] =
			viewMode === "month"
				? [startOfWeek(monthStart, { weekStartsOn }), endOfWeek(monthEnd, { weekStartsOn })]
				: viewMode === "week"
					? [startOfWeek(currentDate, { weekStartsOn }), endOfWeek(currentDate, { weekStartsOn })]
					: [monthStart, monthEnd]

		const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd })

		const visible =
			visibleCategories && visibleCategories.length > 0
				? events.filter((event) => visibleCategories.includes(event.category))
				: events

		const byDay = new Map<string, CalendarEvent[]>()

		for (const event of visible) {
			const start = startOfDay(event.startDate)
			// An unparseable date is dropped rather than crashing the grid.
			if (Number.isNaN(start.getTime())) continue

			let end = start
			if (event.endDate && !Number.isNaN(event.endDate.getTime())) {
				const normalised = startOfDay(event.endDate)
				// An end before the start is nonsense; treat it as a single-day event.
				if (normalised.getTime() >= start.getTime()) end = normalised
			}

			// A multi-day event appears on every day it spans, not only its first.
			for (const day of eachDayOfInterval({ start, end })) {
				const key = localDayKey(day)
				const bucket = byDay.get(key)
				if (bucket) bucket.push(event)
				else byDay.set(key, [event])
			}
		}

		return days
			.filter((day) => showWeekends || !isWeekend(day))
			.map((day) => {
				const dayEvents = [...(byDay.get(localDayKey(day)) ?? [])].sort(byStart)
				return {
					date: day,
					isCurrentMonth: isSameMonth(day, currentDate),
					isToday: isToday(day),
					isWeekend: isWeekend(day),
					events: dayEvents,
					eventCount: dayEvents.length,
					hasMultipleEvents: dayEvents.length > 1,
				}
			})
	}, [currentDate, events, showWeekends, viewMode, visibleCategories, weekStartsOn])
}

/** The same placement for one day, for a consumer building their own surface. */
export function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
	const target = startOfDay(date)
	return events
		.filter((event) => {
			const start = startOfDay(event.startDate)
			const end = event.endDate ? startOfDay(event.endDate) : start
			return (
				isSameDay(target, start) ||
				isSameDay(target, end) ||
				(target > start && target < end)
			)
		})
		.sort(byStart)
}

export function getCategoryById<T extends { id: string }>(
	categories: T[],
	categoryId: string,
): T | undefined {
	return categories.find((category) => category.id === categoryId)
}
