export interface GlobalSearchStrings {
	/** The Escape key's cap. A word, and not the same word everywhere. */
	escKey: string
	/** Names the palette for assistive technology; never drawn. */
	dialogTitle: string
	placeholder: string
	clear: string
	loading: string
	emptyTitle: (query: string) => string
	emptyHint: string
	tabAll: string
	footerNavigate: string
	footerOpen: string
	footerClose: string
	resultsCount: (count: number) => string
	/** The per-group action that jumps to that group's tab. */
	seeAll: string
}

export const defaultGlobalSearchStrings: GlobalSearchStrings = {
	escKey: "esc",
	dialogTitle: "Search",
	placeholder: "Search…",
	clear: "Clear search",
	loading: "Searching…",
	emptyTitle: (query) => `No results for “${query}”`,
	emptyHint: "Try a shorter keyword or check the spelling.",
	tabAll: "All",
	footerNavigate: "navigate",
	footerOpen: "open",
	footerClose: "close",
	resultsCount: (count) => `${count} ${count === 1 ? "result" : "results"}`,
	seeAll: "See all",
}
