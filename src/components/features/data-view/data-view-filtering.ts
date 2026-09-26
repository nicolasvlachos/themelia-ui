/**
 * Client-side row matching against the applied filters — the default for local data;
 * server-side filtering goes through `filterRows` instead.
 *
 * GT/LT/BETWEEN compare as numbers (dates as timestamps); a value that will not convert
 * does not match rather than comparing as text.
 */
import { isValid, parse } from "date-fns"

import {
	FilterOperator, FilterType, type ActiveFilter, type FilterConfig,
} from "@/components/features/filters"

import type { DataViewFilterValueGetter } from "./data-view.types"

/** `venue.name` walks; a bare key does not. */
function readPath(row: unknown, path: string): unknown {
	if (!path.includes(".")) {
		return row && typeof row === "object" ? (row as Record<string, unknown>)[path] : undefined
	}
	return path.split(".").reduce<unknown>((current, part) => {
		if (!current || typeof current !== "object") return undefined
		return (current as Record<string, unknown>)[part]
	}, row)
}

function stringify(value: unknown): string {
	if (value === null || value === undefined) return ""
	if (value instanceof Date) return value.toISOString()
	if (typeof value === "string") return value
	if (typeof value === "number" || typeof value === "boolean") return String(value)
	return ""
}

/** Everything in a row, flattened for free-text search. Bounded at two levels, which also guards cycles. */
function collectText(value: unknown, depth = 0): string {
	if (value === null || value === undefined || depth > 2) return ""
	if (value instanceof Date) return value.toISOString()
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
		return String(value)
	}
	if (Array.isArray(value)) return value.map((entry) => collectText(entry, depth + 1)).join(" ")
	if (typeof value === "object") {
		return Object.values(value as Record<string, unknown>)
			.map((entry) => collectText(entry, depth + 1))
			.join(" ")
	}
	return ""
}

function candidatesOf(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map(stringify).filter(Boolean).map((entry) => entry.toLowerCase())
	}
	const single = stringify(value)
	return single ? [single.toLowerCase()] : []
}

function toNumber(value: string): number | undefined {
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

function toTimestamp(value: string, pattern?: string): number | undefined {
	if (pattern) {
		const parsed = parse(value, pattern, new Date(0))
		if (isValid(parsed)) return parsed.getTime()
	}
	const native = new Date(value)
	return isValid(native) ? native.getTime() : undefined
}

function matchesComparable(
	candidates: string[],
	values: string[],
	operator: ActiveFilter["operator"],
	config?: FilterConfig,
): boolean {
	const convert =
		config?.type === FilterType.DATE
			? (value: string) => toTimestamp(value, config.dateFormat?.param ?? "yyyy-MM-dd")
			: toNumber

	const left = candidates.map(convert).filter((value): value is number => value !== undefined)
	const right = values.map(convert).filter((value): value is number => value !== undefined)

	// Nothing convertible: no match, rather than a string comparison.
	if (left.length === 0 || right.length === 0) return false

	const [first, second] = right

	switch (operator) {
		case FilterOperator.GT:
		case FilterOperator.AFTER:
			return left.some((value) => value > first!)
		case FilterOperator.GTE:
			return left.some((value) => value >= first!)
		case FilterOperator.LT:
		case FilterOperator.BEFORE:
			return left.some((value) => value < first!)
		case FilterOperator.LTE:
			return left.some((value) => value <= first!)
		case FilterOperator.BETWEEN:
			if (second === undefined) return false
			return left.some((value) => value >= first! && value <= second)
		default:
			return false
	}
}

function matchesFilter<TData extends object>(
	row: TData,
	filter: ActiveFilter,
	config: FilterConfig | undefined,
	getFilterValue?: DataViewFilterValueGetter<TData>,
): boolean {
	const values = filter.value.map((value) => value.trim().toLowerCase()).filter(Boolean)
	// A filter with no value matches everything — it is not applied.
	if (values.length === 0) return true

	/* A search filter matches the whole row, not a field named after its key. */
	if (config?.type === FilterType.SEARCH) {
		const haystack = collectText(row).toLowerCase()
		const negated =
			filter.operator === FilterOperator.NOT || filter.operator === FilterOperator.NOT_IN
		return negated
			? values.every((value) => !haystack.includes(value))
			: values.every((value) => haystack.includes(value))
	}

	const raw =
		getFilterValue?.(row, config ?? { key: filter.key, label: filter.key, type: FilterType.SEARCH }) ??
		readPath(row, filter.key)
	const candidates = candidatesOf(raw)
	if (candidates.length === 0) return false

	const isSelectLike =
		config?.type === FilterType.SELECT ||
		config?.type === FilterType.MULTI_SELECT ||
		config?.type === FilterType.ASYNC_SELECT

	switch (filter.operator) {
		case FilterOperator.CONTAINS:
			return values.every((value) => candidates.some((candidate) => candidate.includes(value)))
		case FilterOperator.HAS:
		case FilterOperator.HAS_ALL:
			return values.every((value) => candidates.includes(value))
		case FilterOperator.NOT_IN:
			return values.every((value) => !candidates.includes(value))
		case FilterOperator.NOT:
			/* "Is not": exact non-membership on a select; substring absence on free text. */
			return isSelectLike
				? values.every((value) => !candidates.includes(value))
				: values.every((value) => candidates.every((candidate) => !candidate.includes(value)))
		case FilterOperator.IN:
		case FilterOperator.EQUALS:
		case FilterOperator.HAS_ANY:
			// Any, not every: two ticked values in one filter mean either.
			return values.some((value) => candidates.includes(value))
		case FilterOperator.GT:
		case FilterOperator.GTE:
		case FilterOperator.LT:
		case FilterOperator.LTE:
		case FilterOperator.BEFORE:
		case FilterOperator.AFTER:
		case FilterOperator.BETWEEN:
			return matchesComparable(candidates, values, filter.operator, config)
		default:
			return values.some((value) => candidates.includes(value))
	}
}

/** Filters are ANDed; the values within one filter are ORed. */
export function applyDataViewFilters<TData extends object>(
	data: readonly TData[],
	activeFilters: readonly ActiveFilter[],
	filters: readonly FilterConfig[],
	getFilterValue?: DataViewFilterValueGetter<TData>,
): readonly TData[] {
	if (activeFilters.length === 0) return data

	const byKey = new Map(filters.map((filter) => [filter.key, filter]))
	return data.filter((row) =>
		activeFilters.every((filter) =>
			matchesFilter(row, filter, byKey.get(filter.key), getFilterValue),
		),
	)
}
