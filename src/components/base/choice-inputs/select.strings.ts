export interface SelectStrings {
	/** Shown in the trigger while nothing is chosen. */
	placeholder: string
	/** Names the control that empties the selection, when `allowClear` is set. */
	clear: string
}

export const defaultSelectStrings: SelectStrings = {
	placeholder: "Select an option",
	clear: "Clear selection",
}
