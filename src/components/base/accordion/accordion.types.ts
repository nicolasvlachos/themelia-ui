import type { ReactNode } from "react"

/**
 * Outer chrome for the group: `bordered` — one shell with quiet dividers (the settings
 * default); `card` — a panel per section; `flat` — none, the consumer supplies it.
 */
export type AccordionSurface = "bordered" | "card" | "flat"

/**
 * How leading media is framed. With no media in any row the column is dropped; a mixed
 * group reserves it on every row so titles align.
 */
export type AccordionMedia = "inline" | "medallion" | "none"

/** One section for the bounded `items` API; use the compound parts for richer rows. */
export interface AccordionItemData {
	/** Stable identifier. Used as the item's `value`. */
	value: string
	title: ReactNode
	/** Supporting line below the title, inside the trigger. */
	description?: ReactNode
	/** Leading media. Framed per the root's `media` prop. */
	icon?: ReactNode
	/** Trailing node after the title — usually a `<Badge>`. */
	badge?: ReactNode
	content: ReactNode
	disabled?: boolean
}

declare module "@/lib/ui-provider" {
	interface ComponentDefaults {
		accordion: {
			surface: AccordionSurface
			media: AccordionMedia
		}
	}
}
