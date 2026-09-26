/* Currency symbols, in their own module so component files export only components (fast refresh). */

/** A starting set. Anything not here is passed as a full option. */
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

