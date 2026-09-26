/**
 * A form-library-agnostic field binding. Components bind to `FormControl`, which RHF (an
 * optional peer), Formik or plain state can satisfy. The shape is the kit's own field
 * contract, so a binding spreads straight onto a control:
 *
 *   const field = useFormFieldBinding<string>({ name: "email", control })
 *   <TextInput {...field} />
 */
import { useCallback, useMemo, useState } from "react"

/** What a bound field hands to a control. */
export interface FieldBinding<TValue> {
	name: string
	value: TValue
	onValueChange: (value: TValue) => void
	onBlur: () => void
	/** Present so a control can render its invalid state without a separate lookup. */
	invalid: boolean
	error?: string
	disabled?: boolean
}

/** One field's state, as an adapter reports it. */
export interface FieldState<TValue> {
	value: TValue
	setValue: (value: TValue) => void
	onBlur?: () => void
	error?: string
	disabled?: boolean
}

/**
 * The adapter contract. `useField` is a hook, called once per bound field during render,
 * so an RHF adapter can delegate to `useController`.
 */
export interface FormControl<TValues = Record<string, unknown>> {
	useField: <TValue>(name: Extract<keyof TValues, string> | string) => FieldState<TValue>
}

/** Binds one field. The only API a component needs to be form-library agnostic. */
export function useFormFieldBinding<TValue, TValues = Record<string, unknown>>({
	name,
	control,
	disabled,
}: {
	name: Extract<keyof TValues, string> | string
	control: FormControl<TValues>
	disabled?: boolean
}): FieldBinding<TValue> {
	const state = control.useField<TValue>(name)
	return {
		name,
		value: state.value,
		onValueChange: state.setValue,
		onBlur: state.onBlur ?? noop,
		invalid: Boolean(state.error),
		error: state.error,
		disabled: disabled ?? state.disabled,
	}
}

function noop() {}

/** A `FormControl` over plain React state — the zero-dependency default. */
export function useStateFormControl<TValues extends Record<string, unknown>>(
	initialValues: TValues,
	options: { errors?: Partial<Record<keyof TValues, string>> } = {},
): FormControl<TValues> & { values: TValues; reset: (next?: TValues) => void } {
	const [values, setValues] = useState<TValues>(initialValues)
	const { errors } = options

	const reset = useCallback((next?: TValues) => setValues(next ?? initialValues), [initialValues])

	return useMemo(
		() => ({
			values,
			reset,
			useField<TValue>(name: string): FieldState<TValue> {
				return {
					value: values[name] as TValue,
					setValue: (value: TValue) => setValues((prev) => ({ ...prev, [name]: value })),
					error: errors?.[name as keyof TValues],
				}
			},
		}),
		[values, errors, reset],
	)
}
