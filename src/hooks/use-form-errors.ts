type ErrorKey<T> = Extract<keyof T, string>

export type ErrorBag<T> = Partial<Record<ErrorKey<T> | "server" | "general", string>>

export interface UseFormErrorsResult<T> {
	getError: (field: ErrorKey<T>) => string | undefined
	hasError: (field: ErrorKey<T>) => boolean
	/** A failure that belongs to no single field. Show it above the form, not beside a control. */
	formError: string | undefined
	/** True when anything at all failed, including the unattributed keys. */
	hasAnyError: boolean
}

/**
 * Reads a server error bag: field messages plus the reserved `server` and `general` keys,
 * surfaced as `formError` so they are not swallowed. Stateless.
 */
export function useFormErrors<T extends Record<string, unknown> = Record<string, unknown>>(
	errors?: ErrorBag<T>,
): UseFormErrorsResult<T> {
	const getError = (field: ErrorKey<T>) => errors?.[field]
	const hasError = (field: ErrorKey<T>) => errors?.[field] !== undefined

	return {
		getError,
		hasError,
		formError: errors?.server ?? errors?.general,
		hasAnyError: !!errors && Object.values(errors).some((message) => message !== undefined),
	}
}
