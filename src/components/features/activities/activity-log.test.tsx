import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Input } from "@/components/base/text-inputs"
import { ActivityLog } from "./activity-log"
import { ActivityFeed } from "./activities-feed"
import type { ActivityLogEntry } from "./activities.types"

describe("ActivityLog", () => {
	it.each(["top", "bottom"] as const)("shows its %s composer before the first activity exists", (position) => {
		render(<ActivityLog entries={[]} composer={{
			enabled: true,
			position,
			context: { id: "empty-record", type: "record" },
			placeholder: "Write the first comment",
		}} activityStrings={{ empty: "No history" }} />)

		expect(screen.queryByRole("textbox", { name: "Write the first comment" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Post comment" })).toBeInTheDocument()
		expect(screen.getByText("No history")).toBeInTheDocument()
	})

	it("keeps missing or invalid timestamps at the end in ascending order", () => {
		const entries: ActivityLogEntry[] = [
			{ id: "missing", kind: "audit", timestamp: "", headline: "Missing" },
			{ id: "later", kind: "audit", timestamp: "2026-02-02T00:00:00Z", headline: "Later" },
			{ id: "invalid", kind: "audit", timestamp: "not-a-date", headline: "Invalid" },
			{ id: "earlier", kind: "audit", timestamp: "2026-01-01T00:00:00Z", headline: "Earlier" },
		]

		render(
			<ActivityLog
				bare
				order="asc"
				entries={entries}
				renderers={{ audit: (entry) => <span>{entry.id}</span> }}
			/>,
		)

		expect(screen.getAllByText(/^(earlier|later|missing|invalid)$/).map((node) => node.textContent))
			.toEqual(["earlier", "later", "missing", "invalid"])
	})
})

describe("ActivityFeed state slots", () => {
	it("keeps loaded details mounted while refreshing and offers recovery after failure", () => {
		const activities = [{ id: "one", event: "created", headline: "Created record", details: <Input aria-label="Detail draft" />, defaultExpanded: true }]
		const onRetry = vi.fn()
		const { rerender } = render(<ActivityFeed activities={activities} density="rich" />)
		fireEvent.change(screen.getByRole("textbox", { name: "Detail draft" }), { target: { value: "Keep detail" } })
		rerender(<ActivityFeed activities={activities} density="rich" loading />)
		expect(screen.getByText("Created record")).toBeInTheDocument()
		expect(screen.getByRole("textbox", { name: "Detail draft" })).toHaveValue("Keep detail")
		expect(screen.getByRole("status")).toHaveTextContent("Updating activity")
		rerender(<ActivityFeed activities={activities} density="rich" error="Connection lost" onRetry={onRetry} />)
		expect(screen.getByRole("alert")).toHaveTextContent("Connection lost")
		expect(screen.getByRole("textbox", { name: "Detail draft" })).toHaveValue("Keep detail")
		fireEvent.click(screen.getByRole("button", { name: "Try again" }))
		expect(onRetry).toHaveBeenCalledOnce()
	})

	it("distinguishes initial loading and failure from an empty mixed log without losing its draft", () => {
		const composer = { enabled: true, context: { id: "record", type: "record" }, placeholder: "Draft note" }
		const onRetry = vi.fn()
		const { rerender } = render(<ActivityLog entries={[]} composer={composer} />)
		fireEvent.input(screen.getByRole("textbox", { name: "Draft note" }), { target: { textContent: "Keep note" } })
		const editor = screen.getByRole("textbox", { name: "Draft note" })
		rerender(<ActivityLog entries={[]} composer={composer} loading />)
		expect(screen.getByRole("status")).toHaveTextContent("Loading activity")
		expect(screen.queryByText("No activity yet.")).not.toBeInTheDocument()
		expect(screen.getByRole("textbox", { name: "Draft note" })).toBe(editor)
		rerender(<ActivityLog entries={[]} composer={composer} error="Could not fetch history" onRetry={onRetry} />)
		expect(screen.getByRole("alert")).toHaveTextContent("Could not fetch history")
		expect(screen.queryByText("No activity yet.")).not.toBeInTheDocument()
		expect(screen.getByRole("textbox", { name: "Draft note" })).toBe(editor)
		fireEvent.click(screen.getByRole("button", { name: "Try again" }))
		expect(onRetry).toHaveBeenCalledOnce()
	})

	it.each([false, true])("keeps header and footer around the state content when loading=%s", (loading) => {
		const { container } = render(<ActivityFeed activities={[]} loading={loading} slots={{
			header: <button>Header action</button>,
			footer: <button>Footer action</button>,
			loading: <span>Custom pending state</span>,
			empty: <span>Custom empty state</span>,
		}} />)

		expect(screen.queryByRole("button", { name: "Header action" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Footer action" })).toBeInTheDocument()
		expect(container.textContent).toBe(`Header actionCustom ${loading ? "pending" : "empty"} stateFooter action`)
	})

	it("retains drafts in header and footer while rows load or become empty", () => {
		const slots = {
			header: <Input aria-label="Header draft" />,
			footer: <Input aria-label="Footer draft" />,
		}
		const { rerender } = render(<ActivityFeed activities={[{ id: "one", event: "created", headline: "Created record" }]} slots={slots} />)
		fireEvent.change(screen.getByRole("textbox", { name: "Header draft" }), { target: { value: "Keep header" } })
		fireEvent.change(screen.getByRole("textbox", { name: "Footer draft" }), { target: { value: "Keep footer" } })

		for (const loading of [true, false]) {
			rerender(<ActivityFeed activities={[]} loading={loading} slots={slots} strings={{ loading: "Loading history", empty: "No history" }} />)
			expect(screen.queryByRole("textbox", { name: "Header draft" })).toHaveValue("Keep header")
			expect(screen.queryByRole("textbox", { name: "Footer draft" })).toHaveValue("Keep footer")
			expect(screen.getByText(loading ? "Loading history" : "No history")).toBeInTheDocument()
		}
	})
})
