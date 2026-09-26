export interface OtpInputStrings {
	/**
	 * Names the field, and with it the first box. A caller's `aria-label`/`aria-labelledby`
	 * (or a surrounding `FormField`) replaces it.
	 */
	fieldLabel: string
	/**
	 * Names each remaining box by position. A numeric-only form can say so:
	 * `strings={{ slotLabel: (n, of) => \`Digit ${n} of ${of}\` }}`.
	 */
	slotLabel: (position: number, length: number) => string
}

export const defaultOtpInputStrings: OtpInputStrings = {
	fieldLabel: "One-time code",
	slotLabel: (position, length) => `Character ${position} of ${length}`,
}
