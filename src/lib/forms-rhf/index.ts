/**
 * The react-hook-form adapter, behind its own subpath so `themelia-ui/forms` stays
 * dependency-free and react-hook-form a genuinely optional peer.
 *
 *   import { rhfFormControl } from "themelia-ui/forms-rhf"
 *
 *   const control = rhfFormControl(form.control)
 *   const email = useFormFieldBinding<string>({ name: "email", control })
 */
import { useController, type Control, type FieldValues, type Path } from "react-hook-form"

import type { FieldState, FormControl } from "@/lib/forms"

/**
 * Wraps an RHF `control` in the kit's headless contract. `useField` delegates to
 * `useController`, so registration, validation and dirty tracking keep working.
 */
export function rhfFormControl<TValues extends FieldValues>(control: Control<TValues>): FormControl<TValues> {
	return {
		useField<TValue>(name: string): FieldState<TValue> {
			// Called unconditionally once per bound field, which is the hook contract.
			const { field, fieldState } = useController({ name: name as Path<TValues>, control })
			return {
				value: field.value as TValue,
				setValue: field.onChange,
				onBlur: field.onBlur,
				error: fieldState.error?.message,
				disabled: field.disabled,
			}
		},
	}
}
