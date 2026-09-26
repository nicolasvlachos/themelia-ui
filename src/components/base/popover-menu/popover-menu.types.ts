import type { ReactNode } from "react"

export interface PopoverMenuItem<T = unknown> {
	/** Unique identifier. Also the match value when no `searchValue` is given. */
	value: string
	label: ReactNode
	/** Secondary line under the label. */
	description?: ReactNode
	/** Leading glyph. Takes the accent colour while the row is selected. */
	icon?: ReactNode
	selected?: boolean
	disabled?: boolean
	/** Match string, for when `label` is a node rather than plain text. */
	searchValue?: string
	/** Arbitrary payload handed back to `onSelect`. */
	data?: T
}
