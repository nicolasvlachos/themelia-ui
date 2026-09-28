import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { LegacyColumnDef } from "@tanstack/react-table/legacy"
import { afterEach, describe, expect, it, vi } from "vitest"

import { clearAsyncPreviewCache } from "@/components/features/async-preview"

import { DataTable } from "./data-table"
import type { DataTableExpandedRow } from "./table.types"

interface Booking {
	id: string
	venue: string
	status: "open" | "cancelled"
}

const BOOKINGS: Booking[] = [
	{ id: "b1", venue: "Marlow Hall", status: "open" },
	{ id: "b2", venue: "The Old Granary", status: "open" },
	{ id: "b3", venue: "Riverside Rooms", status: "cancelled" },
]

const COLUMNS: LegacyColumnDef<Booking, unknown>[] = [
	{ id: "venue", accessorKey: "venue", header: "Venue" },
	{ id: "status", accessorKey: "status", header: "Status" },
]

function renderTable<TDetail>(expandedRow?: DataTableExpandedRow<Booking, TDetail>, data = BOOKINGS) {
	return render(<DataTable columns={COLUMNS} data={data} getRowId={(row) => row.id} expandedRow={expandedRow} />)
}

const showToggle = (row: number) => screen.getByRole("button", { name: `Show details for row ${row}` })
const hideToggle = (row: number) => screen.getByRole("button", { name: `Hide details for row ${row}` })

/** A promise the test settles by hand, so each loading state can be looked at. */
function deferred<T>() {
	let resolve!: (value: T) => void
	let reject!: (error: unknown) => void
	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})
	return { promise, resolve, reject }
}

afterEach(() => clearAsyncPreviewCache())

describe("expandable rows", () => {
	it("adds nothing without expandedRow", () => {
		renderTable()
		expect(screen.queryByRole("button", { name: /details for row/ })).not.toBeInTheDocument()
		expect(screen.queryByText("Details")).not.toBeInTheDocument()
	})

	it("opens a panel under its row that spans the visible columns", () => {
		renderTable({ render: (booking) => <p>Panel for {booking.venue}</p> })

		const toggle = showToggle(1)
		expect(toggle).toHaveAttribute("aria-expanded", "false")
		fireEvent.click(toggle)

		expect(hideToggle(1)).toHaveAttribute("aria-expanded", "true")
		const panelId = hideToggle(1).getAttribute("aria-controls")
		const panel = document.getElementById(panelId ?? "")
		expect(panel).toHaveTextContent("Panel for Marlow Hall")
		expect(panel?.querySelector("td")?.colSpan).toBe(screen.getAllByRole("columnheader").length)
		// The toggle column is named for a screen reader, not left blank.
		expect(screen.getByRole("columnheader", { name: "Details" })).toBeInTheDocument()
	})

	it("gives a row canExpand refuses no toggle, even when expanded names it", () => {
		const renderPanel = vi.fn((booking: Booking) => <p>Panel for {booking.venue}</p>)
		renderTable({
			render: renderPanel,
			canExpand: (booking) => booking.status !== "cancelled",
			expanded: { b3: true },
		})

		expect(screen.queryByRole("button", { name: /details for row 3/ })).not.toBeInTheDocument()
		expect(screen.queryByText("Panel for Riverside Rooms")).not.toBeInTheDocument()
		expect(renderPanel).not.toHaveBeenCalled()
	})

	it("keeps one row open with multiple: false", () => {
		renderTable({ render: (booking) => <p>Panel for {booking.venue}</p>, multiple: false })

		fireEvent.click(showToggle(1))
		fireEvent.click(showToggle(2))

		expect(showToggle(1)).toHaveAttribute("aria-expanded", "false")
		expect(hideToggle(2)).toHaveAttribute("aria-expanded", "true")
	})

	it("reports the open rows, and a controlled table renders only what it is given", () => {
		const onExpandedChange = vi.fn()
		renderTable({ render: () => <p>Panel</p>, expanded: {}, onExpandedChange })

		fireEvent.click(showToggle(2))

		expect(onExpandedChange).toHaveBeenCalledWith({ b2: true })
		expect(showToggle(2)).toHaveAttribute("aria-expanded", "false")
	})

	it("returns focus to the toggle when a panel closes around it", () => {
		renderTable({
			render: (_booking, { collapse }) => (
				<button type="button" onClick={collapse}>
					Done
				</button>
			),
		})

		fireEvent.click(showToggle(1))
		const done = screen.getByRole("button", { name: "Done" })
		done.focus()
		fireEvent.click(done)

		expect(showToggle(1)).toHaveFocus()
	})

	it("keeps a panel that throws inside its row", () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
		renderTable({
			render: (booking) => {
				if (booking.id === "b1") throw new Error("broken panel")
				return <p>Panel for {booking.venue}</p>
			},
		})

		fireEvent.click(showToggle(1))
		expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load the details.")
		expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()

		// The rest of the table still works.
		fireEvent.click(showToggle(2))
		expect(screen.getByText("Panel for The Old Granary")).toBeInTheDocument()
		consoleError.mockRestore()
	})
})

