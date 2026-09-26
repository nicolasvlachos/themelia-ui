import { format as formatDateFns, type Locale } from "date-fns"

export type DateInput = Date | string | number | null | undefined

export interface FormatDateRangeOptions {
	pattern?: string
	separator?: string
	/** date-fns locale object. The React component reads it from the scope for you. */
	locale?: Locale
}

/** Returns undefined rather than an Invalid Date, so the empty state renders instead. */
export function parseDateInput(value: DateInput): Date | undefined {
	if (value === null || value === undefined || value === "") return undefined
	const date = value instanceof Date ? value : new Date(value)
	return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * Collapses a range to its distinct parts: same day renders once, and a range within one
 * month drops the repeated month from the start date.
 */
export function formatDateRange(
	start: DateInput,
	end: DateInput,
	{ pattern = "d MMM yyyy", separator = " – ", locale }: FormatDateRangeOptions = {},
) {
	const from = parseDateInput(start)
	const to = parseDateInput(end)
	if (!from && !to) return undefined
	if (!to) return formatDateFns(from!, pattern, { locale })
	if (!from) return formatDateFns(to, pattern, { locale })
	const fromLabel = formatDateFns(from, pattern, { locale })
	const toLabel = formatDateFns(to, pattern, { locale })
	if (fromLabel === toLabel) return fromLabel

	const sameMonth =
		from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()
	return `${sameMonth && pattern === "d MMM yyyy" ? formatDateFns(from, "d", { locale }) : fromLabel}${separator}${toLabel}`
}
