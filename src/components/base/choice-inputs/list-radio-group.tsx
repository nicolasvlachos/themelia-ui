/**
 * ListRadioGroup — single-select as a divided vertical list, for options with a
 * descriptive second line (plan tiers, roles). Shares `RadioOptionGroup` with
 * CardRadioGroup; PillRadioGroup is the compact inline form.
 */
import { forwardRef } from "react"

import type { ChoiceGroupBaseProps, ChoiceOption } from "./choice.types"
import { RadioOptionGroup } from "./partials/radio-option-group"

export type ListRadioOption = ChoiceOption

export interface ListRadioGroupProps extends ChoiceGroupBaseProps {
	/**
	 * The choices, in the one shape card, list and pill groups share: value, label,
	 * description, icon, and an optional tooltip.
	 */
	options: ListRadioOption[]
	/** Controlled value. */
	value?: string
	/** The initial value, for uncontrolled selection. */
	defaultValue?: string
	/** Called with the chosen value. */
	onValueChange?: (value: string) => void
}

/**
 * Single-select as a divided vertical list, for options with a descriptive second line —
 * plan tiers, roles. The same component as `CardRadioGroup`, laid out another way.
 */
export const ListRadioGroup = forwardRef<HTMLDivElement, ListRadioGroupProps>(function ListRadioGroup(props, ref) {
	return <RadioOptionGroup ref={ref} {...props} layout="list" hook="list-radio-group" />
})
