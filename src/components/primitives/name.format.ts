export interface NameFormatOptions {
	/** Title-case even when the value already looks intentionally cased. */
	force?: boolean
}

export function formatName(value: string, { force = false }: NameFormatOptions = {}) {
	const trimmed = value.trim().replace(/\s+/g, " ")
	if (!trimmed) return ""

	const allUpper = trimmed === trimmed.toUpperCase()
	const allLower = trimmed === trimmed.toLowerCase()
	// Deliberate casing is anything that is neither shouted nor entirely lowercase.
	if (!force && !allUpper && !allLower) return trimmed

	return trimmed
		.split(" ")
		.map((word) =>
			word
				// Hyphenated and apostrophised parts each get their own capital:
				// "jean-luc" → "Jean-Luc", "o'brien" → "O'Brien".
				.split(/([-'])/)
				.map((part) =>
					part.length > 1 ? part[0]!.toUpperCase() + part.slice(1).toLowerCase() : part,
				)
				.join(""),
		)
		.join(" ")
}
