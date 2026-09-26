import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DataViewPagination } from "./data-view"

describe("DataViewPagination", () => {
	it("uses custom navigation copy and reports the requested page", () => {
		const onPageChange = vi.fn()
		render(<DataViewPagination page={2} pageCount={3} onPageChange={onPageChange} strings={{
			label: "Booking pages", previous: "Back", next: "Forward", page: (page) => `Booking page ${page}`,
		}} />)
		expect(screen.getByRole("navigation", { name: "Booking pages" })).toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Back" }))
		expect(onPageChange).toHaveBeenLastCalledWith(1)
		fireEvent.click(screen.getByRole("button", { name: "Forward" }))
		expect(onPageChange).toHaveBeenLastCalledWith(3)
		expect(screen.getByRole("button", { name: "Booking page 2" })).toHaveAttribute("aria-current", "page")
	})

	it.each([0, 1])("keeps the result summary when there are %i pages", (pageCount) => {
		render(<DataViewPagination page={1} pageCount={pageCount} total={pageCount === 0 ? 0 : "3 bookings"} />)
		expect(screen.getByText(pageCount === 0 ? "0" : "3 bookings")).toBeVisible()
		expect(screen.queryByRole("navigation")).toBeNull()
	})

	it("disables the actual controls while navigation is unavailable", () => {
		render(<DataViewPagination page={2} pageCount={4} disabled onPageChange={vi.fn()} />)
		const buttons = screen.getAllByRole("button")
		expect(buttons.length).toBeGreaterThan(3)
		for (const button of buttons) expect(button).toBeDisabled()
	})
})
