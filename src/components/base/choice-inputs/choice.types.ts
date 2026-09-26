import type { ComponentType, ReactNode } from "react"

/** One option shape shared by every choice group — card, list and pill — so they can't drift. */
export interface ChoiceOption<TValue extends string = string> {
	value: TValue
	label: ReactNode
	/** Supporting sentence. Card and list groups show it; a pill has no room for one. */
	description?: ReactNode
	/** Leading glyph. A Lucide icon, any component taking a className, or a rendered node. */
	icon?: ComponentType<{ className?: string }> | ReactNode
	/**
	 * Detail that doesn't fit the row, shown in a tooltip from an info glyph beside the label.
	 * The glyph isn't focusable; the text also becomes the option's accessible description.
	 */
	tooltip?: ReactNode
	disabled?: boolean
}

export interface ChoiceGroupBaseProps {
	/** Field name, used for the group's native form participation. */
	name?: string
	/** Disables every option. */
	disabled?: boolean
	/** Applies the invalid treatment. Pair it with a message on the FormField. */
	invalid?: boolean
	className?: string
	/**
	 * The group's name and description. `FormField` supplies `aria-labelledby` and
	 * `aria-describedby`.
	 */
	"aria-label"?: string
	"aria-labelledby"?: string
	"aria-describedby"?: string
}

/**
 * Column cap for card groups. There is no `size` prop: geometry follows `--density-scale`
 * (styles/FACTORS.md).
 */
export type ChoiceColumns = 1 | 2 | 3 | 4
