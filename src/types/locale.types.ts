/** One language a product is available in, named in the interface language and its own. */
export interface LocaleOption {
	/** BCP-47 tag — "en-GB", "nl". */
	value: string
	/** In the CURRENT interface language. */
	label: string
	/** In its OWN language. */
	nativeLabel: string
	/** Whether the product is actually served in it. */
	active: boolean
	/** A flag emoji or an image URL. Decorative — a language is not a country. */
	flag?: string
}
