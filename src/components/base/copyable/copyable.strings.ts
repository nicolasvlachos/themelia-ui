export interface CopyableStrings {
	/** Accessible name for the control before it has been used. */
	copy: string
	/** Accessible name while the copied state is showing. The name IS the state here. */
	copied: string
	/** Toast raised on success. The component's `silent` prop suppresses toasts. */
	success: string
	/** Toast raised when the clipboard write is refused — no permission, no secure context. */
	error: string
}

export const defaultCopyableStrings: CopyableStrings = {
	copy: "Copy value",
	copied: "Copied",
	success: "Copied to clipboard",
	error: "Could not copy to clipboard",
}
