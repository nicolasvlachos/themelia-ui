/**
 * The pure parts: validating a value, and naming it.
 */
import type { FilterStrings } from "./filters.strings"
import type { FilterConfig, FilterOption } from "./filters.types"
import { FilterType } from "./filters.types"

export function getFilterOption(
	filter: FilterConfig,
	value: string,
): FilterOption | undefined {
	return filter.options?.find((option) => option.value === value)
}

export function validateFilterValue(
	filter: FilterConfig,
	value: unknown,
	strings: FilterStrings,
): boolean | string {
	const rules = filter.validation

	/* Date values are formatted strings; the numeric and pattern rules below do not apply. */
	if (filter.type === FilterType.DATE) {
		if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) return true
	}

	if (!rules) return true

	if (rules.required && (!value || (Array.isArray(value) && value.length === 0))) {
		return strings.validation.required
	}

	if (typeof value === "number") {
		if (rules.min !== undefined && value < rules.min) return strings.validation.minValue(rules.min)
		if (rules.max !== undefined && value > rules.max) return strings.validation.maxValue(rules.max)
	}

	if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
		return strings.validation.invalidFormat
	}

	if (rules.custom) {
		const result = rules.custom(value)
		// A string IS the message; `false` means invalid with nothing to say.
		if (typeof result === "string" || !result) return result
	}

	return true
}

/** The value as the pill says it: the consumer's `format`, else option labels, else the raw strings. */
export function formatFilterValue(
	filter: FilterConfig,
	value: string[],
	strings: FilterStrings,
	resolveAsyncLabel?: (value: string) => string | undefined,
): string {
	if (value.length === 0) return strings.nothingSelected
	if (filter.format) return filter.format(value)

	const labels = value.map(
		(entry) => getFilterOption(filter, entry)?.label ?? resolveAsyncLabel?.(entry) ?? entry,
	)

	if (labels.length === 1) return labels[0]!

	/* Up to two are named; more become a count. */
	if (labels.length === 2) return labels.join(", ")

	return strings.selected(value.length, (filter.pluralLabel ?? filter.label).toLowerCase())
}
