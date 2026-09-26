/**
 * Postal address ordering. There is no `Intl` for addresses, so this ships three common
 * orderings keyed by country, a documented default, and an explicit `order` for the rest.
 */
export interface AddressParts {
	line1?: string | null
	line2?: string | null
	city?: string | null
	/** State, province, county — whatever the country calls the level above a city. */
	region?: string | null
	postalCode?: string | null
	country?: string | null
}

export type AddressField = keyof AddressParts

/**
 * One line of an address. `separator` is one string for every gap, or one per gap
 * ("Mountain View, CA 94043" needs `[", ", " "]`).
 */
export interface AddressLine {
	fields: readonly AddressField[]
	separator?: string | readonly string[]
}

export type AddressOrder = readonly AddressLine[]

/** `city region postalCode` on one line: the US/CA/AU pattern. */
const CITY_REGION_POSTAL: AddressOrder = [
	{ fields: ["line1"] },
	{ fields: ["line2"] },
	{ fields: ["city", "region", "postalCode"], separator: [", ", " "] },
	{ fields: ["country"] },
]

/** `postalCode city` on one line: most of continental Europe. */
const POSTAL_CITY: AddressOrder = [
	{ fields: ["line1"] },
	{ fields: ["line2"] },
	{ fields: ["postalCode", "city"] },
	{ fields: ["region"] },
	{ fields: ["country"] },
]

/** City and postcode on their own lines: the UK/IE pattern. */
const POSTAL_LAST: AddressOrder = [
	{ fields: ["line1"] },
	{ fields: ["line2"] },
	{ fields: ["city"] },
	{ fields: ["region"] },
	{ fields: ["postalCode"] },
	{ fields: ["country"] },
]

const BY_COUNTRY: Record<string, AddressOrder> = {
	US: CITY_REGION_POSTAL,
	CA: CITY_REGION_POSTAL,
	AU: CITY_REGION_POSTAL,
	NZ: CITY_REGION_POSTAL,
	GB: POSTAL_LAST,
	UK: POSTAL_LAST,
	IE: POSTAL_LAST,
	DE: POSTAL_CITY,
	FR: POSTAL_CITY,
	ES: POSTAL_CITY,
	IT: POSTAL_CITY,
	NL: POSTAL_CITY,
	BE: POSTAL_CITY,
	AT: POSTAL_CITY,
	CH: POSTAL_CITY,
	SE: POSTAL_CITY,
	NO: POSTAL_CITY,
	DK: POSTAL_CITY,
	FI: POSTAL_CITY,
	PL: POSTAL_CITY,
	PT: POSTAL_CITY,
	GR: POSTAL_CITY,
	CZ: POSTAL_CITY,
}

/** The ordering used when the country is unknown or not listed. */
export const DEFAULT_ADDRESS_ORDER = POSTAL_LAST

export interface FormatAddressOptions {
	/**
	 * An ISO country code deciding the line order, matched case-insensitively. Falls back
	 * to `DEFAULT_ADDRESS_ORDER`; the reader's locale is never used to guess it.
	 */
	countryCode?: string | null
	/** Overrides the ordering outright. */
	order?: AddressOrder
	/** Joins fields on a line that does not specify its own. */
	separator?: string
	/**
	 * The locale a two-letter `country` is named in ("GB" becomes "United Kingdom") via
	 * `Intl.DisplayNames`; English when omitted. A longer `country` is printed as given.
	 */
	locale?: string
}

/**
 * Returns the address as lines, each already joined. Empty fields drop out, and a line
 * left with nothing drops with them, so a missing `line2` never leaves a blank row.
 */
export function formatAddressLines(
	parts: AddressParts,
	{ countryCode, order, separator = " ", locale }: FormatAddressOptions = {},
): string[] {
	const resolved =
		order ?? (countryCode ? (BY_COUNTRY[countryCode.trim().toUpperCase()] ?? DEFAULT_ADDRESS_ORDER) : DEFAULT_ADDRESS_ORDER)

	const lines: string[] = []
	for (const line of resolved) {
		/*
		 * A gap is chosen by the declared position of the field it follows, not by how many
		 * values survived: with no city, "CA 94043", not "CA, 94043".
		 */
		const gaps = line.separator ?? separator
		let text = ""
		let previous = -1

		line.fields.forEach((field, position) => {
			const raw = field === "country" ? countryName(parts.country, locale) : parts[field]
			if (typeof raw !== "string" || raw.trim() === "") return
			const value = raw.trim()

			if (previous === -1) {
				text = value
			} else {
				const gap = Array.isArray(gaps) ? (gaps[previous] ?? " ") : (gaps as string)
				text += `${gap}${value}`
			}
			previous = position
		})

		if (text) lines.push(text)
	}
	return lines
}

/** A two-letter code becomes a name; anything else is already one. */
function countryName(country: string | null | undefined, locale?: string) {
	if (!country) return country
	const trimmed = country.trim()
	if (!/^[A-Za-z]{2}$/.test(trimmed)) return trimmed
	try {
		return new Intl.DisplayNames([locale ?? "en"], { type: "region" }).of(trimmed.toUpperCase()) ?? trimmed
	} catch {
		return trimmed
	}
}

/** The same address on one line, for a cell or a summary row. */
export function formatAddress(parts: AddressParts, options: FormatAddressOptions = {}): string {
	return formatAddressLines(parts, options).join(", ")
}
