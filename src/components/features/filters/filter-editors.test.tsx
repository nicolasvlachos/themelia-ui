import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { FilterProvider } from "./filter-context"
import { AsyncFilterEditor, SelectFilterEditor } from "./filter-editors"
import { FilterType, defineAsyncSelectConfig, type FilterConfig, type FilterErrorHandler } from "./filters.types"

/*
 * The select and async editors' behaviour: stage, apply, pick-and-close, search, retry.
 * cmdk needs ResizeObserver and scrollIntoView, which jsdom lacks.
 */
beforeAll(() => {
	if (!("ResizeObserver" in globalThis)) {
		Object.assign(globalThis, {
			ResizeObserver: class {
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		})
	}
	if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}
})

function inProvider(editor: ReactNode, onError?: FilterErrorHandler) {
	return render(
		<FilterProvider filters={[]} activeFilters={[]} onFilterChange={vi.fn()} onError={onError}>
			{editor}
		</FilterProvider>,
	)
}

const STATUS: FilterConfig = {
	key: "status",
	label: "Status",
	pluralLabel: "statuses",
	type: FilterType.MULTI_SELECT,
	options: [
		{ value: "confirmed", label: "Confirmed" },
		{ value: "pending", label: "Pending" },
		{ value: "cancelled", label: "Cancelled" },
	],
}

const handlers = () => ({ onValueChange: vi.fn(), onBack: vi.fn(), onClose: vi.fn() })

describe("SelectFilterEditor", () => {
	it("stages a multi-select and commits it once, on Apply", () => {
		const props = handlers()
		inProvider(<SelectFilterEditor filter={STATUS} value={[]} {...props} />)

		fireEvent.click(screen.getByRole("option", { name: "Confirmed" }))
		fireEvent.click(screen.getByRole("option", { name: "Pending" }))
		expect(props.onValueChange).not.toHaveBeenCalled()
		expect(screen.getByRole("option", { name: "Confirmed" })).toHaveAttribute("data-checked")
		expect(screen.getByText("2 statuses selected")).toBeInTheDocument()

		fireEvent.click(screen.getByRole("button", { name: "Apply" }))
		expect(props.onValueChange).toHaveBeenCalledExactlyOnceWith(["confirmed", "pending"])
		expect(props.onClose).toHaveBeenCalledOnce()
	})

	it("withdraws Apply once the staged value is the applied one again", () => {
		inProvider(<SelectFilterEditor filter={STATUS} value={["confirmed"]} {...handlers()} />)
		expect(screen.getByRole("option", { name: "Confirmed" })).toHaveAttribute("data-checked")
		expect(screen.queryByRole("button", { name: "Apply" })).not.toBeInTheDocument()

		fireEvent.click(screen.getByRole("option", { name: "Pending" }))
		expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument()
		fireEvent.click(screen.getByRole("option", { name: "Pending" }))
		expect(screen.queryByRole("button", { name: "Apply" })).not.toBeInTheDocument()
	})

	it("replaces rather than toggles a single pick, and commits it at once with closeOnSelect", () => {
		const staged = handlers()
		const single = { ...STATUS, type: FilterType.SELECT }
		const { unmount } = inProvider(<SelectFilterEditor filter={single} value={[]} {...staged} />)
		fireEvent.click(screen.getByRole("option", { name: "Confirmed" }))
		fireEvent.click(screen.getByRole("option", { name: "Pending" }))
		fireEvent.click(screen.getByRole("button", { name: "Apply" }))
		expect(staged.onValueChange).toHaveBeenCalledExactlyOnceWith(["pending"])
		unmount()

		const immediate = handlers()
		inProvider(<SelectFilterEditor filter={{ ...single, closeOnSelect: true }} value={[]} {...immediate} />)
		fireEvent.click(screen.getByRole("option", { name: "Cancelled" }))
		expect(immediate.onValueChange).toHaveBeenCalledExactlyOnceWith(["cancelled"])
		expect(immediate.onClose).toHaveBeenCalledOnce()
	})

	it("offers search only past five options, and matches it on the label", async () => {
		const user = userEvent.setup()
		const { unmount } = inProvider(<SelectFilterEditor filter={STATUS} value={[]} {...handlers()} />)
		expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
		unmount()

		const long = {
			...STATUS,
			options: [
				...STATUS.options!,
				{ value: "draft", label: "Draft" },
				{ value: "archived", label: "Archived" },
				{ value: "refunded", label: "Refunded" },
			],
		}
		inProvider(<SelectFilterEditor filter={long} value={[]} {...handlers()} />)
		expect(screen.getByRole("combobox")).toHaveAttribute("placeholder", "Search status…")
		await user.type(screen.getByRole("combobox"), "Conf")
		expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Confirmed"])
	})
})

