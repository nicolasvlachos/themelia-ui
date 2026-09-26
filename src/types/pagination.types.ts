/**
 * A paginator as an API returns one. Snake_case on purpose: it is the shape Laravel's
 * paginator serialises to, so consumers need not map it.
 */
export interface PaginationMeta {
	current_page: number
	last_page: number
	per_page: number
	total: number
	path: string
	prev_page_url: string | null
	next_page_url: string | null
}

/**
 * Paginator copy as data, from a server or translation catalogue; every key optional.
 * Distinct from the component's `PaginationStrings`, which carries defaults.
 */
export interface PaginationLabels {
	previous?: string
	next?: string
	morePages?: string
	of?: string
	entries?: string
	page?: string
	rowsPerPage?: string
	label?: string
}
