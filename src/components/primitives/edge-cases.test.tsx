import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Coordinates, FileSize, Measure, Money, Number, Percent, Quantity, Rating, Ratio, Url, formatDateRange, formatFileSize } from "./index"

describe("primitive edge cases", () => {
	it.each([Number, Percent])("treats whitespace-only numeric strings as missing", Component => {
		render(<Component value="  " emptyLabel="Missing" />)
		expect(screen.getByText("Missing")).toBeInTheDocument()
	})
	it.each([FileSize, Measure, Quantity, Rating, Ratio])("uses the empty state for non-finite numeric values", Component => {
		render(<Component value={NaN} emptyLabel="Missing" />)
		expect(screen.getByText("Missing")).toBeInTheDocument()
	})
	it("never invents an undefined unit for a fractional byte", () => {
		expect(formatFileSize(0.5, { locale: "en-US" })).toBe("1 B")
	})
	it("honors a custom date range pattern at both ends", () => {
		expect(formatDateRange(new Date(2026, 8, 1), new Date(2026, 8, 3), { pattern: "yyyy-MM-dd" })).toBe("2026-09-01 – 2026-09-03")
	})
	it("collapses the default date range when both timestamps display the same day", () => {
		expect(formatDateRange(new Date(2026, 8, 1, 9), new Date(2026, 8, 1, 17))).toBe("1 Sep 2026")
	})
	it("carries rounded DMS seconds into minutes and degrees", () => {
		render(<Coordinates latitude={89.999999} longitude={0} format="dms" />)
		expect(screen.getByText(`90°00'00.0"N 0°00'00.0"E`)).toBeInTheDocument()
	})
	it("shows the empty state for a missing URL, including external links", () => {
		render(<Url external emptyLabel="Missing" />)
		expect(screen.getByText("Missing")).toBeInTheDocument()
		expect(screen.queryByRole("link")).not.toBeInTheDocument()
	})
	it.each(["12oops", "1,2,3", "1.234.56", "1,2.3", "0x10", "0b11"])("rejects a malformed monetary amount: %s", amount => {
		render(<Money amount={amount} emptyLabel="Missing" />)
		expect(screen.getByText("Missing")).toBeInTheDocument()
	})
	it.each(["1,234.56", "1.234,56"])("preserves valid grouped monetary strings: %s", amount => {
		render(<Money amount={amount} currency="EUR" locale="en-US" formatMode="decimal" />)
		expect(screen.getByText("1,234.56")).toBeInTheDocument()
	})
	it("retains three fractional digits in a canonical decimal monetary string", () => {
		render(<Money amount="1.234" currency="KWD" locale="en-US" formatMode="decimal" />)
		expect(screen.getByText("1.234")).toBeInTheDocument()
	})
})
