/**
 * Filters ⇄ a plain query record, router-agnostic: the consumer hands the record to their
 * router.
 *
 * The operator travels in a companion key (`status=confirmed&status__op=not`), written only
 * when it differs from the type's default.
 */
import { getDefaultOperatorForType } from "./filter-operators"
import { FilterOperator, FilterType, type ActiveFilter, type FilterConfig } from "./filters.types"

export type FilterQueryValue =
	| string | number | boolean | null | undefined
	| readonly (string | number | boolean | null | undefined)[]

export type FilterQueryRecord = Record<string, string | string[] | undefined>
export type FilterQueryInput = URLSearchParams | Record<string, FilterQueryValue>

/** `repeat` writes `tag=a&tag=b`; `comma` writes `tag=a,b`. */
export type FilterQueryArrayFormat = "repeat" | "comma"
export type FilterQueryOperatorMode = "changed" | "always" | "never"

export interface FilterQueryOptions {
	operatorSuffix?: string
	arrayFormat?: FilterQueryArrayFormat
	/** Keeps query keys this does not own. */
	preserveUnrelated?: boolean
	/** Dropped whenever the filters change — page 4 of the old result set is meaningless. */
	resetPageKeys?: readonly string[]
	includeOperators?: FilterQueryOperatorMode
}

const DEFAULT_OPERATOR_SUFFIX = "__op"
const DEFAULT_RESET_PAGE_KEYS = ["page"] as const

const KNOWN_OPERATORS = new Set<string>(Object.values(FilterOperator))

function normalise(input?: FilterQueryInput): Record<string, string[]> {
	const record: Record<string, string[]> = {}
	if (!input) return record

	if (input instanceof URLSearchParams) {
		input.forEach((value, key) => {
			record[key] = [...(record[key] ?? []), value]
		})
		return record
	}

	for (const [key, value] of Object.entries(input)) {
		const values = (Array.isArray(value) ? value : [value])
			.filter(
				(entry): entry is string | number | boolean =>
					entry !== null && entry !== undefined && String(entry).length > 0,
			)
			.map(String)
		if (values.length > 0) record[key] = values
	}

	return record
}

/** A single value comes back as a string, not a one-element array — routers expect that. */
function toRecord(record: Record<string, string[]>): FilterQueryRecord {
	const out: FilterQueryRecord = {}
	for (const [key, values] of Object.entries(record)) {
		if (values.length === 0) continue
		out[key] = values.length === 1 ? values[0] : values
	}
	return out
}

function readValues(
	record: Record<string, string[]>,
	key: string,
	arrayFormat: FilterQueryArrayFormat,
): string[] {
	const values = record[key] ?? []
	return arrayFormat === "comma" ? values.flatMap((value) => value.split(",")) : values
}

function defaultOperatorFor(config: FilterConfig): FilterOperator {
	return config.operator ?? config.operators?.[0]?.value ?? getDefaultOperatorForType(config.type)
}

function isMultiValue(config: FilterConfig): boolean {
	return (
		config.type === FilterType.MULTI_SELECT ||
		config.type === FilterType.TAGS ||
		config.multiple === true
	)
}

export function parseFiltersFromQuery(
	filterConfigs: readonly FilterConfig[],
	query: FilterQueryInput,
	options: FilterQueryOptions = {},
): ActiveFilter[] {
	const suffix = options.operatorSuffix ?? DEFAULT_OPERATOR_SUFFIX
	const arrayFormat = options.arrayFormat ?? "repeat"
	const record = normalise(query)

	// Driven by the configs: undeclared query keys belong to someone else.
	return filterConfigs.flatMap((config) => {
		const values = readValues(record, config.key, arrayFormat)
			.map((value) => value.trim())
			.filter((value) => value.length > 0)
		if (values.length === 0) return []

		const [raw] = record[`${config.key}${suffix}`] ?? []
		const operator =
			raw && KNOWN_OPERATORS.has(raw) ? (raw as FilterOperator) : defaultOperatorFor(config)

		return [
			{
				id: config.key,
				key: config.key,
				operator,
				// A single-value filter takes the first value.
				value: isMultiValue(config) ? values : [values[0]!],
			} satisfies ActiveFilter,
		]
	})
}

export function serializeFiltersToQuery(
	filterConfigs: readonly FilterConfig[],
	activeFilters: readonly ActiveFilter[],
	currentQuery?: FilterQueryInput,
	options: FilterQueryOptions = {},
): FilterQueryRecord {
	const suffix = options.operatorSuffix ?? DEFAULT_OPERATOR_SUFFIX
	const arrayFormat = options.arrayFormat ?? "repeat"
	const preserveUnrelated = options.preserveUnrelated ?? true
	const includeOperators = options.includeOperators ?? "changed"
	const resetPageKeys = options.resetPageKeys ?? DEFAULT_RESET_PAGE_KEYS

	const next = preserveUnrelated ? normalise(currentQuery) : {}
	const byKey = new Map(filterConfigs.map((config) => [config.key, config]))

	/* Cleared, then rewritten, so a removed filter leaves the URL. */
	for (const config of filterConfigs) {
		delete next[config.key]
		delete next[`${config.key}${suffix}`]
	}
	for (const key of resetPageKeys) delete next[key]

	for (const active of activeFilters) {
		const config = byKey.get(active.key)
		if (!config) continue

		const values = active.value.map((value) => value.trim()).filter((value) => value.length > 0)
		if (values.length === 0) continue

		next[active.key] = arrayFormat === "comma" ? [values.join(",")] : values

		const isDefault = active.operator === defaultOperatorFor(config)
		const write =
			includeOperators === "always" ||
			(includeOperators === "changed" && !isDefault)
		if (write) next[`${active.key}${suffix}`] = [active.operator]
	}

	return toRecord(next)
}

/** Lays one query over another, dropping the page keys. */
export function mergeFilterQuery(
	currentQuery: FilterQueryInput,
	nextFilterQuery: FilterQueryInput,
	options: Pick<FilterQueryOptions, "preserveUnrelated" | "resetPageKeys"> = {},
): FilterQueryRecord {
	const preserveUnrelated = options.preserveUnrelated ?? true
	const resetPageKeys = options.resetPageKeys ?? DEFAULT_RESET_PAGE_KEYS

	const current = preserveUnrelated ? normalise(currentQuery) : {}
	const next = normalise(nextFilterQuery)

	for (const key of resetPageKeys) delete current[key]

	for (const [key, values] of Object.entries(next)) {
		if (values.length === 0) delete current[key]
		else current[key] = values
	}

	return toRecord(current)
}
