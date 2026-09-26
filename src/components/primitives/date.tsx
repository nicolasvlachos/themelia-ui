/**
 * Date primitives. `Date` is a global, so the component is `DatePrimitive`, aliased by the
 * barrel. All accept a Date, an ISO string or an epoch number.
 */
import type { ReactNode, Ref } from "react"
import { format as formatDateFns, formatDistance, formatDistanceToNow } from "date-fns"

import { useDatesConfig } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"
import { formatDateRange, parseDateInput, type DateInput } from "./date.format"

/** What DatePrimitive, Time, and DateTime all take. Three components, one shape. */
export interface DateBaseProps extends SpanProps {
	value?: DateInput
	/** date-fns pattern. Falls back to the scope's `dateFormat`. */
	pattern?: string
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

export function DatePrimitive({ value, pattern, ...props }: DateBaseProps) {
	const { format, locale } = useDatesConfig()
	const date = parseDateInput(value)
	return (
		<ValueRoot hook="date" {...props}>
			{date ? formatDateFns(date, pattern ?? format, { locale }) : undefined}
		</ValueRoot>
	)
}

export function Time({ value, pattern = "HH:mm", ...props }: DateBaseProps) {
	const { locale } = useDatesConfig()
	const date = parseDateInput(value)
	return (
		<ValueRoot hook="time" numeric {...props}>
			{date ? formatDateFns(date, pattern, { locale }) : undefined}
		</ValueRoot>
	)
}

export function DateTime({ value, pattern, ...props }: DateBaseProps) {
	const { format, locale } = useDatesConfig()
	const date = parseDateInput(value)
	return (
		<ValueRoot hook="date-time" {...props}>
			{date ? formatDateFns(date, pattern ?? `${format} HH:mm`, { locale }) : undefined}
		</ValueRoot>
	)
}

export interface DateRangeProps extends Omit<DateBaseProps, "value"> {
	start?: DateInput
	end?: DateInput
	separator?: string
}

export function DateRange({ start, end, pattern, separator, ...props }: DateRangeProps) {
	const { locale } = useDatesConfig()
	return (
		<ValueRoot hook="date-range" {...props}>
			{formatDateRange(start, end, { pattern, separator, locale })}
		</ValueRoot>
	)
}

export interface RelativeTimeProps extends Omit<DateBaseProps, "pattern"> {
	/**
	 * The moment to measure against. Defaults to the clock.
	 *
	 * Supply it wherever the render has to be reproducible — a server render whose
	 * markup must match the client's, a test asserting the string, a visual snapshot.
	 * Reading the clock inside the component makes all three of those flaky, and it
	 * does not buy a live value in exchange: nothing re-renders it as time passes.
	 */
	now?: DateInput
	/**
	 * "7 days ago" rather than "7 days". On by default, because a bare duration beside a
	 * row of dates reads as a length rather than a moment.
	 */
	addSuffix?: boolean
	/** Distinguishes "less than a minute" from "30 seconds". */
	includeSeconds?: boolean
	/**
	 * Replaces the wording for this one value. Falls back to the scope's
	 * `dates.formatRelativeTime`, and then to date-fns.
	 */
	formatRelativeTime?: (date: Date, now: Date) => string
}

/**
 * "3 days ago" — for recency, where the exact timestamp is not the point. The precise
 * value stays available in the title attribute.
 */
export function RelativeTime({
	value,
	now,
	addSuffix = true,
	includeSeconds = false,
	formatRelativeTime,
	...props
}: RelativeTimeProps) {
	const { locale, formatRelativeTime: scopeFormatter } = useDatesConfig()
	const date = parseDateInput(value)
	const base = parseDateInput(now)

	/*
	 * A consumer-supplied formatter wins over date-fns entirely, because relative time is
	 * not a format string in any language: it pluralises, and several languages inflect
	 * the unit by the number. A product with its own translation catalogue already has
	 * those forms, and passing date-fns a locale it does not ship is not an option.
	 */
	const formatter = formatRelativeTime ?? scopeFormatter

	const label = !date
		? undefined
		: formatter
			? formatter(date, base ?? new Date())
			: base
				? formatDistance(date, base, { addSuffix, includeSeconds, locale })
				: formatDistanceToNow(date, { addSuffix, includeSeconds, locale })

	return (
		<ValueRoot hook="relative-time" title={date?.toISOString()} {...props}>
			{label}
		</ValueRoot>
	)
}
