/** A QR code's copy: its pending and failed states, and the symbol's accessible name. */
export interface QRCodeStrings {
	/** While the symbol is being generated. */
	generating: string
	/** When the value cannot be encoded at all. */
	failed: string
	/** Names the rendered symbol, by the value it encodes. */
	label: (value: string) => string
}

export const defaultQRCodeStrings: QRCodeStrings = {
	generating: "Generating…",
	failed: "Could not generate a code for this value.",
	label: (value) => `QR code for ${value}`,
}
