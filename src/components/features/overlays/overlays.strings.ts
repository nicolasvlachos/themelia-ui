export interface OverlayActionStrings {
	confirm: string
	cancel: string
}

export const defaultOverlayActionStrings: OverlayActionStrings = {
	confirm: "Confirm",
	cancel: "Cancel",
}

/** A confirmation says "Continue", not "Confirm": the button answers the question in the title. */
export const defaultConfirmStrings: OverlayActionStrings = {
	confirm: "Continue",
	cancel: "Cancel",
}
