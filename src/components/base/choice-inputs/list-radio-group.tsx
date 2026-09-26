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
	options: ListRadioOption[]
	/** Controlled value. */
	value?: string
	defaultValue?: string
	onValueChange?: (value: string) => void
}

export const ListRadioGroup = forwardRef<HTMLDivElement, ListRadioGroupProps>(function ListRadioGroup(props, ref) {
	return <RadioOptionGroup ref={ref} {...props} layout="list" hook="list-radio-group" />
})