describe("Filter editor commits", () => {
	/* Every commit path must report a throwing `onValueChange` to `onError`. */
	it("reports a throwing onValueChange from a close-on-select pick, and stays open", () => {
		const fail = () => {
			throw new Error("rejected")
		}
		const onError = vi.fn()
		const onClose = vi.fn()
		const closing = { ...STATUS, type: FilterType.SELECT, closeOnSelect: true }
		inProvider(
			<SelectFilterEditor filter={closing} value={[]} onValueChange={fail} onBack={vi.fn()} onClose={onClose} />,
			onError,
		)
		fireEvent.click(screen.getByRole("option", { name: "Pending" }))

		expect(onError).toHaveBeenCalledWith(expect.any(Error), { phase: "apply", filterKey: "status" })
		expect(onClose).not.toHaveBeenCalled()
	})
})

describe("AsyncFilterEditor", () => {
	const VENUES = [
		{ id: "v-1", name: "Marlow Hall" },
		{ id: "v-2", name: "The Old Granary" },
		{ id: "v-3", name: "Riverside Rooms" },
	]

	/* Built once per test: `asyncConfig` is an effect dependency of the fetch. */
	function venueFilter(fetcher: (query: string) => Promise<typeof VENUES>, extra: Partial<FilterConfig> = {}): FilterConfig {
		return {
			key: "venue",
			label: "Venue",
			pluralLabel: "venues",
			type: FilterType.ASYNC_SELECT,
			multiple: true,
			asyncConfig: defineAsyncSelectConfig({
				fetcher: ({ query }) => fetcher(query),
				mapToOption: (venue) => ({ value: venue.id, label: venue.name }),
				debounceMs: 0,
			}),
			...extra,
		}
	}

	it("shows it is searching, then stages and applies what came back", async () => {
		const props = handlers()
		const filter = venueFilter(async () => VENUES)
		inProvider(<AsyncFilterEditor filter={filter} value={[]} {...props} />)

		expect(screen.getByText("Searching…")).toBeInTheDocument()
		fireEvent.click(await screen.findByRole("option", { name: "Marlow Hall" }))
		fireEvent.click(screen.getByRole("option", { name: "Riverside Rooms" }))
		fireEvent.click(screen.getByRole("button", { name: "Apply" }))

		expect(props.onValueChange).toHaveBeenCalledExactlyOnceWith(["v-1", "v-3"])
		expect(props.onClose).toHaveBeenCalledOnce()
	})

	it("offers a retry that fetches again after a failure", async () => {
		const fetcher = vi.fn()
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValue(VENUES)
		inProvider(<AsyncFilterEditor filter={venueFilter(fetcher)} value={[]} {...handlers()} />, vi.fn())

		expect(await screen.findByRole("alert")).toHaveTextContent("Could not load options.")
		expect(screen.queryByText("No options found.")).not.toBeInTheDocument()

		fireEvent.click(screen.getByRole("button", { name: "Try again" }))
		expect(await screen.findByRole("option", { name: "The Old Granary" })).toBeInTheDocument()
		expect(fetcher).toHaveBeenCalledTimes(2)
	})

	it("holds a query shorter than the minimum back from the server", async () => {
		const user = userEvent.setup()
		const fetcher = vi.fn(async () => VENUES)
		const filter = venueFilter(fetcher)
		filter.asyncConfig!.minQueryLength = 3
		inProvider(<AsyncFilterEditor filter={filter} value={[]} {...handlers()} />)

		await user.type(screen.getByRole("combobox"), "ma")
		expect(screen.getByRole("status")).toHaveTextContent("Type at least 3 characters…")
		expect(screen.queryByRole("option")).not.toBeInTheDocument()
		await new Promise((resolve) => setTimeout(resolve, 20))
		expect(fetcher).not.toHaveBeenCalledWith("ma")

		await user.type(screen.getByRole("combobox"), "r")
		expect(await screen.findByRole("option", { name: "Marlow Hall" })).toBeInTheDocument()
		expect(fetcher).toHaveBeenLastCalledWith("mar")
	})

	it("commits a single pick at once with closeOnSelect", async () => {
		const props = handlers()
		const filter = venueFilter(async () => VENUES, { multiple: false, closeOnSelect: true })
		inProvider(<AsyncFilterEditor filter={filter} value={[]} {...props} />)

		fireEvent.click(await screen.findByRole("option", { name: "The Old Granary" }))
		await waitFor(() => expect(props.onValueChange).toHaveBeenCalledExactlyOnceWith(["v-2"]))
		expect(props.onClose).toHaveBeenCalledOnce()
	})
})
