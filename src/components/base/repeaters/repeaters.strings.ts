export interface RepeaterStrings {
	/** The control that appends a row. */
	add: string
	/**
	 * Announced after a keyboard move. Optional so older complete strings objects still
	 * type-check.
	 */
	moved?: (position: number, total: number) => string
	/** Names each row's remove control, by its row. */
	remove: (index: number) => string
	/** Names the drag handle, including how to move it by keyboard. */
	reorder: (index: number) => string
	/**
	 * Shown when the list is empty; the `emptyState` prop replaces it. Optional so older
	 * complete strings objects still type-check.
	 */
	emptyState?: string
}

export const defaultRepeaterStrings: RepeaterStrings = {
	add: "Add",
	remove: (index) => `Remove item ${index}`,
	reorder: (index) => `Reorder item ${index}. Use the arrow keys to move it.`,
	moved: (position, total) => `Moved to position ${position} of ${total}.`,
	emptyState: "Nothing here yet.",
}

export interface KeyValueEditorStrings extends RepeaterStrings {
	keyPlaceholder: string
	valuePlaceholder: string
	/** Names each field by its row (the placeholder is identical on every row). */
	keyLabel: (index: number) => string
	valueLabel: (index: number) => string
}

export const defaultKeyValueEditorStrings: KeyValueEditorStrings = {
	...defaultRepeaterStrings,
	add: "Add pair",
	keyPlaceholder: "Key",
	valuePlaceholder: "Value",
	keyLabel: (index) => `Key ${index}`,
	valueLabel: (index) => `Value ${index}`,
}

export interface ObjectRepeaterStrings extends RepeaterStrings {
	/** Shown when the list is empty. */
	emptyState: string
}

export const defaultObjectRepeaterStrings: ObjectRepeaterStrings = {
	...defaultRepeaterStrings,
	add: "Add row",
	emptyState: "Nothing here yet.",
}
