/** Country dial codes — a bounded list; pass your own `CountryPrefixOption`s for others. */
export interface CountryPrefixOption {
	/** Dial code, e.g. "+1". */
	value: string
	/** Country name. */
	label: string
	/** ISO 3166-1 alpha-2 code, e.g. "US". */
	iso: string
}

/** Either an ISO code that is looked up here, or a full option for one that is not. */
export type CountryPrefixInput = string | CountryPrefixOption

export const COUNTRY_PREFIX_MAP: Record<string, CountryPrefixOption> = {
	US: { value: "+1", label: "United States", iso: "US" },
	CA: { value: "+1", label: "Canada", iso: "CA" },
	AU: { value: "+61", label: "Australia", iso: "AU" },
	BG: { value: "+359", label: "Bulgaria", iso: "BG" },
	GR: { value: "+30", label: "Greece", iso: "GR" },
	GB: { value: "+44", label: "United Kingdom", iso: "GB" },
	DE: { value: "+49", label: "Germany", iso: "DE" },
	FR: { value: "+33", label: "France", iso: "FR" },
	IT: { value: "+39", label: "Italy", iso: "IT" },
	ES: { value: "+34", label: "Spain", iso: "ES" },
	NL: { value: "+31", label: "Netherlands", iso: "NL" },
	BE: { value: "+32", label: "Belgium", iso: "BE" },
	AT: { value: "+43", label: "Austria", iso: "AT" },
	CH: { value: "+41", label: "Switzerland", iso: "CH" },
	PL: { value: "+48", label: "Poland", iso: "PL" },
	RO: { value: "+40", label: "Romania", iso: "RO" },
	RS: { value: "+381", label: "Serbia", iso: "RS" },
	HR: { value: "+385", label: "Croatia", iso: "HR" },
	SI: { value: "+386", label: "Slovenia", iso: "SI" },
	MK: { value: "+389", label: "North Macedonia", iso: "MK" },
	TR: { value: "+90", label: "Turkey", iso: "TR" },
	RU: { value: "+7", label: "Russia", iso: "RU" },
	UA: { value: "+380", label: "Ukraine", iso: "UA" },
	SK: { value: "+421", label: "Slovakia", iso: "SK" },
	CZ: { value: "+420", label: "Czech Republic", iso: "CZ" },
	HU: { value: "+36", label: "Hungary", iso: "HU" },
	PT: { value: "+351", label: "Portugal", iso: "PT" },
	IE: { value: "+353", label: "Ireland", iso: "IE" },
	SE: { value: "+46", label: "Sweden", iso: "SE" },
	NO: { value: "+47", label: "Norway", iso: "NO" },
	DK: { value: "+45", label: "Denmark", iso: "DK" },
	FI: { value: "+358", label: "Finland", iso: "FI" },
	CY: { value: "+357", label: "Cyprus", iso: "CY" },
	AL: { value: "+355", label: "Albania", iso: "AL" },
	ME: { value: "+382", label: "Montenegro", iso: "ME" },
	BA: { value: "+387", label: "Bosnia and Herzegovina", iso: "BA" },
	XK: { value: "+383", label: "Kosovo", iso: "XK" },
	MD: { value: "+373", label: "Moldova", iso: "MD" },
	BY: { value: "+375", label: "Belarus", iso: "BY" },
	LT: { value: "+370", label: "Lithuania", iso: "LT" },
	LV: { value: "+371", label: "Latvia", iso: "LV" },
	EE: { value: "+372", label: "Estonia", iso: "EE" },
};
/** A common starting set. Override with `prefixes`. */
export const DEFAULT_COUNTRY_PREFIXES: CountryPrefixInput[] = ["US", "CA", "GB", "DE", "FR", "IT", "ES", "AU"]

/** Resolves an ISO code or a full option to an option; returns null for an unknown code. */
export function normalizeCountryPrefix(input: CountryPrefixInput): CountryPrefixOption | null {
	if (typeof input !== "string") return input
	return COUNTRY_PREFIX_MAP[input.toUpperCase()] ?? null
}
