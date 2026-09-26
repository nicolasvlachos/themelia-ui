export interface ToasterStrings {
	/** Names the live region the toasts are announced from. */
	label: string
	/** Names each toast's dismiss control, which is icon-only. */
	dismiss: string
}

export const defaultToasterStrings: ToasterStrings = {
	label: "Notifications",
	dismiss: "Dismiss notification",
}
