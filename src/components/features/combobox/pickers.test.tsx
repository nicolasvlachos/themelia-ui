import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AsyncCombobox, AsyncMultiCombobox } from "./async-combobox"
import * as comboboxEntry from "./index"
import { HighlightedText } from "./highlighted-text"
import { ResourceCombobox } from "./resource-combobox"
import { SuggestionsCombobox } from "./suggestions-combobox"

/** The pickers are presets over one engine; these pin each preset's behaviour. */
const COUNTRIES = ["Greece", "Germany", "Ghana"]
const search = async (query: string) => COUNTRIES.filter((name) => name.toLowerCase().includes(query.toLowerCase()))
const tick = () => new Promise((resolve) => setTimeout(resolve, 30))

describe("the self-fetching engine", () => {
	it("shows a preloaded list on open (ResourceCombobox)", async () => {
		render(<ResourceCombobox open debounceMs={0} fetcher={({ query }) => search(query)} getKey={String} getLabel={String} />)
		expect(await screen.findByRole("option", { name: "Greece" })).toBeInTheDocument()
	})

	it("shows a preloaded list on open (SuggestionsCombobox) — its status row used to hide it", async () => {
		render(<SuggestionsCombobox open preload debounceMs={0} fetchData={search} itemKey={String} itemText={String} />)
		expect(await screen.findByRole("option", { name: "Ghana" })).toBeInTheDocument()
	})

	it("asks for input on an empty field that does not preload, instead of claiming no results", async () => {
		render(<ResourceCombobox open preload={false} debounceMs={0} fetcher={({ query }) => search(query)} getKey={String} getLabel={String} />)
		expect(await screen.findByText("Type to search…")).toBeInTheDocument()
		expect(screen.queryByText("No results found.")).toBeNull()
	})

	it("reads as searching, not empty, while the typed query waits out the debounce", () => {
		render(<ResourceCombobox open preload={false} debounceMs={60_000} defaultSearchValue="gre" fetcher={({ query }) => search(query)} getKey={String} getLabel={String} />)
		expect(screen.getAllByText(/^Searching…/).length).toBeGreaterThan(0)
		expect(screen.queryByText("No results found.")).toBeNull()
	})

	it("does not fetch while disabled — SuggestionsCombobox used to", async () => {
		const fetchData = vi.fn(search)
		const fetcher = vi.fn(({ query }: { query: string }) => search(query))
		render(
			<>
				<SuggestionsCombobox disabled preload defaultQuery="gre" debounceMs={0} fetchData={fetchData} itemKey={String} itemText={String} />
				<ResourceCombobox disabled debounceMs={0} fetcher={fetcher} getKey={String} getLabel={String} />
			</>,
		)
		await tick()
		expect(fetchData).not.toHaveBeenCalled()
		expect(fetcher).not.toHaveBeenCalled()
	})

	it("hands both presets' fetchers the trimmed query", async () => {
		const fetchData = vi.fn(search)
		const fetcher = vi.fn(({ query }: { query: string; limit: number }) => search(query))
		render(
			<>
				<SuggestionsCombobox defaultQuery="  gre " debounceMs={0} fetchData={fetchData} itemKey={String} itemText={String} />
				<ResourceCombobox preload={false} defaultSearchValue=" gh " debounceMs={0} limit={5} fetcher={fetcher} getKey={String} getLabel={String} />
			</>,
		)
		await waitFor(() => expect(fetchData).toHaveBeenCalledWith("gre", expect.anything()))
		await waitFor(() => expect(fetcher).toHaveBeenCalledWith(expect.objectContaining({ query: "gh", limit: 5 })))
	})

	it("puts the error under the field, and hides it as soon as the query moves on", async () => {
		const fetcher = vi.fn(async () => {
			throw new Error("down")
		})
		const props = { open: true, preload: false, debounceMs: 0, fetcher, getKey: String, getLabel: String, onSearchValueChange: vi.fn() }
		const { rerender } = render(<ResourceCombobox {...props} searchValue="gre" />)
		expect(await screen.findByText("Could not load results")).toBeInTheDocument()
		expect(screen.queryByRole("option")).toBeNull()

		rerender(<ResourceCombobox {...props} searchValue="gree" />)
		expect(screen.queryByText("Could not load results")).toBeNull()
	})

	it("keeps a failed query on close even when asked to clear, so the retry has it", async () => {
		const onSearchValueChange = vi.fn()
		render(
			<ResourceCombobox
				defaultOpen
				clearSearchOnClose
				preload={false}
				debounceMs={0}
				defaultSearchValue="gre"
				onSearchValueChange={onSearchValueChange}
				fetcher={async () => {
					throw new Error("down")
				}}
				getKey={String}
				getLabel={String}
			/>,
		)
		await screen.findByText("Could not load results")
		fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" })
		expect(onSearchValueChange).not.toHaveBeenCalledWith("")
	})

	it("does clear a query that succeeded — the control for the test above", async () => {
		const onSearchValueChange = vi.fn()
		render(
			<ResourceCombobox
				defaultOpen
				clearSearchOnClose
				preload={false}
				debounceMs={0}
				defaultSearchValue="gre"
				onSearchValueChange={onSearchValueChange}
				fetcher={({ query }) => search(query)}
				getKey={String}
				getLabel={String}
			/>,
		)
		await screen.findByRole("option", { name: "Greece" })
		fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" })
		expect(onSearchValueChange).toHaveBeenCalledWith("")
	})

	it("keeps each preset's public root hook and slot", () => {
		const { container } = render(
			<>
				<ResourceCombobox preload={false} fetcher={async () => []} getKey={String} getLabel={String} />
				<SuggestionsCombobox fetchData={search} itemKey={String} itemText={String} />
			</>,
		)
		expect(container.querySelector(".resource-combobox--component[data-slot='resource-combobox']")).not.toBeNull()
		expect(container.querySelector(".suggestions-combobox--component[data-slot='suggestions']")).not.toBeNull()
	})

	it("counts the characters still missing, unless a caller translated the old single message", async () => {
		const props = { open: true, minQueryLength: 3, defaultQuery: "g", fetchData: search, itemKey: String, itemText: String }
		const { unmount } = render(<SuggestionsCombobox {...props} />)
		expect(await screen.findByText("Type 2 more characters to search…")).toBeInTheDocument()
		unmount()

		render(<SuggestionsCombobox {...props} strings={{ startTypingMessage: "Tippen, um zu suchen." }} />)
		expect(await screen.findByText("Tippen, um zu suchen.")).toBeInTheDocument()
	})

	it("publishes the values the retired features/suggestions path carried, so the codemod's rewrite resolves", () => {
		expect(comboboxEntry.SuggestionsCombobox).toBe(SuggestionsCombobox)
		expect(comboboxEntry.useSuggestions).toBeTypeOf("function")
		expect(comboboxEntry.defaultSuggestionsStrings).toBeTypeOf("object")
	})
})

