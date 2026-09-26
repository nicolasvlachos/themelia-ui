export type DimensionPart = number | string | null | undefined

export interface FormatDimensionsOptions {
	depth?: DimensionPart
	unit?: string
	separator?: string
	locale?: string
	options?: Intl.NumberFormatOptions
}

const toNumber = (value: DimensionPart) => {
	if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) return undefined
	const parsed = typeof value === "number" ? value : Number(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

export function formatDimensions(
	width: DimensionPart,
	height: DimensionPart,
	{ depth, unit, separator = " × ", locale, options }: FormatDimensionsOptions = {},
) {
	const parts = [width, height, depth].map(toNumber).filter((part): part is number => part !== undefined)
	// Fewer than two axes is not a dimension — it is a single measurement.
	if (parts.length < 2) return undefined
	const formatter = new Intl.NumberFormat(locale, options)
	const joined = parts.map((part) => formatter.format(part)).join(separator)
	return unit ? `${joined} ${unit}` : joined
}
