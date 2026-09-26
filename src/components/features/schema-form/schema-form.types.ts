/**
 * SchemaForm: a form described as data. Fields are a discriminated union on `type`, so
 * type-specific keys (`options`, `rows`, `decimalPlaces`) are only writable where they
 * apply. `SchemaFormValue` is deliberately wide; consumers narrow it when reading values out.
 */
import type { FormEvent, ReactNode } from "react"

import type {
	CardCheckboxGroupProps, CardRadioGroupProps, SelectProps, SwitchCardProps, ToggleFieldProps,
} from "@/components/base/choice-inputs"
import type { DecimalInputProps } from "@/components/base/forms-numeric"
import type { InputProps, TextareaProps } from "@/components/base/text-inputs"
import type { TagsInputProps } from "@/components/base/value-inputs"

import type { SchemaFormStrings } from "./schema-form.strings"

export type SchemaFormPrimitiveValue = string | number | boolean | null
export type SchemaFormStructuredValue =
	| SchemaFormPrimitiveValue
	| SchemaFormPrimitiveValue[]
	| Record<string, unknown>
	| unknown[]
export type SchemaFormValue = SchemaFormStructuredValue | undefined
export type SchemaFormValues = Record<string, SchemaFormValue>
export type SchemaFormErrors = Record<string, string | undefined>

/** `form` is one surface with sections inside it; `cards` is one surface per section. */
export type SchemaFormLayout = "form" | "cards"
export type SchemaFormFieldWidth = "auto" | "half" | "third" | "full"
export type SchemaFormColumns = 1 | 2 | 3

export type SchemaFormFieldType =
	| "text" | "email" | "password" | "url" | "tel" | "search"
	| "textarea"
	| "number" | "integer" | "decimal"
	| "select" | "radio-cards" | "checkbox-cards"
	| "tags" | "switch" | "json" | "custom"

export interface SchemaFormOption {
	value: string
	label: string
	description?: string
	icon?: ReactNode
	disabled?: boolean
}

/** Returns a message to fail, or anything else to pass. */
export type SchemaFormValidator = (
	value: SchemaFormValue,
	values: SchemaFormValues,
	field: SchemaFormField,
) => true | string | null | undefined

/** The keys every field shares, whatever its `type`. */
export interface SchemaFormFieldBase {
	key: string
	/** Picks the control. Omitted means `text`. */
	type?: SchemaFormFieldType
	label: string
	description?: string
	hint?: string
	helperText?: string
	placeholder?: string
	required?: boolean
	/**
	 * The predicate form reads the whole value set, for a field only editable once a sibling
	 * says so.
	 */
	disabled?: boolean | ((values: SchemaFormValues) => boolean)
	/**
	 * A hidden field is not rendered AND not validated — blocking a submit on a required field
	 * the reader cannot see is a dead end. The predicate form reads the whole value set, for a
	 * field that only matters once a sibling says so.
	 */
	hidden?: boolean | ((values: SchemaFormValues) => boolean)
	defaultValue?: SchemaFormValue
	/** Puts the field in a section without listing it there. */
	sectionId?: string
	/**
	 * Column span inside the section grid, which is keyed to a container. A form in a 320px
	 * drawer collapses to one column whatever the section asked for.
	 */
	width?: SchemaFormFieldWidth
	className?: string
	/** Merged onto the control rather than the field wrapper. */
	controlClassName?: string
	/**
	 * Return a string to fail. The first message wins: the rest are about a value already known
	 * to be wrong.
	 */
	validate?: SchemaFormValidator | SchemaFormValidator[]
	/**
	 * Turns the stored value into what the control displays: with `parseValue`, the two halves
	 * of a custom representation.
	 */
	formatValue?: (value: SchemaFormValue, values: SchemaFormValues) => string
	/**
	 * Turns what the control produced back into the stored value: with `formatValue`, the two
	 * halves of a custom representation.
	 */
	parseValue?: (value: string, values: SchemaFormValues) => SchemaFormValue
	/** Free-form payload, carried through to `renderField`. */
	meta?: Record<string, unknown>
}

