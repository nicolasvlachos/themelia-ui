export interface PopoverMenuStrings {
	/** Announced while the items are being fetched. */
	loading: string
	/** Placeholder in the filter field. */
	searchPlaceholder: string
	/** Shown when the filter matches nothing. */
	empty: string
	/* Optional in the type only, so older complete translations still compile; defaults fill in. */
	/** Shown in place of the rows when `error` is `true`. */
	error?: string
	/** The control beside the error, when `onRetry` is wired. */
	retry?: string
	/** Shown in place of the rows while the search is shorter than `minSearchLength`. */
	formatTypeToSearch?: (minimum: number) => string
}

export const defaultPopoverMenuStrings: PopoverMenuStrings = {
	loading: "Loading…",
	searchPlaceholder: "Search",
	empty: "No results.",
	error: "Could not load results.",
	retry: "Try again",
	formatTypeToSearch: (minimum) =>
		`Type at least ${minimum} character${minimum === 1 ? "" : "s"} to search…`,
}
