import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { FilterProvider } from "./filter-context"
import { FilterType, type ActiveFilter } from "./filters.types"
import { SearchFilter } from "./search-filters"
import { useFilters } from "./filter-store"

const filter = { key: "q", label: "Search", type: FilterType.SEARCH, delay: 200 }
const applied = (value: string): ActiveFilter[] => value ? [{ id: "q", key: "q", operator: "equals", value: [value] }] : []

function ResetActions() {
	const { clearFilters, replaceFilters } = useFilters()
	return <><button onClick={clearFilters}>Clear</button><button onClick={() => replaceFilters([])}>Saved view</button></>
}

describe("SearchFilter", () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it.each(["Clear", "Saved view"])("%s cancels a pending query even before its first application", (action) => {
		const onFilterChange = vi.fn()
		render(<FilterProvider filters={[filter]} activeFilters={[]} onFilterChange={onFilterChange}>
			<SearchFilter filter={filter} /><ResetActions />
		</FilterProvider>)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Granary" } })
		fireEvent.click(screen.getByRole("button", { name: action }))
		act(() => vi.advanceTimersByTime(400))
		expect(screen.getByRole("textbox")).toHaveValue("")
		expect(onFilterChange).toHaveBeenCalledExactlyOnceWith([])
	})

	it("does not restore a debounced query after the consumer clears it", () => {
		const onFilterChange = vi.fn()
		const view = (value: string) => <FilterProvider filters={[filter]} activeFilters={applied(value)} onFilterChange={onFilterChange}>
			<SearchFilter filter={filter} />
		</FilterProvider>
		const { rerender } = render(view("Marlow"))
		rerender(view(""))
		expect(screen.getByRole("textbox")).toHaveValue("")
		act(() => vi.advanceTimersByTime(400))
		expect(onFilterChange).not.toHaveBeenCalled()
	})

	it("cancels a pending edit when a saved view changes the applied query", () => {
		const onFilterChange = vi.fn()
		const view = (value: string) => <FilterProvider filters={[filter]} activeFilters={applied(value)} onFilterChange={onFilterChange}>
			<SearchFilter filter={filter} />
		</FilterProvider>
		const { rerender } = render(view("Marlow"))
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Granary" } })
		act(() => vi.advanceTimersByTime(100))
		rerender(view("Riverside"))
		act(() => vi.advanceTimersByTime(400))
		expect(screen.getByRole("textbox")).toHaveValue("Riverside")
		expect(onFilterChange).not.toHaveBeenCalled()
	})

	it("applies typing only after the delay and ignores whitespace-only queries", () => {
		const onFilterChange = vi.fn()
		render(<FilterProvider filters={[filter]} activeFilters={[]} onFilterChange={onFilterChange}>
			<SearchFilter filter={filter} />
		</FilterProvider>)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "  " } })
		act(() => vi.advanceTimersByTime(200))
		expect(onFilterChange).not.toHaveBeenCalled()
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Granary" } })
		act(() => vi.advanceTimersByTime(199))
		expect(onFilterChange).not.toHaveBeenCalled()
		act(() => vi.advanceTimersByTime(1))
		expect(onFilterChange).toHaveBeenCalledOnce()
		expect(onFilterChange.mock.calls[0]![0]).toEqual(expect.arrayContaining([expect.objectContaining({ key: "q", value: ["Granary"] })]))
	})

	it("does not send a delayed query while navigation is pending", () => {
		const onFilterChange = vi.fn()
		const view = (navigating: boolean, value = "") => <FilterProvider filters={[filter]} activeFilters={applied(value)} onFilterChange={onFilterChange} navigating={navigating}>
			<SearchFilter filter={filter} />
		</FilterProvider>
		const { rerender } = render(view(false))
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Stale query" } })
		rerender(view(true))
		act(() => vi.advanceTimersByTime(400))
		expect(onFilterChange).not.toHaveBeenCalled()
		rerender(view(false, "Restored query"))
		act(() => vi.advanceTimersByTime(400))
		expect(screen.getByRole("textbox")).toHaveValue("Restored query")
		expect(onFilterChange).not.toHaveBeenCalled()
	})
})
