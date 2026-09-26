export interface BooleanIndicatorStrings {
	/** What each state is called. Yes/No, Enabled/Disabled, Paid/Unpaid — the pair is
	 *  domain copy, not a fixed vocabulary. */
	true: string
	false: string
}

export const defaultBooleanIndicatorStrings: BooleanIndicatorStrings = {
	true: "Yes",
	false: "No",
}
