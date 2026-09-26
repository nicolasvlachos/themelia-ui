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
	/**
	 * The moment to show: whatever the API returned — a Date, an ISO string or an epoch
	 * number. Parsed once, here.
	 */
	value?: DateInput
	/**
	 * A date-fns pattern, when the default is not what this column needs. `DatePrimitive`
	 * falls back to the scope's `dates.format`, `Time` to its `dates.timeFormat`, and
	 * `DateTime` to the two joined.
	 */
	pattern?: string
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

/**
 * A date in the scope's pattern. Also exported as `Date`, its natural name: `DatePrimitive`
 * exists because `Date` collides with the global in a file that also constructs one, so
 * import whichever reads better at the call site.
 */
export function DatePrimitive({ value, pattern, ...props }: DateBaseProps) {
	const { format, locale } = useDatesConfig()
	const date = parseDateInput(value)
	return (
		<ValueRoot hook="date" {...props}>
			{date ? formatDateFns(date, pattern ?? format, { locale }) : undefined}
		</ValueRoot>
	)
}

/**
 * The same value as a time of day. Three components rather than a granularity prop, because
 * a column shows one of them and never switches.
 */
export function Time({ value, pattern, ...props }: DateBaseProps) {
	const { locale, timeFormat } = useDatesConfig()
	const date = parseDateInput(value)
	return (
		<ValueRoot hook="time" numeric {...props}>
			{date ? formatDateFns(date, pattern ?? timeFormat ?? "HH:mm", { locale }) : undefined}
		</ValueRoot>
	)
}

/**
 * The same value as a date and a time. Three components rather than a granularity prop,
 * because a column shows one of them and never switches.
 */
export function DateTime({ value, pattern, ...props }: DateBaseProps) {
	const { format, locale, timeFormat } = useDatesConfig()
	const date = parseDateInput(value)
	return (
		<ValueRoot hook="date-time" {...props}>
			{date ? formatDateFns(date, pattern ?? `${format} ${timeFormat ?? "HH:mm"}`, { locale }) : undefined}
		</ValueRoot>
	)
}

export interface DateRangeProps extends Omit<DateBaseProps, "value"> {
	/**
	 * Where the range begins. Either end may be absent — an open range is a real state, not
	 * an error.
	 */
	start?: DateInput
	/**
	 * Where the range ends. Either end may be absent — an open range is a real state, not an
	 * error.
	 */
	end?: DateInput
	/**
	 * A date-fns pattern for both ends, when the collapsing is not wanted: only the default
	 * drops a repeated month.
	 * @default "d MMM yyyy"
	 */
	pattern?: string
	/** Between the two ends. An en dash by default. */
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
	/**
	 * Distinguishes "less than a minute" from "30 seconds". Only worth it for a feed measured
	 * in seconds.
	 */
	includeSeconds?: boolean
	/**
	 * Replaces the wording for this one value. Falls back to the scope's
	 * `dates.formatRelativeTime`, and then to date-fns, whose built-in wording the scope's
	 * `dates.locale` translates: a date-fns locale OBJECT, since the locales are modules and
	 * cannot be looked up from a BCP-47 tag without putting every language in every bundle.
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
