/**
 * The copy of a `PopoverMenu` or `PopoverMenuPanel`. `error`, `retry` and
 * `formatTypeToSearch` are optional in the type, so a translation written before them still
 * compiles; the defaults fill them.
 */
export interface PopoverMenuStrings {
	/** Announced while the items are being fetched. */
	loading: string
	/** Placeholder in the filter field. */
	searchPlaceholder: string
	/** Shown when the filter matches nothing. */
	empty: string
	/** Shown in place of the rows when `error` is `true`. */
	error?: string
	/** Labels the retry control under the error, when `onRetry` is wired. */
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
