export interface InputStrings {
	/** Accessible name for the inline clear action. */
	clear: string
	/** Accessible description of the character counter, e.g. "12 of 80 characters". */
	characterCount: (used: number, limit: number) => string
}

export const defaultInputStrings: InputStrings = {
	clear: "Clear input",
	characterCount: (used, limit) => `${used} of ${limit} characters`,
}

/** SearchInput's copy: Input's, with the clear control named for a search. */
export const defaultSearchInputStrings: InputStrings = {
	...defaultInputStrings,
	clear: "Clear search",
}
