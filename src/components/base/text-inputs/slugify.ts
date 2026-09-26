export interface SlugifyOptions {
	/** Character joining words. */
	separator?: string
	lowercase?: boolean
	/** Strips leading and trailing separators. */
	trim?: boolean
}

/**
 * Unicode-aware: `\p{Letter}` keeps non-Latin scripts intact instead of stripping them to
 * an empty string, and the NFKD pass folds accents onto their base letters first.
 */
export function slugify(
	value: string | number | null | undefined,
	{ separator = "-", lowercase = true, trim = true }: SlugifyOptions = {},
): string {
	const safeSeparator = separator || "-"
	const escaped = safeSeparator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

	let normalized = String(value ?? "")
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		// Spelled out rather than dropped: "R&D" becoming "rd" loses the word.
		.replace(/&/g, " and ")
		.replace(/['’]/g, "")

	if (lowercase) normalized = normalized.toLowerCase()

	normalized = normalized
		.replace(/[^\p{Letter}\p{Number}]+/gu, safeSeparator)
		.replace(new RegExp(`${escaped}{2,}`, "g"), safeSeparator)

	if (trim) normalized = normalized.replace(new RegExp(`^${escaped}|${escaped}$`, "g"), "")

	return normalized
}
