import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { OverflowTabBar } from "./overflow-tab-bar"

const items = [
	{ id: "overview", label: "Overview" },
	{ id: "billing", label: "Billing", disabled: true },
	{ id: "members", label: "Members" },
	{ id: "audit", label: "Audit log" },
]

describe("OverflowTabBar", () => {
	it("is one tab stop, on the current tab", () => {
		render(<OverflowTabBar items={items} value="members" />)
		const stops = screen.getAllByRole("tab").filter((tab) => tab.tabIndex === 0)
		expect(stops).toHaveLength(1)
		expect(stops[0]).toHaveAccessibleName("Members")
	})

	it("moves with the arrow keys, skipping disabled tabs, selecting as it goes", () => {
		const changes: string[] = []
		render(<OverflowTabBar items={items} value="overview" onValueChange={(id) => changes.push(id)} />)
		const overview = screen.getByRole("tab", { name: "Overview" })
		overview.focus()

		fireEvent.keyDown(overview, { key: "ArrowRight" })
		expect(screen.getByRole("tab", { name: "Members" })).toHaveFocus()

		fireEvent.keyDown(document.activeElement!, { key: "End" })
		expect(screen.getByRole("tab", { name: "Audit log" })).toHaveFocus()
		expect(changes).toEqual(["members", "audit"])
	})

	it("renders a set of routes as navigation, not as tabs", () => {
		const changes: string[] = []
		render(
			<OverflowTabBar
				items={[
					{ id: "overview", label: "Overview", href: "/invoices/1" },
					{ id: "history", label: "History", href: "/invoices/1/history" },
				]}
				value="history"
				onValueChange={(id) => changes.push(id)}
			/>,
		)
		expect(screen.queryByRole("tab")).toBeNull()
		expect(screen.getByRole("navigation")).toBeInTheDocument()
		const current = screen.getByRole("link", { name: "History" })
		expect(current).toHaveAttribute("aria-current", "page")
		expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current")
		fireEvent.click(screen.getByRole("link", { name: "Overview" }))
		expect(changes).toEqual(["overview"])
	})

	it("keeps one tab stop when nothing is selected", () => {
		render(<OverflowTabBar items={items} value={undefined} />)
		const stops = screen.getAllByRole("tab").filter((tab) => tab.tabIndex === 0)
		expect(stops).toHaveLength(1)
		expect(stops[0]).toHaveAccessibleName("Overview")
	})
})
