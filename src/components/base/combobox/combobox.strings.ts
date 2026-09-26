export interface ComboboxStrings {
	/** Accessible name for the field's clear control. */
	clear: string
	/** Accessible name for the control that opens the list. */
	toggle: string
	/** Accessible name for a chip's remove control, from the chip's text so it says what it removes. */
	removeChip: (label: string) => string
}

export const defaultComboboxStrings: ComboboxStrings = {
	clear: "Clear selection",
	toggle: "Show options",
	removeChip: (label) => `Remove ${label}`,
}
