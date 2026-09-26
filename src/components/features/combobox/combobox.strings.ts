export interface AsyncComboboxStrings {
	placeholder: string
	/** Accessible name for the single-select field's clear control. */
	clear: string
	/** Accessible name for the single-select field's chevron. */
	toggle: string
	searching: string
	noResults: string
	/** Takes the threshold. The default omits the count at a threshold of one. */
	formatTypeToSearch: (minimum: number) => string
	/** Takes how many characters are still missing. Plurals are the language's business. */
	formatTypeMore: (remaining: number) => string
	/** Takes the typed text, so "Create “blue”" can become whatever the language needs. */
	formatCreate: (value: string) => string
	loadingMore: string
	apply: string
	cancel: string
	/** Announced when a fetch fails, above the retry control. */
	errorTitle: string
	retry: string
	/** Accessible name for a multi-select chip's remove control. Takes the chip's label. Optional for compatibility; the default supplies it. */
	removeChip?: (label: string) => string
}

export const defaultAsyncComboboxStrings: AsyncComboboxStrings = {
	placeholder: "Search…",
	clear: "Clear selection",
	toggle: "Show options",
	searching: "Searching…",
	noResults: "No results found.",
	formatTypeToSearch: (minimum) =>
		minimum <= 1 ? "Type to search…" : `Type at least ${minimum} characters to search…`,
	formatTypeMore: (remaining) =>
		`Type ${remaining} more character${remaining === 1 ? "" : "s"} to search…`,
	formatCreate: (value) => `Create “${value}”`,
	loadingMore: "Loading…",
	apply: "Apply",
	cancel: "Cancel",
	errorTitle: "Could not load results",
	retry: "Retry",
	removeChip: (label) => `Remove ${label}`,
}

/** The copy `SuggestionsCombobox` speaks, mapped onto `AsyncComboboxStrings` inside it. */
export interface SuggestionsStrings {
	placeholder: string
	emptyMessage: string
	loadingMessage: string
	/** Shown before anything has been typed. */
	startTypingMessage: string
	/**
	 * Shown when something but not enough has been typed (`minQueryLength` above one). Takes
	 * the characters still missing. Optional; when absent a supplied `startTypingMessage` is used.
	 */
	formatTypeMore?: (remaining: number) => string
	errorMessage: string
	retry: string
}

export const defaultSuggestionsStrings: SuggestionsStrings = {
	placeholder: "Search…",
	emptyMessage: "No results found.",
	loadingMessage: "Searching…",
	startTypingMessage: "Type to search.",
	formatTypeMore: defaultAsyncComboboxStrings.formatTypeMore,
	errorMessage: "Could not load suggestions.",
	retry: "Retry",
}