/* Control props the field already owns are removed, so a `*Props` escape hatch cannot fight the schema. */
type Controlled<T> = Omit<
	T,
	"value" | "defaultValue" | "onChange" | "onValueChange" | "invalid" | "name"
	| "required" | "disabled" | "placeholder" | "options"
>

export interface SchemaFormTextField extends SchemaFormFieldBase {
	type?: "text" | "email" | "password" | "url" | "tel" | "search"
	inputProps?: Controlled<Omit<InputProps, "type">>
}

export interface SchemaFormTextareaField extends SchemaFormFieldBase {
	type: "textarea"
	rows?: number
	textareaProps?: Controlled<TextareaProps>
}

export interface SchemaFormNumberField extends SchemaFormFieldBase {
	type: "number" | "integer" | "decimal"
	min?: number
	max?: number
	step?: number
	decimalPlaces?: number
	numberProps?: Controlled<DecimalInputProps>
}

export interface SchemaFormSelectField extends SchemaFormFieldBase {
	type: "select"
	options: SchemaFormOption[]
	allowClear?: boolean
	selectProps?: Controlled<SelectProps>
}

export interface SchemaFormRadioCardsField extends SchemaFormFieldBase {
	type: "radio-cards"
	options: SchemaFormOption[]
	columns?: 1 | 2 | 3 | 4
	radioProps?: Controlled<CardRadioGroupProps>
}

export interface SchemaFormCheckboxCardsField extends SchemaFormFieldBase {
	type: "checkbox-cards"
	options: SchemaFormOption[]
	columns?: 1 | 2 | 3 | 4
	checkboxProps?: Controlled<CardCheckboxGroupProps>
}

export interface SchemaFormTagsField extends SchemaFormFieldBase {
	type: "tags"
	/** Offered as one-press chips under the field. */
	recommendations?: string[]
	maxTags?: number
	tagsProps?: Controlled<TagsInputProps>
}

export interface SchemaFormSwitchField extends SchemaFormFieldBase {
	type: "switch"
	/** `row` for a settings list, `card` for a choice that deserves the weight. */
	switchStyle?: "row" | "card"
	switchProps?: Controlled<Omit<ToggleFieldProps, "label" | "description">>
	switchCardProps?: Controlled<Omit<SwitchCardProps, "label" | "description" | "hint">>
}

export interface SchemaFormJsonField extends SchemaFormFieldBase {
	type: "json"
	rows?: number
	jsonIndent?: number
	textareaProps?: Controlled<TextareaProps>
}

export interface SchemaFormCustomField extends SchemaFormFieldBase {
	type: "custom"
	render: SchemaFormFieldRender
}

export type SchemaFormField =
	| SchemaFormTextField
	| SchemaFormTextareaField
	| SchemaFormNumberField
	| SchemaFormSelectField
	| SchemaFormRadioCardsField
	| SchemaFormCheckboxCardsField
	| SchemaFormTagsField
	| SchemaFormSwitchField
	| SchemaFormJsonField
	| SchemaFormCustomField

export interface SchemaFormSection {
	id: string
	title?: ReactNode
	description?: ReactNode
	icon?: ReactNode
	/** Field keys, in the order they should render. Without it, `field.sectionId` decides. */
	fields?: string[]
	columns?: SchemaFormColumns
	footerSlot?: ReactNode
	className?: string
}

export interface SchemaFormSchema {
	title?: ReactNode
	description?: ReactNode
	sections?: SchemaFormSection[]
	fields: SchemaFormField[]
}

/** What every field seam receives. */
export interface SchemaFormFieldContext {
	field: SchemaFormField
	value: SchemaFormValue
	/** All of them, for a field whose behaviour depends on a sibling. */
	values: SchemaFormValues
	error?: string
	disabled: boolean
	required: boolean
	/** The generated DOM id linking the control to its label. */
	fieldId: string
	onValueChange: (value: SchemaFormValue) => void
	onError?: (error: unknown) => void
}

