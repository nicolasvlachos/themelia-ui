import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FilterType, type ActiveFilter, type FilterConfig, type FilterTab } from "@/components/features/filters"
import { DataView } from "./data-view"

const filters: FilterConfig[] = [{ key: "name", label: "Name", type: FilterType.SEARCH }]
const tabs: FilterTab[] = [{ id: "maria", label: "Maria's records", presets: [{ key: "name", value: ["Maria"] }] }]
const columns = [{ accessorKey: "name", header: "Name" }]
const data = [{ name: "Maria" }]

describe("DataView filter feedback", () => {
	it("uses consumer-owned failure copy", () => {
		render(<DataView data={data} columns={columns} strings={{ filterError: "Matching unavailable" }} filtering={{
			filters, activeFilters: [], onFilterChange: vi.fn(), filterRows: () => { throw new Error("Unavailable") },
		}} />)
		expect(screen.getByRole("alert")).toHaveTextContent("Matching unavailable")
	})

	it("the saved-view select uses the filter type's default operator", () => {
		const onFilterChange = vi.fn()
		render(<DataView data={data} columns={columns} filtering={{ filters, tabs, tabsDisplay: "select", activeFilters: [], onFilterChange }} />)
		fireEvent.click(screen.getByRole("combobox", { name: "Saved views" }))
		fireEvent.click(screen.getByRole("option", { name: "Maria's records" }))
		expect(onFilterChange).toHaveBeenCalledExactlyOnceWith([{ id: "name", key: "name", operator: "contains", value: ["Maria"] }])
	})

	it("does not mark a saved view active when its comparison differs", () => {
		const activeFilters: ActiveFilter[] = [{ id: "name", key: "name", operator: "not", value: ["Maria"] }]
		render(<DataView data={data} columns={columns} filtering={{ filters, tabs, tabsDisplay: "select", activeFilters, onFilterChange: vi.fn() }} />)
		expect(screen.getByRole("combobox", { name: "Saved views" })).not.toHaveTextContent("Maria's records")
	})

	it("warns when matching fails while retaining rows and the filter recovery controls", () => {
		const onError = vi.fn()
		const onFilterChange = vi.fn()
		render(<DataView data={data} columns={columns} filtering={{
			filters, activeFilters: [{ id: "name", key: "name", operator: "contains", value: ["Maria"] }],
			onFilterChange, onError, filterRows: () => { throw new Error("Invalid record") },
		}} />)
		expect(screen.getByRole("alert")).toHaveTextContent("Filters could not be applied. Showing all records.")
		expect(within(screen.getByRole("table")).getByText("Maria")).toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Clear filters" }))
		expect(onFilterChange).toHaveBeenCalledWith([])
		expect(onError).toHaveBeenCalledWith(expect.any(Error), { phase: "apply" })
	})
})
