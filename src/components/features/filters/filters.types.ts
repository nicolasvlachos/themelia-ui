/**
 * Filters — the shapes a filter bar is described with.
 *
 * Every value is `string[]`, whatever the type, so a filter set round-trips through the URL
 * with one serialiser; parsing to dates or numbers happens where needed. `operator` is the
 * current comparison, `operators` the choices; with only one, no operator segment is drawn.
 */
import type { ReactNode } from "react"

import type { FilterStrings } from "./filters.strings"

export const FilterType = {
	SELECT: "select",
	MULTI_SELECT: "multi_select",
	ASYNC_SELECT: "async_select",
	SEARCH: "search",
	RANGE: "range",
	DATE: "date",
	TAGS: "tags",
} as const

export type FilterType = (typeof FilterType)[keyof typeof FilterType]

/** Named rather than a bare union, so a consumer writes `FilterOperator.IN` not `"in"`. */
export const FilterOperator = {
	EQUALS: "equals",
	CONTAINS: "contains",
	IN: "in",
	NOT_IN: "not_in",
	NOT: "not",
	BEFORE: "before",
	AFTER: "after",
	BETWEEN: "between",
	GT: "gt",
	LT: "lt",
	GTE: "gte",
	LTE: "lte",
	HAS: "has",
	HAS_ANY: "has_any",
	HAS_ALL: "has_all",
} as const

export type FilterOperator = (typeof FilterOperator)[keyof typeof FilterOperator]

export interface OperatorOption {
	label: string
	value: FilterOperator
}

/**
 * Where a filter lives in the bar: `always` shows its pill even without a value; `collapsed`
 * hides it behind the add button until it has one; `hidden` applies without any UI.
 */
export type FilterDisplay = "always" | "collapsed" | "hidden"

/** Where the editor was opened from, which decides whether there is a way back. */
export type FilterTriggerSource = "toolbar" | "chip"

export interface FilterOption {
	label: string
	value: string
	icon?: ReactNode
	description?: string
	disabled?: boolean
}

export interface DisplayConfig {
	display?: FilterDisplay
	/** Lower sorts earlier in the bar. */
	priority?: number
	hidden?: boolean
	className?: string
}

export interface ValidationConfig {
	min?: number
	max?: number
	pattern?: RegExp
	required?: boolean
	/** `true` passes; a string is the message; `false` is a generic failure. */
	custom?: (value: unknown) => boolean | string
}

/** This filter only applies once another one has a value. */
export interface FilterDependency {
	key: string
	operator: FilterOperator
	value: string | string[]
}

export interface FilterErrorContext {
	phase: "fetch-options" | "apply" | "validate" | "render"
	filterKey?: string
	/** React's component stack, when the error came from a render. */
	info?: string
}

export type FilterErrorHandler = (error: unknown, context: FilterErrorContext) => void

/** Async options for an `async_select`: one config owning search, caching, abort and preload. */
export interface AsyncSelectConfig<TItem = unknown> {
	fetcher: (args: { query: string; limit: number; signal?: AbortSignal }) => Promise<TItem[]>
	/** Turns a fetched item into something the list can draw. */
	mapToOption: { bivarianceHack(item: TItem): FilterOption }["bivarianceHack"]
	limit?: number
	/** Below this many characters nothing is fetched. */
	minQueryLength?: number
	/** Fetch with an empty query as soon as the list opens. */
	preload?: boolean
	debounceMs?: number
	/** How long a cached result stays fresh. */
	staleTime?: number
}

/** Infers the item type once across `fetcher` and `mapToOption`, which a heterogeneous `FilterConfig[]` would widen to `unknown`. */
export function defineAsyncSelectConfig<TItem>(
	config: AsyncSelectConfig<TItem>,
): AsyncSelectConfig<TItem> {
	return config
}

export interface FilterConfig {
	key: string
	label: string
	/** Used in "3 statuses selected". Falls back to `label`. */
	pluralLabel?: string
	type: FilterType
	description?: string
	operator?: FilterOperator
	operators?: OperatorOption[]
	options?: FilterOption[]
	placeholder?: string
	/** Debounce for a `search` filter, in ms. */
	delay?: number
	icon?: ReactNode
	displayConfig?: DisplayConfig
	defaultValue?: string[]
	validation?: ValidationConfig
	dependencies?: FilterDependency[]
	multiple?: boolean
	/** Closes the editor as soon as one option is picked. Single-select only. */
	closeOnSelect?: boolean
	maxSelected?: number
	asyncConfig?: AsyncSelectConfig
	dateFormat?: {
		/** date-fns pattern for the pill. */
		display?: string
		/** date-fns pattern for the stored value — what the server sees. */
		param?: string
	}
	/** Replaces the default rendering of the value in the pill. */
	format?: (value: string[]) => string
}

/** One filter, applied. */
export interface ActiveFilter {
	id: string
	key: string
	operator: FilterOperator
	value: string[]
}

export interface FilterState {
	[key: string]: string[]
}

export interface FilterTabPreset {
	key: string
	value: string[]
	operator?: FilterOperator
}

/** A saved set of filters, offered as a tab above the bar. */
export interface FilterTab {
	id: string
	label: string
	presets: FilterTabPreset[]
	count?: number
}

export interface FilterContextValue {
	activeFilters: ActiveFilter[]
	filters: FilterConfig[]
	addFilter: (filter: ActiveFilter) => void
	removeFilter: (key: string) => void
	updateFilter: (key: string, updates: Partial<ActiveFilter>) => void
	clearFilters: () => void
	replaceFilters: (filters: ActiveFilter[]) => void
	getFilterByKey: (key: string) => FilterConfig | undefined
	getFilterValue: (key: string) => string[]
	setFilterValue: (key: string, value: string[]) => void
	isFilterActive: (key: string) => boolean
	getFilterOperator: (key: string) => FilterOperator
	setFilterOperator: (key: string, operator: FilterOperator) => void
	validateFilter: (key: string, value: unknown) => boolean | string
	getDependentFilters: (key: string) => FilterConfig[]
	/** A change is in flight — the bar dims rather than pretending it has applied. */
	isNavigating: boolean
	strings: FilterStrings
	/** Remembers labels an async filter resolved, so a pill can name its own value. */
	cacheAsyncOptions: (filterKey: string, options: FilterOption[]) => void
	getAsyncOptionLabel: (filterKey: string, value: string) => string | undefined
	reportError: FilterErrorHandler
}
