import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FilterProvider } from "./filter-context"
import { FilterTabs } from "./filter-tabs"
import { FilterType, type FilterConfig, type FilterOperator } from "./filters.types"

describe("saved filter views", () => {
	it.each(["tabs", "select"] as const)("%s preserves configured comparisons and replaces prior narrowing", (display) => {
		const onFilterChange = vi.fn()
		const filters: FilterConfig[] = [{ key: "amount", label: "Amount", type: FilterType.RANGE, operators: [{ value: "gte", label: "At least" }] }]
		render(<FilterProvider filters={filters} activeFilters={[{ id: "q", key: "q", operator: "contains", value: ["old"] }]} onFilterChange={onFilterChange}>
			<FilterTabs display={display} tabs={[{ id: "large", label: "Large orders", presets: [{ key: "amount", value: ["100"] }] }]} />
		</FilterProvider>)
		if (display === "select") fireEvent.click(screen.getByRole("combobox", { name: "Saved views" }))
		fireEvent.click(screen.getByRole(display === "select" ? "option" : "tab", { name: "Large orders" }))
		expect(onFilterChange).toHaveBeenCalledExactlyOnceWith([{ id: "amount", key: "amount", operator: "gte", value: ["100"] }])
	})

	it.each([
		{ operator: "between", selected: false },
		{ operator: "in", selected: true },
	] satisfies { operator: FilterOperator; selected: boolean }[])("matches $operator values with the correct ordering semantics", ({ operator, selected }) => {
		render(<FilterProvider filters={[]} activeFilters={[{ id: "range", key: "range", operator, value: ["20", "10"] }]} onFilterChange={vi.fn()}>
			<FilterTabs tabs={[{ id: "range", label: "Saved range", presets: [{ key: "range", operator, value: ["10", "20"] }] }]} />
		</FilterProvider>)
		expect(screen.getByRole("tab", { name: "Saved range" })).toHaveAttribute("aria-selected", String(selected))
	})
})
