export interface PaginationStrings {
	/** Names the navigation region. A page with two pagers needs two names. */
	label: string
	/** The two arrows' names, and their visible words unless `labels="icon"`. */
	previous: string
	next: string
	/** Announced for the gap in a truncated page range. */
	morePages: string
	/** Names each page control, by the page it goes to. */
	page: (page: number) => string
}

export const defaultPaginationStrings: PaginationStrings = {
	label: "Pagination",
	previous: "Previous",
	next: "Next",
	morePages: "More pages",
	page: (page) => `Page ${page}`,
}

export interface BreadcrumbsStrings {
	/** Names the trail. */
	label: string
}

export const defaultBreadcrumbsStrings: BreadcrumbsStrings = {
	label: "Breadcrumb",
}

export interface LanguageSwitcherStrings {
	/** Names the control. */
	label: string
}

export const defaultLanguageSwitcherStrings: LanguageSwitcherStrings = {
	label: "Language",
}

export interface TabListStrings {
	previous: string
	next: string
}

export const defaultTabListStrings: TabListStrings = {
	previous: "Scroll tabs backward",
	next: "Scroll tabs forward",
}
