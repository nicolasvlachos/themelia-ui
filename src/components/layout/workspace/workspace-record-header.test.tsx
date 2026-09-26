import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { WorkspaceRecordHeader } from "./workspace"

describe("WorkspaceRecordHeader", () => {
	it("is a PageHeading that identifies a record", () => {
		const { container } = render(
			<WorkspaceRecordHeader
				title="Invoice #4417"
				description="Northwind Traders"
				status={<span>Overdue</span>}
				metadata={[{ label: "Owner", value: "Jane McDonald" }]}
				actions={<button type="button">Send</button>}
				secondaryActions={<button type="button">Filter</button>}
			/>,
		)
		const root = container.firstElementChild as HTMLElement
		expect(root).toHaveClass("page-heading--component")
		expect(root).toHaveAttribute("data-slot", "workspace-record-header")
		expect(screen.getByRole("heading", { level: 1, name: "Invoice #4417" })).toBeInTheDocument()
		expect(screen.getByRole("group", { name: /actions/i })).toContainElement(screen.getByRole("button", { name: "Send" }))
		expect(screen.getByText("Owner").closest(".metadata-list--item")).toHaveTextContent("Jane McDonald")
		expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument()
	})
})
