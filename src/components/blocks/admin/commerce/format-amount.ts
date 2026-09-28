/**
 * How a deduction is written: whatever sign the caller supplied is replaced with U+2212,
 * which is digit-width and aligns in tabular figures.
 */

/** U+2212 MINUS SIGN. Not the hyphen on the keyboard. */
export const MINUS_SIGN = "−"

/** Drops whatever sign the caller already supplied, so exactly one can be added back. */
export function stripLeadingMinus(value: string): string {
	return value.replace(/^[\s−-]+/, "")
}

/** Writes an amount as a deduction. A blank value is returned untouched. */
export function formatDeduction(value: string): string {
	if (!value.trim()) return value
	return `${MINUS_SIGN}${stripLeadingMinus(value)}`
}
