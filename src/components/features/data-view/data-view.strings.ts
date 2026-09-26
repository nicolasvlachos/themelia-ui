export interface DataViewStrings {
	filterError: string
}

export const defaultDataViewStrings: DataViewStrings = {
	filterError: "Filters could not be applied. Showing all records.",
}

export interface DataViewPaginationStrings {
	label: string
	previous: string
	next: string
	page: (page: number) => string
}

export const defaultDataViewPaginationStrings: DataViewPaginationStrings = {
	label: "Pagination",
	previous: "Previous page",
	next: "Next page",
	page: (page) => `Page ${page}`,
}

/** Names the saved-view select when it stands in for the tab row. */
export const defaultDataViewFilterTabsLabel = "Saved views"
