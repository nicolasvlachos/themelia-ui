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
	options: CardRadioOption[]
	/** Controlled value. */
	value?: string
	defaultValue?: string
	onValueChange?: (value: string) => void
	/** Column count at full width. The grid steps down on narrow containers. */
	columns?: ChoiceColumns
}

export const CardRadioGroup = forwardRef<HTMLDivElement, CardRadioGroupProps>(function CardRadioGroup(props, ref) {
	return <RadioOptionGroup ref={ref} {...props} layout="cards" hook="card-radio-group" />
})
