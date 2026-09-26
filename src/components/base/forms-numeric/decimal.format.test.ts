import { describe, expect, it } from "vitest"

import { formatDecimal, normalizePastedNumber } from "./decimal.format"

/* What a pasted value becomes once the field's own formatter has run over it. */
const paste = (text: string, places = 2, allowNegative = true) =>
	formatDecimal(normalizePastedNumber(text, places), places, allowNegative)

describe("pasting a formatted number", () => {
	it("keeps the whole-number part of grouped values", () => {
		expect(paste("1,234.56")).toBe("1234.56")
		expect(paste("1.234,56")).toBe("1234.56")
		expect(paste("€1,234.50")).toBe("1234.50")
		expect(paste("1 234,56")).toBe("1234.56")
		expect(paste("1,234,567")).toBe("1234567")
		expect(paste("12.345.678,9")).toBe("12345678.9")
	})

	it("reads a lone separator as the decimal point unless it can only be grouping", () => {
		expect(paste("12,5")).toBe("12.5")
		expect(paste("0,123")).toBe("0.12")
		expect(paste("1,234")).toBe("1234")
		expect(paste("1,234", 3)).toBe("1.234")
	})

	it("expands scientific notation and keeps a sign", () => {
		expect(paste("1e3")).toBe("1000")
		expect(paste("-1,234.5")).toBe("-1234.5")
		expect(paste("−1234.5")).toBe("-1234.5")
		expect(paste("(1,234.50)")).toBe("-1234.50")
		expect(paste("-1,234.5", 2, false)).toBe("1234.5")
	})

	it("leaves plain digits alone", () => {
		expect(paste("42")).toBe("42")
		expect(paste("abc")).toBe("")
	})
})
