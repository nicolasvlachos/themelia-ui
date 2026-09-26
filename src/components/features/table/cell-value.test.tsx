import { render } from "@testing-library/react"
import { de } from "date-fns/locale"
import { describe, expect, it } from "vitest"

import { CellValue } from "./cell-value"

describe("CellValue", () => {
	it("hands a money string to Money rather than to Number()", () => {
		const { container } = render(<CellValue value="1.234,56" kind="money" currency="EUR" locale="de-DE" />)
		expect(container.textContent).toMatch(/1\.234,56/)
		expect(container.querySelector('[data-slot="empty-value"], .empty-value--component')).toBeNull()
	})

	it("formats a date in the cell's own dateLocale", () => {
		const { container } = render(
			<CellValue value={new Date(2026, 2, 5)} kind="date" pattern="d MMMM yyyy" dateLocale={de} />,
		)
		expect(container.textContent).toBe("5 März 2026")
	})
})
