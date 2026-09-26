import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ActivityFeed } from "./activities-feed"
import { ActivityChanges } from "./activity-parts"

const activity = {
	id: "event", event: "updated", headline: "Updated booking",
	metadata: [{ label: "Venue", value: "Main hall" }],
	changes: [{ key: "status", label: "Status", old: "Draft", new: "Confirmed" }],
	resources: [{ key: "booking:1", label: "Booking 1" }],
}

describe("activity detail structure", () => {
	it("opens distinct detail groups with translated captions and keeps controls outside them", () => {
		const onRowClick = vi.fn()
		render(<ActivityFeed activities={[activity]} density="rich" onActivityClick={onRowClick}
			strings={{ changesTitle: "Modifications", metadataTitle: "Contexte", resourcesTitle: "Documents" }} />)
		fireEvent.click(screen.getByRole("button", { name: "Show details" }))
		expect(onRowClick).not.toHaveBeenCalled()
		expect(within(screen.getByRole("group", { name: "Modifications" })).getByText("Draft")).toBeVisible()
		expect(within(screen.getByRole("group", { name: "Contexte" })).getByText("Main hall")).toBeVisible()
		expect(within(screen.getByRole("group", { name: "Documents" })).getByText("Booking 1")).toBeVisible()
		const hide = screen.getByRole("button", { name: "Hide details" })
		expect(hide).toHaveAttribute("aria-expanded", "true")
		fireEvent.click(hide)
		expect(screen.queryByRole("group", { name: "Contexte" })).not.toBeInTheDocument()
	})
	it("does not render empty detail sections", () => {
		render(<ActivityFeed activities={[{ id: "one", event: "created", headline: "Created booking", details: "Only a note" }]} density="rich" />)
		expect(screen.getByText("Only a note")).toBeVisible()
		expect(screen.queryByRole("group", { name: "Changes" })).not.toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Show details" })).not.toBeInTheDocument()
	})
	it("pairs each field with before/after values and retains zero values", () => {
		const { container } = render(<ActivityChanges changes={[
			{ key: "count", label: "Count", old: 0, new: 2 },
			{ key: "note", label: "Note", description: "Recalculated" },
		]} />)
		expect(container.querySelectorAll("dt")).toHaveLength(2)
		expect(container.querySelectorAll("dd")).toHaveLength(2)
		expect(container.querySelector("dd")).toHaveTextContent("0→2")
		expect(container.querySelectorAll("dd")[1]).toHaveTextContent("Recalculated")
	})
})
