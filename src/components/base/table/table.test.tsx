import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Table, TableBody, TableCaption, TableCell, TableRow } from "./table"

function wide(scrollWidth: number, clientWidth: number) {
	vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
		return this.classList.contains("table--container") ? scrollWidth : 0
	})
	vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
		return this.classList.contains("table--container") ? clientWidth : 0
	})
}

afterEach(() => {
	vi.restoreAllMocks()
})

const rows = (
	<TableBody>
		<TableRow>
			<TableCell>Invoice</TableCell>
		</TableRow>
	</TableBody>
)

describe("Table scroll container", () => {
	it("is not a tab stop when nothing scrolls", () => {
		wide(300, 300)
		const { container } = render(<Table>{rows}</Table>)
		const scroller = container.querySelector(".table--container")
		expect(scroller).not.toHaveAttribute("tabindex")
		expect(scroller).not.toHaveAttribute("role")
	})

	it("is a named, focusable group while it scrolls, named by its caption", () => {
		wide(900, 300)
		render(
			<Table>
				<TableCaption>Recent invoices</TableCaption>
				{rows}
			</Table>,
		)
		const region = screen.getByRole("group", { name: "Recent invoices" })
		expect(region).toHaveAttribute("tabindex", "0")
		expect(region).toHaveAttribute("data-fade-end")
		expect(region).not.toHaveAttribute("data-fade-start")
	})

	it("takes the table's own label when it has one", () => {
		wide(900, 300)
		render(<Table aria-label="Payouts">{rows}</Table>)
		expect(screen.getByRole("group", { name: "Payouts" })).toHaveAttribute("tabindex", "0")
	})

	it("takes its group name from strings when given one", () => {
		wide(900, 300)
		render(<Table strings={{ scrollRegion: "Invoices, scrollable" }}>{rows}</Table>)
		expect(screen.getByRole("group", { name: "Invoices, scrollable" })).toHaveAttribute("tabindex", "0")
	})
})
