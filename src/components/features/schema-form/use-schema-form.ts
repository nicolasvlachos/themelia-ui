/**
 * useSchemaForm: values, errors and validation for a schema-described form. Server
 * `errors` win over local messages for the same key. Local messages clear on the field's
 * next change; server messages stay until the consumer replaces them.
 */
import { useCallback, useMemo, useState } from "react"

import type {
	SchemaFormErrors, SchemaFormField, SchemaFormSubmitHelpers, SchemaFormValue,
	SchemaFormValues,
} from "./schema-form.types"
import { useLatest } from "@/hooks/use-latest"
import { isFieldDisabled, isFieldHidden } from "./schema-form.utils"

export interface UseSchemaFormOptions {
	fields: SchemaFormField[]
	value?: SchemaFormValues
	defaultValue?: SchemaFormValues
	errors?: SchemaFormErrors
	onValueChange?: (values: SchemaFormValues) => void
	onFieldChange?: (key: string, value: SchemaFormValue, values: SchemaFormValues) => void
	requiredError: (label: string) => string
	validationError: string
	onError?: (error: unknown) => void
}

export interface UseSchemaFormResult extends SchemaFormSubmitHelpers {
	values: SchemaFormValues
	errors: SchemaFormErrors
	getFieldError: (key: string) => string | undefined
	getFieldValue: (key: string) => SchemaFormValue
}

/** `defaultValue` first, then each field's own: an explicit default outranks the schema's. */
function initialValuesFor(
	fields: SchemaFormField[],
	defaultValue?: SchemaFormValues,
): SchemaFormValues {
	const values: SchemaFormValues = { ...(defaultValue ?? {}) }
	for (const field of fields) {
		if (field.defaultValue !== undefined && values[field.key] === undefined) {
			values[field.key] = field.defaultValue
		}
	}
	return values
}

/** What "required" means, per shape: absent, blank after trimming, or an empty list. */
function isMissing(value: SchemaFormValue): boolean {
	if (value === undefined || value === null) return true
	if (typeof value === "string") return value.trim().length === 0
	if (Array.isArray(value)) return value.length === 0
	return false
}

function definedErrors(errors?: SchemaFormErrors): SchemaFormErrors {
	const next: SchemaFormErrors = {}
	for (const [key, message] of Object.entries(errors ?? {})) if (message) next[key] = message
	return next
}

export function useSchemaForm({
	fields,
	value,
	defaultValue,
	errors: externalErrors,
	onValueChange,
	onFieldChange,
	requiredError,
	validationError,
	onError,
}: UseSchemaFormOptions): UseSchemaFormResult {
	const isControlled = value !== undefined
	const initial = useMemo(() => initialValuesFor(fields, defaultValue), [defaultValue, fields])
	const [internal, setInternal] = useState<SchemaFormValues>(() => initial)
	const [localErrors, setLocalErrors] = useState<SchemaFormErrors>({})

	/* Schema defaults sit under a controlled value, so a partial controlled value keeps them. */
	const values = useMemo(
		() => (isControlled ? { ...initial, ...(value ?? {}) } : internal),
		[initial, internal, isControlled, value],
	)

	const valuesRef = useLatest(values)

	const errors = useMemo(
		() => ({ ...localErrors, ...definedErrors(externalErrors) }),
		[externalErrors, localErrors],
	)

	const setValues = useCallback(
		(next: SchemaFormValues) => {
			valuesRef.current = next
			if (!isControlled) setInternal(next)
			onValueChange?.(next)
		},
		[isControlled, onValueChange, valuesRef],
	)

	const setFieldValue = useCallback(
		(key: string, fieldValue: SchemaFormValue) => {
			const next = { ...valuesRef.current, [key]: fieldValue }
			valuesRef.current = next
			if (!isControlled) setInternal(next)
			// Only this field's message, and only if there is one to clear.
			setLocalErrors((current) => {
				if (!current[key]) return current
				const { [key]: _cleared, ...rest } = current
				return rest
			})
			onFieldChange?.(key, fieldValue, next)
			onValueChange?.(next)
		},
		[isControlled, onFieldChange, onValueChange, valuesRef],
	)

	const reset = useCallback(() => {
		const next = initialValuesFor(fields, defaultValue)
		valuesRef.current = next
		if (!isControlled) setInternal(next)
		setLocalErrors({})
		onValueChange?.(next)
		return next
	}, [defaultValue, fields, isControlled, onValueChange, valuesRef])

	const validate = useCallback(() => {
		const next: SchemaFormErrors = {}
		const values = valuesRef.current

		for (const field of fields) {
			// Hidden or disabled fields are not validated: the reader could not fix them.
			if (isFieldHidden(field, values, onError) || isFieldDisabled(field, values, onError)) continue

			const fieldValue = values[field.key]
			if (field.required && isMissing(fieldValue)) {
				next[field.key] = requiredError(field.label)
				continue
			}

			const validators = Array.isArray(field.validate)
				? field.validate
				: field.validate
					? [field.validate]
					: []

			for (const validator of validators) {
				try {
					const result = validator(fieldValue, values, field)
					// First message wins.
					if (typeof result === "string" && result.length > 0) {
						next[field.key] = result
						break
					}
				} catch (error) {
					onError?.(error)
					next[field.key] = validationError
					break
				}
			}
		}

		setLocalErrors(next)
		return Object.keys(next).length === 0
	}, [fields, onError, requiredError, validationError, valuesRef])

	const getFieldError = useCallback((key: string) => errors[key], [errors])
	const getFieldValue = useCallback((key: string) => values[key], [values])

	return { values, errors, getFieldError, getFieldValue, setFieldValue, setValues, reset, validate }
}
