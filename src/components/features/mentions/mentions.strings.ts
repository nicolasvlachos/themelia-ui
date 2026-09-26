export interface MentionInlineSuggestionsStrings {
	title: string
	/** Shown when the query matched nothing in any kind. */
	empty: string
	loading: string
	/** The list's accessible name. */
	listLabel: string
	/** Wraps the search term in the panel header; quotation marks are locale-specific („…“, « … »). */
	formatQuery: (query: string) => string
}

export const defaultMentionInlineSuggestionsStrings: MentionInlineSuggestionsStrings = {
	title: "Insert reference",
	formatQuery: (query) => `\u201c${query}\u201d`,
	empty: "No matches.",
	loading: "Searching…",
	listLabel: "Reference suggestions",
}

/** The picker's strings: the inline panel's plus its own search field. */
export interface MentionPickerStrings extends MentionInlineSuggestionsStrings {
	searchPlaceholder: string
}

export const defaultMentionPickerStrings: MentionPickerStrings = {
	...defaultMentionInlineSuggestionsStrings,
	searchPlaceholder: "Search…",
}
