/**
 * CardRadioGroup — single-select as a grid of cards (title, optional description, icon
 * and tooltip), on Base UI's radio group. Shares `RadioOptionGroup` with ListRadioGroup;
 * pairs with CardCheckboxGroup for multi-select.
 */
import { forwardRef } from "react"

import type { ChoiceColumns, ChoiceGroupBaseProps, ChoiceOption } from "./choice.types"
import { RadioOptionGroup } from "./partials/radio-option-group"

export type CardRadioOption = ChoiceOption

export interface CardRadioGroupProps extends ChoiceGroupBaseProps {
	/**
	 * The choices, in the one shape card, list and pill groups share: value, label,
	 * description, icon, and an optional tooltip.
	 */
	options: CardRadioOption[]
	/** Controlled value. */
	value?: string
	/** The initial value, for uncontrolled selection. */
	defaultValue?: string
	/** Called with the chosen value. */
	onValueChange?: (value: string) => void
	/**
	 * Column count at full width: the track floor, not a fixed count — the grid still steps
	 * down on its own container's width. Pick it from how much each card has to say.
	 * @default 3
	 */
	columns?: ChoiceColumns
}

/**
 * Single-select as a grid of cards: a title, an optional description, an icon and a
 * tooltip. `CardCheckboxGroup` is its multi-select twin.
 */
export const CardRadioGroup = forwardRef<HTMLDivElement, CardRadioGroupProps>(function CardRadioGroup(props, ref) {
	return <RadioOptionGroup ref={ref} {...props} layout="cards" hook="card-radio-group" />
})
