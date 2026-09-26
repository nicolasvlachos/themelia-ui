/**
 * Bridges for `FilterConfig.validation.custom`: adapt a `safeParse` schema or a bare
 * predicate onto the `true | string` contract, with no validation library dependency.
 */
import type { ValidationConfig } from "./filters.types"

/** Anything with Zod's `safeParse`. Zod 3, Zod 4, and a thin Valibot wrapper all fit. */
export interface SafeParseSchema<TInput = unknown> {
	safeParse(value: TInput): {
		success: boolean
		error?: { message?: string; issues?: { message: string }[] }
	}
}

export function zodValidator<TInput = unknown>(
	schema: SafeParseSchema<TInput>,
): NonNullable<ValidationConfig["custom"]> {
	return (value: unknown): boolean | string => {
		/* Absent values are `validation.required`'s business; do not report them twice. */
		if (value === undefined || value === null) return true
		if (typeof value === "string" && value.length === 0) return true

		const result = schema.safeParse(value as TInput)
		if (result.success) return true

		// Only the first issue.
		return result.error?.issues?.[0]?.message ?? result.error?.message ?? false
	}
}

export function predicateValidator(
	predicate: (value: unknown) => boolean,
	message: string,
): NonNullable<ValidationConfig["custom"]> {
	return (value: unknown) => (predicate(value) ? true : message)
}
