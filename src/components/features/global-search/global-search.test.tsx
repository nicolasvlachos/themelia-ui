import { fireEvent, render, renderHook, screen } from "@testing-library/react"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import { GlobalSearch } from "./global-search"
import { GlobalSearchDialog } from "./global-search-dialog"
import { GlobalSearchResultRow } from "./global-search-result-row"
import type { GlobalSearchResult } from "./global-search.types"
import { useGlobalSearch } from "./use-global-search"

const dialogMethods = ["showModal", "close"] as const
const nativeMethods = dialogMethods.map(name => Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name))
beforeAll(() => {
	for (const name of dialogMethods) Object.defineProperty(HTMLDialogElement.prototype, name, {
		configurable: true, value(this: HTMLDialogElement) { this.open = name === "showModal" },
	})
})
afterAll(() => {
	dialogMethods.forEach((name, index) => {
		const native = nativeMethods[index]
		if (native) Object.defineProperty(HTMLDialogElement.prototype, name, native)
		else Reflect.deleteProperty(HTMLDialogElement.prototype, name)
	})
})

const results = [
	{ id: "a1", group: "people", title: "Alice" },
	{ id: "b1", group: "files", title: "Annual report" },
	{ id: "a2", group: "people", title: "Andrew" },
] as const satisfies readonly GlobalSearchResult[]

function panel(props: Partial<React.ComponentProps<typeof GlobalSearch>> = {}) {
	return <GlobalSearch query="an" onQueryChange={() => {}} results={results} {...props} />
}

describe("GlobalSearch", () => {
	it("walks the grouped display order, even when the incoming results are interleaved", () => {
		const onResultSelect = vi.fn()
		render(panel({ onResultSelect }))
		const input = screen.getByRole("textbox")
		fireEvent.keyDown(input, { key: "ArrowDown" })
		fireEvent.keyDown(input, { key: "Enter" })
		expect(onResultSelect).toHaveBeenLastCalledWith(results[2])
		fireEvent.keyDown(input, { key: "ArrowDown" })
		fireEvent.keyDown(input, { key: "Enter" })
		expect(onResultSelect).toHaveBeenLastCalledWith(results[1])
	})

	it("clamps the highlight when an async result set shrinks", () => {
		const onResultSelect = vi.fn()
		const { rerender } = render(panel({ onResultSelect }))
		const input = screen.getByRole("textbox")
		fireEvent.keyDown(input, { key: "ArrowDown" })
		fireEvent.keyDown(input, { key: "ArrowDown" })
		rerender(panel({ results: [results[0]], onResultSelect }))
		fireEvent.keyDown(input, { key: "Enter" })
		expect(onResultSelect).toHaveBeenCalledWith(results[0])
	})

	it("does not select hidden results during loading or below the query threshold", () => {
		const onResultSelect = vi.fn()
		const { rerender } = render(panel({ loading: true, onResultSelect }))
		const input = screen.getByRole("textbox")
		fireEvent.keyDown(input, { key: "ArrowDown" })
		fireEvent.keyDown(input, { key: "Enter" })
		expect(screen.queryByRole("button", { name: "Alice" })).not.toBeInTheDocument()
		expect(screen.getByText("Searching…")).toBeInTheDocument()
		rerender(panel({ query: "a", onResultSelect }))
		fireEvent.keyDown(input, { key: "Enter" })
		expect(screen.queryByRole("button", { name: "Alice" })).not.toBeInTheDocument()
		expect(onResultSelect).not.toHaveBeenCalled()
	})

	it("does not treat IME confirmation as result selection", () => {
		const onResultSelect = vi.fn()
		render(panel({ onResultSelect }))
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", isComposing: true })
		expect(onResultSelect).not.toHaveBeenCalled()
	})

	it("returns focus to the field after a group shortcut and reports the filtered count", () => {
		render(panel())
		fireEvent.click(screen.getByRole("button", { name: "See all files" }))
		expect(screen.getByRole("textbox")).toHaveFocus()
		expect(screen.getByText("1 result")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Alice" })).not.toBeInTheDocument()
	})

	it("recovers if the active generated group disappears", () => {
		const { rerender } = render(panel())
		fireEvent.click(screen.getByRole("tab", { name: "files 1" }))
		rerender(panel({ results: [results[0]] }))
		expect(screen.getByRole("tab", { name: "All 1" })).toHaveAttribute("aria-selected", "true")
		expect(screen.getByRole("button", { name: "Alice" })).toBeInTheDocument()
	})

	it("shows an empty state for a fixed tab with zero matches", () => {
		render(panel({ tabs: [{ value: "all", label: "All" }, { value: "missing", label: "Other" }] }))
		fireEvent.click(screen.getByRole("tab", { name: "Other 0" }))
		expect(screen.getByText('No results for “an”')).toBeInTheDocument()
	})

	it("uses one highlight for direct keyboard focus and input navigation", () => {
		const onResultSelect = vi.fn()
		render(panel({ onResultSelect }))
		fireEvent.focus(screen.getByRole("button", { name: "Annual report" }))
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" })
		expect(onResultSelect).toHaveBeenCalledWith(results[1])
	})

	it("accepts arbitrary group names without colliding with object properties", () => {
		const { result } = renderHook(() => useGlobalSearch({ query: "an", results: [{ ...results[0], group: "__proto__" }] }))
		expect(result.current.flat).toHaveLength(1)
		expect(result.current.tabCounts.__proto__).toBe(1)
	})

	it("keeps an icon fallback when a thumbnail cannot load", () => {
		const { container } = render(<GlobalSearchResultRow result={{ ...results[0], thumbnail: { src: "/file.jpg" } }} />)
		expect(container.querySelector('[data-slot="avatar-fallback"] svg')).not.toBeNull()
	})

	it("closes the dialog after choosing a result without requiring the consumer to close it", () => {
		const onOpenChange = vi.fn()
		const onResultSelect = vi.fn()
		render(<GlobalSearchDialog open onOpenChange={onOpenChange} query="an" onQueryChange={() => {}} results={results} onResultSelect={onResultSelect} />)
		fireEvent.click(screen.getByRole("button", { name: "Alice" }))
		expect(onResultSelect).toHaveBeenCalledWith(results[0])
		expect(onOpenChange).toHaveBeenCalledWith(false)
	})
})
