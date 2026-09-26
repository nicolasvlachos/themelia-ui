export type RoundingMode = "round" | "floor" | "ceil" | "half-even"

/** Accepts a comma as the decimal separator — most of the world types one. */
export function formatDecimal(value: string, decimalPlaces: number, allowNegative: boolean): string {
	if (!value) return ""

	let formatted = value.replace(/,/g, ".")
	formatted = allowNegative ? formatted.replace(/[^\d.-]/g, "") : formatted.replace(/[^\d.]/g, "")

	if (allowNegative && formatted.includes("-")) {
		const leading = formatted.startsWith("-")
		formatted = formatted.replace(/-/g, "")
		if (leading) formatted = `-${formatted}`
	}

	const parts = formatted.split(".")
	if (parts.length > 2) formatted = `${parts[0]}.${parts.slice(1).join("")}`
	const [whole = "", fraction] = formatted.split(".")
	if (fraction !== undefined && fraction.length > decimalPlaces) {
		formatted = decimalPlaces === 0 ? whole : `${whole}.${fraction.slice(0, decimalPlaces)}`
	}

	return formatted
}

/**
 * Reads a pasted, externally formatted number into the "1234.56" form `formatDecimal`
 * expects (the keystroke formatter treats every comma as a decimal point). The last
 * separator is the decimal point, others are grouping; a lone separator before exactly
 * three digits is grouping when the field can't hold three decimals; symbols, spaces and
 * letters are dropped; a unicode minus, leading "-" or accounting parentheses mean
 * negative; scientific notation is expanded.
 */
export function normalizePastedNumber(text: string, decimalPlaces: number): string {
	const compact = text.trim().replace(/\s+/g, "")
	if (/^[-+\u2212]?(\d+\.?\d*|\.\d+)e[-+]?\d+$/i.test(compact)) {
		const expanded = Number(compact.replace("\u2212", "-"))
		if (Number.isFinite(expanded)) {
			return expanded.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 20 })
		}
	}
	const negative = /^[(\-\u2212]/.test(compact) || /^[^\d]*[-\u2212]/.test(compact)
	const kept = compact.replace(/[^\d.,]/g, "")
	if (!kept) return ""

	const lastDot = kept.lastIndexOf(".")
	const lastComma = kept.lastIndexOf(",")
	let decimalAt = Math.max(lastDot, lastComma)
	if (decimalAt >= 0 && (lastDot < 0 || lastComma < 0)) {
		/* Only one kind of separator. Several of them can only be grouping. */
		const separator = kept.charAt(decimalAt)
		const count = kept.split(separator).length - 1
		const before = kept.slice(0, decimalAt)
		const after = kept.slice(decimalAt + 1)
		if (count > 1 || (after.length === 3 && decimalPlaces < 3 && /^[1-9]\d{0,2}$/.test(before))) {
			decimalAt = -1
		}
	}
	const digits = (part: string) => part.replace(/[.,]/g, "")
	const whole = decimalAt < 0 ? digits(kept) : digits(kept.slice(0, decimalAt))
	const fraction = decimalAt < 0 ? undefined : digits(kept.slice(decimalAt + 1))
	return `${negative ? "-" : ""}${whole || (fraction !== undefined ? "0" : "")}${fraction !== undefined ? `.${fraction}` : ""}`
}

export function applyRounding(value: number, decimals: number, mode: RoundingMode): number {
	const factor = 10 ** decimals
	const shifted = value * factor

	switch (mode) {
		case "floor":
			return Math.floor(shifted) / factor
		case "ceil":
			return Math.ceil(shifted) / factor
		case "half-even": {
			const floor = Math.floor(shifted)
			const diff = shifted - floor
			if (diff > 0.5) return (floor + 1) / factor
			if (diff < 0.5) return floor / factor
			return (floor % 2 === 0 ? floor : floor + 1) / factor
		}
		default:
			return Math.round(shifted) / factor
	}
}
