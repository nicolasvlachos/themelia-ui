import type { ReactNode } from "react"

/** One choice in a `PopoverMenu` or `PopoverMenuPanel`. */
export interface PopoverMenuItem<T = unknown> {
	/** Unique identifier. Also the match value when no `searchValue` is given. */
	value: string
	/** What the row reads as. */
	label: ReactNode
	/** Secondary line under the label. */
	description?: ReactNode
	/** Leading glyph. Takes the accent colour while the row is selected. */
	icon?: ReactNode
	/** Marks the row as chosen. The menu shows it; the caller decides it. */
	selected?: boolean
	/** Shows the row but refuses it. */
	disabled?: boolean
	/** Match string, for when `label` is a node rather than plain text. */
	searchValue?: string
	/** Arbitrary payload handed back to `onSelect`. */
	data?: T
}
