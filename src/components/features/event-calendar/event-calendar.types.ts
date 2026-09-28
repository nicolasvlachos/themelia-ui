/**
 * EventCalendar types. An event names a `category`; the category owns the `colorToken`,
 * so colour is defined once. `CalendarColorToken` is a closed set of theme-aware names,
 * never an arbitrary colour.
 */
import type { ReactNode } from "react"
import type { Locale } from "date-fns"

import type { ActionDefinition } from "@/components/base/action-menu"
import type { SemanticTone } from "@/lib/component-vocabulary"

import type { EventCalendarStrings, EventCalendarEventCardStrings } from "./event-calendar.strings"

export interface CalendarEvent {
	id: string
	title: string
	description?: string
	startDate: Date
	/** Inclusive. An event without one occupies its start day alone. */
	endDate?: Date
	allDay?: boolean
	/** A category id. An unknown one falls back to the neutral token. */
	category: string
	/** Free-form payload. The default card reads `customerName`, `guestCount`, `serviceName` and `cellTitle` when present. */
	metadata?: Record<string, unknown>
	url?: string
}

export type CalendarColorToken =
	| "neutral" | "destructive" | "warning" | "amber" | "yellow" | "success" | "info" | "primary"

export interface EventCategory {
	id: string
	label: string
	colorToken: CalendarColorToken
	icon?: ReactNode
	description?: string
}

/** The only fallback: a category that is missing entirely. */
export function resolveCategoryColorToken(category?: EventCategory | null): CalendarColorToken {
	return category?.colorToken ?? "neutral"
}

/** The shared tone a category's marks render as `data-tone`: `amber` and `yellow` name warning. */
export function resolveCategoryTone(category?: EventCategory | null): Extract<SemanticTone, CalendarColorToken> {
	const token = resolveCategoryColorToken(category)
	return token === "amber" || token === "yellow" ? "warning" : token
}

export type CalendarViewMode = "month" | "week" | "agenda"

/** One day, after the events have been placed on it. */
export interface CalendarDayData {
	date: Date
	isCurrentMonth: boolean
	isToday: boolean
	isWeekend: boolean
	/** All-day first, then by start time. */
	events: CalendarEvent[]
	eventCount: number
	hasMultipleEvents: boolean
}

/** Explicit dates, a predicate, or both — combined with OR. */
export type DateRule =
	| Date[]
	| ((date: Date) => boolean)
	| { dates?: Date[]; predicate?: (date: Date) => boolean }

/** Returns true to KEEP an event. */
export type EventFilter = (event: CalendarEvent) => boolean

export type RenderEventFn = (event: CalendarEvent, category: EventCategory | undefined) => ReactNode

/** `defaultRender` is what would have drawn, so decorating is as easy as replacing. */
export type RenderDayCellFn = (day: CalendarDayData, defaultRender: () => ReactNode) => ReactNode

/** `date` offers a full calendar; `month-year` offers a compact month/year jump. */
export type EventCalendarRangeMode = "date" | "month-year"

export type EventCalendarDayHeadingVariant = "default" | "accent" | "tinted" | "bordered"