export type SchemaFormFieldRender = (context: SchemaFormFieldContext) => ReactNode

export interface SchemaFormRenderFieldContext extends SchemaFormFieldContext {
	/** What would have rendered. Return it to decorate rather than replace. */
	defaultField: ReactNode
}

export interface SchemaFormRenderSectionContext {
	section: ResolvedSchemaFormSection
	/** The section's fields, already laid out. */
	fields: ReactNode
	values: SchemaFormValues
}

/** A section after hidden fields are dropped and defaults are filled in. */
export interface ResolvedSchemaFormSection {
	id: string
	title?: ReactNode
	description?: ReactNode
	icon?: ReactNode
	fields: SchemaFormField[]
	columns: SchemaFormColumns
	footerSlot?: ReactNode
	className?: string
}

export interface SchemaFormSubmitHelpers {
	setFieldValue: (key: string, value: SchemaFormValue) => void
	setValues: (values: SchemaFormValues) => void
	/** Returns the values it reset to, so a caller can report them. */
	reset: () => SchemaFormValues
	validate: () => boolean
}

export interface SchemaFormProps {
	/**
	 * Sections and fields. A section names its fields explicitly or claims the ones carrying its
	 * `sectionId`; whatever no section claimed lands in a leading default bucket.
	 */
	schema: SchemaFormSchema
	/**
	 * Controlled values. Under a controlled value the schema's own defaults still apply, so a
	 * consumer holding two fields does not blank the rest.
	 */
	value?: SchemaFormValues
	/** Uncontrolled starting values. An explicit default outranks the schema's own. */
	defaultValue?: SchemaFormValues
	/**
	 * Server-side messages, keyed by field. Merged over the form's own and not cleared by
	 * typing.
	 */
	errors?: SchemaFormErrors
	disabled?: boolean
	/**
	 * One bordered surface with sections inside it, or one surface per section. The schema does
	 * not change between them.
	 */
	layout?: SchemaFormLayout
	columns?: SchemaFormColumns
	id?: string
	name?: string
	title?: ReactNode
	description?: ReactNode
	headerSlot?: ReactNode
	footerSlot?: ReactNode
	/** Replaces the generated submit and reset pair. */
	actionsSlot?: ReactNode
	emptySlot?: ReactNode
	/** Defaults to true when there is something for the actions to do. */
	showActions?: boolean
	submitLabel?: string
	resetLabel?: string
	submitDisabled?: boolean
	resetDisabled?: boolean
	/** Additional external busy state. An async onSubmit also sets busy automatically. */
	submitting?: boolean
	onValueChange?: (values: SchemaFormValues) => void
	onFieldChange?: (key: string, value: SchemaFormValue, values: SchemaFormValues) => void
	/**
	 * Runs only if validation passed. `helpers` carries `setFieldValue`, `setValues`, `reset`,
	 * and `validate` — for a server response that has to write back into the form.
	 */
	onSubmit?: (
		values: SchemaFormValues,
		helpers: SchemaFormSubmitHelpers,
		event: FormEvent<HTMLFormElement>,
	) => void | Promise<void>
	onReset?: (values: SchemaFormValues, helpers: SchemaFormSubmitHelpers) => void
	/** Receives errors from submission and consumer predicates, validators, or parsers. */
	onError?: (error: unknown) => void
	/**
	 * Replaces how a field renders. It receives `defaultField`, so decorating is as easy as
	 * replacing.
	 */
	renderField?: (context: SchemaFormRenderFieldContext) => ReactNode
	/** Replaces how a section renders, with its fields already laid out. */
	renderSection?: (context: SchemaFormRenderSectionContext) => ReactNode
	strings?: Partial<SchemaFormStrings>
	className?: string
	contentClassName?: string
	sectionClassName?: string
	fieldClassName?: string
}
