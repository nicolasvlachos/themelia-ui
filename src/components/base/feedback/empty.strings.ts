export interface EmptyStrings {
	/** Fallback headline for a bare `<Empty />`; screens should pass their own ("No invoices yet"). */
	title: string
	description: string
	/** The region's accessible name; `Empty` is a `role="status"`, so a list emptying out is announced. */
	ariaLabel: string
}

export const defaultEmptyStrings: EmptyStrings = {
	title: "Nothing here yet",
	description: "Once data lands, it will show up in this view.",
	ariaLabel: "Empty state",
}