export interface EventCalendarProps {
	/**
	 * The calendar does no fetching of its own. An event with an `endDate` appears on every day
	 * it spans, not only its first.
	 */
	events: CalendarEvent[]
	/** The categories events name. Each owns its colour, so colour is defined once. */
	categories: EventCategory[]
	/**
	 * Controlled. The switcher works either way. Week steps by weeks; month and agenda step by
	 * months.
	 */
	viewMode?: CalendarViewMode
	/** Uncontrolled: the view to start in. */
	defaultViewMode?: CalendarViewMode
	onViewModeChange?: (mode: CalendarViewMode) => void
	/** Where the calendar is looking. Controlled, like the view. */
	date?: Date
	/** Uncontrolled: where the calendar starts looking. */
	defaultDate?: Date
	onDateChange?: (date: Date) => void
	/** A chip press calls this and stops there. */
	onEventClick?: (event: CalendarEvent) => void
	/** A press anywhere else in a day's cell calls this, with the day and everything on it. */
	onDayClick?: (date: Date, events: CalendarEvent[]) => void
	/**
	 * Chips drawn per day before the rest collapse into an overflow line. The overflow dots are
	 * the categories of the HIDDEN events, not the first three in the list.
	 */
	maxEventsPerDay?: number
	showLegend?: boolean
	showHeader?: boolean
	showWeekends?: boolean
	/**
	 * 0 is Sunday. Falls back to the provider's dates config, then Monday — the same source the
	 * kit's own pickers read.
	 */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	locale?: Locale
	/** Makes the legend chips toggle their category. */
	enableCategoryFilter?: boolean
	/**
	 * Ids currently shown. An EMPTY list means all are shown — a filter nobody has touched hides
	 * nothing.
	 */
	visibleCategories?: string[]
	onVisibleCategoriesChange?: (categories: string[]) => void
	loading?: boolean
	emptyStateMessage?: string
	className?: string
	compact?: boolean
	/** Rendered in the header, before the today and navigation controls. */
	actions?: ActionDefinition[]
	strings?: Partial<EventCalendarStrings>
	dayHeadingVariant?: EventCalendarDayHeadingVariant
	dayHeadingClassName?: string
	renderDayHeading?: (day: string, index: number) => ReactNode
	rangeMode?: EventCalendarRangeMode
	/** Navigation stops here, and days beyond it are drawn but not clickable. */
	minDate?: Date
	/** Navigation stops here, and days beyond it are drawn but not clickable. */
	maxDate?: Date
	/**
	 * Days drawn but not clickable. A `DateRule` takes dates, a predicate, or both, combined
	 * with OR.
	 */
	disabledDates?: DateRule
	/**
	 * Hides events at render time without touching `events`. Counts and the overflow line
	 * follow it, so what is drawn and what is counted agree.
	 */
	filterEvent?: EventFilter
	/** Replaces how an event draws: its chip in a day cell, its card in the agenda. */
	renderEvent?: RenderEventFn
	/**
	 * Replaces a day's cell. It receives `defaultRender`, so decorating is as easy as replacing.
	 */
	renderDayCell?: RenderDayCellFn
}

export interface EventCalendarDayCellProps {
	data: CalendarDayData
	categories: EventCategory[]
	maxEvents?: number
	onClick: () => void
	/** Fires instead of `onClick` when the press was on an event chip. */
	onEventClick?: (event: CalendarEvent) => void
	compact?: boolean
	strings?: Partial<Pick<EventCalendarStrings, "moreEvents">>
	renderEvent?: RenderEventFn
}

export interface EventCalendarEventBadgeProps {
	event: CalendarEvent
	category: EventCategory | undefined
	compact?: boolean
	onClick?: () => void
	/** Overrides this chip's own copy — its accessible name. */
	strings?: Partial<EventCalendarEventCardStrings>
}

export interface EventCalendarEventCardProps {
	event: CalendarEvent
	category: EventCategory | undefined
	onClick?: () => void
}

export interface EventCalendarLegendProps {
	categories: EventCategory[]
	/** Empty means all are shown. */
	visibleCategories?: string[]
	onToggleCategory?: (categoryId: string) => void
	enableFiltering?: boolean
	strings?: Partial<Pick<EventCalendarStrings, "filterCategories">>
	className?: string
}

export interface EventCalendarHeaderProps {
	currentDate: Date
	viewMode: CalendarViewMode
	/** The formatted period — "March 2026", or a week's span. */
	displayLabel: string
	onPrevious: () => void
	onNext: () => void
	onToday: () => void
	onViewModeChange?: (mode: CalendarViewMode) => void
	onDateChange?: (date: Date) => void
	locale?: Locale
	actions?: ActionDefinition[]
	strings?: Partial<EventCalendarStrings>
	rangeMode?: EventCalendarRangeMode
	minDate?: Date
	maxDate?: Date
	prevDisabled?: boolean
	nextDisabled?: boolean
	className?: string
}

export interface UseEventCalendarResult {
	currentDate: Date
	viewMode: CalendarViewMode
	calendarDays: CalendarDayData[]
	visibleEvents: CalendarEvent[]
	goToToday: () => void
	goToNextPeriod: () => void
	goToPreviousPeriod: () => void
	setDate: (date: Date) => void
	setViewMode: (mode: CalendarViewMode) => void
	displayLabel: string
	hasEvents: boolean
}

export interface UseEventCalendarDataOptions {
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	showWeekends?: boolean
	visibleCategories?: string[]
}
