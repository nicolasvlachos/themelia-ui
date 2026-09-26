export interface TableStrings {
	/**
	 * Names the scroll container while the table overflows it. Unset, it takes the table's
	 * `aria-label` or caption; with none, it is a focusable scroller with no role.
	 */
	scrollRegion?: string
	/** `TableEmpty`'s message when it is given no children. */
	empty?: string
}

/* No `scrollRegion` default: a generic name would be worse than the table's caption. */
export const defaultTableStrings: TableStrings = {
	empty: "No results.",
}
