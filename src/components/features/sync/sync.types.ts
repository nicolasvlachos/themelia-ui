/**
 * SyncRangeForm: the "reconcile the last N hours" dialog body. Values stay strings (what
 * the DOM returns); conversion happens at the boundary, so `transformSubmit` can map
 * windows like `"since-last-run"` or `"P7D"` that are not numbers.
 */
import type { CardCheckboxOption, CardRadioOption } from "@/components/base/choice-inputs"

import type { SyncRangeFormStrings } from "./sync.strings"

export interface SyncRangeFormValues {
	/** The chosen window's id. Numeric strings work with the default transform. */
	hours: string
	/** Every ticked option, in the order the group reports them. */
	options: string[]
}

export interface SyncRangeFormSubmit {
	hours: number
	options: string[]
}

export interface SyncRangeFormProps<TSubmit = SyncRangeFormSubmit> {
	/** Set on the `<form>` so the overlay's footer, outside it, can submit it. */
	formId: string
	/** The windows offered. */
	options: CardRadioOption[]
	syncOptions?: CardCheckboxOption[]
	/** Controlled. */
	value?: SyncRangeFormValues
	defaultValue?: Partial<SyncRangeFormValues>
	onValueChange?: (value: SyncRangeFormValues) => void
	/** Maps the form's values to the consumer's payload. Replaces the numeric default. */
	transformSubmit?: (value: SyncRangeFormValues) => TSubmit
	onSubmit: (data: TSubmit, values: SyncRangeFormValues) => void | Promise<void>
	onError?: (error: unknown) => void
	/** Changing it resets an uncontrolled form, e.g. after a mutation or for a new record. */
	resetKey?: string | number
	disabled?: boolean
	submitting?: boolean
	/** Server-side messages by field. An array is reduced to its first entry. */
	errors?: Record<string, string | string[] | undefined>
	strings?: Partial<SyncRangeFormStrings>
	className?: string
}
