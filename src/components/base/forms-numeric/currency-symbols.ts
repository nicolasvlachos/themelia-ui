/* Currency symbols, in their own module so component files export only components (fast refresh). */

/**
 * The code-to-symbol map the currency options are labelled from, exported so a caller can
 * render the same symbol elsewhere. A starting set: anything not here is passed as a full
 * option.
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	JPY: "¥",
	CNY: "¥",
	CHF: "CHF",
	CAD: "C$",
	AUD: "A$",
	BGN: "лв",
	SEK: "kr",
	NOK: "kr",
	DKK: "kr",
	PLN: "zł",
}