describe("the controlled pickers", () => {
	it("names each chip's remove control after the chip", () => {
		render(
			<AsyncMultiCombobox
				items={[]}
				selectedValues={["Greece", "Ghana"]}
				onSelectedValuesChange={vi.fn()}
				searchValue=""
				onSearchValueChange={vi.fn()}
				getItemLabel={String}
				strings={{ removeChip: (label) => `${label} entfernen` }}
			/>,
		)
		expect(screen.getByRole("button", { name: "Greece entfernen" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Ghana entfernen" })).toBeInTheDocument()
	})

	it("routes its clear and chevron names through strings — they used to be unreachable", () => {
		render(
			<AsyncCombobox
				items={[]}
				selectedValue="Greece"
				onSelectedValueChange={vi.fn()}
				searchValue=""
				onSearchValueChange={vi.fn()}
				getItemLabel={String}
				strings={{ clear: "Auswahl löschen", toggle: "Optionen zeigen" }}
			/>,
		)
		expect(screen.getByRole("button", { name: "Auswahl löschen" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Optionen zeigen" })).toBeInTheDocument()
	})

	it("offers no create row while nothing is typed, even with no minimum", () => {
		render(
			<AsyncCombobox
				open
				creatable
				onCreate={vi.fn()}
				minSearchLength={0}
				items={[]}
				selectedValue={null}
				onSelectedValueChange={vi.fn()}
				searchValue=""
				onSearchValueChange={vi.fn()}
				getItemLabel={String}
			/>,
		)
		expect(screen.queryByRole("option", { name: /Create/ })).toBeNull()
	})
})

describe("HighlightedText", () => {
	it("marks a match at the start of a label without a duplicate key", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {})
		const { container } = render(<HighlightedText text="Georgia" highlight="ge" />)
		expect(container.querySelector("mark")?.textContent).toBe("Ge")
		expect(container.textContent).toBe("Georgia")
		expect(error).not.toHaveBeenCalled()
		error.mockRestore()
	})
})