describe("expandable rows with onLoad", () => {
	it("shows loading, then renders what the loader returned", async () => {
		const pending = deferred<{ guests: number }>()
		const onLoad = vi.fn(() => pending.promise)
		renderTable({ onLoad, render: (_booking, { detail }) => <p>{detail.guests} guests</p> })

		fireEvent.click(showToggle(1))
		expect(await screen.findByRole("status")).toHaveTextContent("Loading details")
		expect(onLoad).toHaveBeenCalledWith(BOOKINGS[0], { signal: expect.any(AbortSignal) })

		await act(async () => pending.resolve({ guests: 120 }))
		expect(await screen.findByText("120 guests")).toBeInTheDocument()
	})

	it("aborts the request when the row closes", async () => {
		let signal: AbortSignal | undefined
		const onLoad = vi.fn((_booking: Booking, args: { signal: AbortSignal }) => {
			signal = args.signal
			return new Promise<{ guests: number }>(() => {})
		})
		renderTable({ onLoad, render: () => <p>Panel</p> })

		fireEvent.click(showToggle(1))
		await waitFor(() => expect(signal).toBeDefined())
		fireEvent.click(hideToggle(1))

		expect(signal?.aborted).toBe(true)
	})

	it("offers Retry when the load fails, and recovers", async () => {
		const onLoad = vi
			.fn<(booking: Booking, args: { signal: AbortSignal }) => Promise<{ guests: number }>>()
			.mockRejectedValueOnce(new Error("timed out"))
			.mockResolvedValueOnce({ guests: 45 })
		renderTable({ onLoad, render: (_booking, { detail }) => <p>{detail.guests} guests</p> })

		fireEvent.click(showToggle(1))
		expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load the details.")

		fireEvent.click(screen.getByRole("button", { name: "Retry" }))
		expect(await screen.findByText("45 guests")).toBeInTheDocument()
		expect(onLoad).toHaveBeenCalledTimes(2)
	})

	it("serves a reopened row from the cache", async () => {
		const onLoad = vi.fn(async () => ({ guests: 120 }))
		renderTable({ onLoad, render: (_booking, { detail }) => <p>{detail.guests} guests</p> })

		fireEvent.click(showToggle(1))
		expect(await screen.findByText("120 guests")).toBeInTheDocument()
		fireEvent.click(hideToggle(1))
		fireEvent.click(showToggle(1))

		expect(await screen.findByText("120 guests")).toBeInTheDocument()
		expect(onLoad).toHaveBeenCalledTimes(1)
	})

	it("says so when a row has no details", async () => {
		renderTable({ onLoad: async () => null, render: () => <p>Panel</p> })

		fireEvent.click(showToggle(1))
		expect(await screen.findByText("No details.")).toBeInTheDocument()
		expect(screen.queryByText("Panel")).not.toBeInTheDocument()
	})
})
