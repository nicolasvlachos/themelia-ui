/** Filter copy. Interpolated strings are functions, not templates, so translations can reorder parts. */
export interface FilterOperatorStrings {
	contains: string
	equals: string
	notContains: string
	is: string
	isNot: string
	greaterThan: string
	lessThan: string
	before: string
	after: string
	between: string
	has: string
	hasAny: string
	hasAll: string
}

export interface FilterStrings {
	loading: string
	loadingOptions: (filterLabel: string) => string
	applying: string
	savedViews: string
	customView: string
	/** Mobile filter sheet copy. Optional for existing complete translations. */
	mobileFilters?: string
	filterSummary?: (count: number) => string
	done?: string
	clearFilter?: (filterLabel: string) => string

	addFilter: string
	clear: string
	/** Names the pill's value segment, which opens the editor. */
	edit: string
	confirm: string
	clearFilters: string

	selectDate: string

	searchPlaceholder: (filterLabel: string) => string
	noOptionsFound: string
	selected: (count: number, filterLabel: string) => string
	/** The pill's value segment before anything has been picked. */
	nothingSelected: string

	enterTags: string

	searchFilters: string
	noFiltersAvailable: string
	availableFilters: string
	activeFilters: string
	backToFilters: string
	options: (count: number) => string

	operator: string
	operators: FilterOperatorStrings

	min: string
	max: string

	fetchError: string
	retryFetch: string
	minQueryHint: (min: number) => string
	searching: string

	error: {
		title: string
		describe: (filterKey?: string) => string
		retry: string
	}

	validation: {
		required: string
		minValue: (min: number) => string
		maxValue: (max: number) => string
		invalidFormat: string
	}
}

export const defaultFilterStrings: FilterStrings = {
	loading: "Loading",
	loadingOptions: (filterLabel) => `Loading ${filterLabel} options…`,
	applying: "Updating results…",
	savedViews: "Saved views",
	customView: "Custom view",
	mobileFilters: "Filters",
	filterSummary: (count) => count === 0 ? "No filters applied" : `${count} ${count === 1 ? "filter" : "filters"} applied`,
	done: "Done",
	clearFilter: (filterLabel) => `Clear: ${filterLabel}`,

	addFilter: "Add filter",
	clear: "Clear",
	edit: "Edit",
	confirm: "Apply",
	clearFilters: "Clear filters",

	selectDate: "Select a date",

	searchPlaceholder: (filterLabel) => `Search ${filterLabel}…`,
	noOptionsFound: "No options found.",
	selected: (count, filterLabel) => `${count} ${filterLabel} selected`,
	nothingSelected: "Any",

	enterTags: "Add a tag and press Enter",

	searchFilters: "Search filters…",
	noFiltersAvailable: "No filters available.",
	availableFilters: "Add a filter",
	activeFilters: "Applied",
	backToFilters: "Back to filters",
	options: (count) => `${count} ${count === 1 ? "option" : "options"}`,

	operator: "Comparison",
	operators: {
		contains: "contains",
		equals: "is",
		notContains: "does not contain",
		is: "is",
		isNot: "is not",
		greaterThan: "greater than",
		lessThan: "less than",
		before: "before",
		after: "after",
		between: "between",
		has: "has",
		hasAny: "has any of",
		hasAll: "has all of",
	},

	min: "Min",
	max: "Max",

	fetchError: "Could not load options.",
	retryFetch: "Try again",
	minQueryHint: (min) => `Type at least ${min} character${min === 1 ? "" : "s"}…`,
	searching: "Searching…",

	error: {
		title: "This filter could not be shown",
		describe: (filterKey) =>
			filterKey
				? `Something went wrong in the “${filterKey}” filter.`
				: "Something went wrong in this filter.",
		retry: "Try again",
	},

	validation: {
		required: "This filter needs a value.",
		minValue: (min) => `Must be at least ${min}.`,
		maxValue: (max) => `Must be at most ${max}.`,
		invalidFormat: "That is not a valid value.",
	},
}
