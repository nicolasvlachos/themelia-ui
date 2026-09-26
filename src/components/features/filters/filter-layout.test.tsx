import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FilterProvider } from "./filter-context"
import { FiltersButton } from "./filters-button"
import { FilterLayout } from "./filter-layout"
import { FilterType, type FilterConfig } from "./filters.types"

const filters: FilterConfig[] = [
	{ key: "q", label: "Search", type: FilterType.SEARCH },
	{ key: "status", label: "Status", type: FilterType.SELECT, options: [{ value: "open", label: "Open" }] },
	{ key: "owner", label: "Owner", type: FilterType.SELECT, options: [{ value: "me", label: "Me" }] },
]

describe("FiltersButton label", () => {
	it("uses an accessible icon-only trigger by default and supports a visible label", () => {
		const view = (labelVisibility?: "hidden" | "visible") => (
			<FilterProvider filters={filters} activeFilters={[]} onFilterChange={vi.fn()}>
				<FiltersButton availableFilters={filters} {...(labelVisibility ? { labelVisibility } : {})} />
			</FilterProvider>
		)
		const { rerender } = render(view())
		const trigger = screen.getByRole("button", { name: "Add filter" })
		expect(trigger).not.toHaveTextContent("Add filter")

		rerender(view("visible"))
		expect(screen.getByRole("button", { name: "Add filter" })).toHaveTextContent("Add filter")
	})
})

describe("FilterLayout pending state", () => {
	it("disables search, saved views, pills, and reset during navigation, then restores them", () => {
		const onFilterChange = vi.fn()
		const view = (navigating: boolean) => <FilterProvider filters={filters} activeFilters={[{ id: "status", key: "status", operator: "equals", value: ["open"] }]} onFilterChange={onFilterChange} navigating={navigating}>
			<FilterLayout tabs={[{ id: "all", label: "All", presets: [] }]} />
		</FilterProvider>
		const { rerender } = render(view(true))
		expect(screen.getByRole("textbox", { name: "Search" })).toBeDisabled()
		for (const name of ["Status", "Edit: Status", "Clear: Status", "Clear filters", "Add filter", "Comparison"]) {
			expect(screen.getByRole("button", { name })).toBeDisabled()
		}
		expect(screen.getByRole("tab", { name: "All" })).toBeDisabled()
		expect(screen.getByRole("status")).toHaveTextContent("Updating results")
		fireEvent.click(screen.getByRole("button", { name: "Clear filters" }))
		expect(onFilterChange).not.toHaveBeenCalled()
		rerender(view(false))
		expect(screen.getByRole("textbox", { name: "Search" })).toBeEnabled()
		fireEvent.click(screen.getByRole("button", { name: "Clear filters" }))
		expect(onFilterChange).toHaveBeenCalledExactlyOnceWith([])
	})

	it("closes an open value editor during navigation and keeps it closed after recovery", () => {
		const view = (navigating: boolean) => <FilterProvider filters={[{ key: "amount", label: "Amount", type: FilterType.RANGE }]} activeFilters={[{ id: "amount", key: "amount", operator: "gt", value: ["10"] }]} onFilterChange={vi.fn()} navigating={navigating}>
			<FilterLayout />
		</FilterProvider>
		const { rerender } = render(view(false))
		fireEvent.click(screen.getByRole("button", { name: "Edit: Amount" }))
		expect(screen.getByRole("dialog")).toBeInTheDocument()
		rerender(view(true))
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		rerender(view(false))
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
	})
})

describe("FilterLayout comparison changes", () => {
	it("renders range bounds from the applied operator rather than the original config", () => {
		const range = { key: "amount", label: "Amount", type: FilterType.RANGE, operator: "between" as const }
		const view = (operator: "gt" | "between") => <FilterProvider filters={[range]} activeFilters={[{ id: "amount", key: "amount", operator, value: ["10", "20"] }]} onFilterChange={vi.fn()}>
			<FilterLayout />
		</FilterProvider>
		const { rerender } = render(view("gt"))
		fireEvent.click(screen.getByRole("button", { name: "Edit: Amount" }))
		expect(screen.getByRole("spinbutton", { name: "Min" })).toHaveValue(10)
		expect(screen.queryByRole("spinbutton", { name: "Max" })).not.toBeInTheDocument()
		rerender(view("between"))
		expect(screen.getByRole("spinbutton", { name: "Max" })).toHaveValue(20)
	})
})
