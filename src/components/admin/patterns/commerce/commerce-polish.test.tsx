import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { InventoryLevel } from "./account"
import { CartSummary, CodeEntry } from "./cart"
import { InvoiceLineItems } from "./invoice"
import { LoyaltyPoints } from "./loyalty"
import { OrderStatusCard, RefundStatus, ShipmentTracking } from "./order"

describe("commerce display and interaction contracts", () => {
	it("does not advance a shipment beyond the latest reached event", () => {
		const { container, rerender } = render(<ShipmentTracking trackingNumber="UPS-123" status="inTransit" steps={[
			{ label: "Collected", done: true }, { label: "In transit", done: true }, { label: "Out for delivery", done: false },
		]} />)
		expect(container.querySelector('[data-status="current"]')).toHaveTextContent("In transit")
		expect(container.querySelector('[data-status="current"]')).not.toHaveTextContent("Out for delivery")
		rerender(<ShipmentTracking trackingNumber="UPS-123" status="delivered" steps={[{ label: "Delivered", done: true }]} />)
		expect(container.querySelector('[data-status="current"]')).toBeNull()
	})

	it("finds the next event after the latest completed event and hides it for terminal orders", () => {
		const events = [{ id: "1", label: "Optional review", complete: false }, { id: "2", label: "Shipped", complete: true }, { id: "3", label: "Delivered", complete: false }]
		const { container, rerender } = render(<OrderStatusCard orderNumber="#1" status="shipped" events={events} />)
		expect(within(container.querySelector(".summary-panel--component") as HTMLElement).getByText("Delivered")).toBeVisible()
		expect(within(container.querySelector(".summary-panel--component") as HTMLElement).queryByText("Optional review")).not.toBeInTheDocument()
		rerender(<OrderStatusCard orderNumber="#1" status="cancelled" events={events} />)
		expect(screen.queryByText("Next step")).not.toBeInTheDocument()
	})

	it("blocks code submission and removal during a pending request", () => {
		const onApply = vi.fn()
		const onRemove = vi.fn()
		const { rerender } = render(<CodeEntry onApply={onApply} />)
		fireEvent.change(screen.getByRole("textbox"), { target: { value: " WELCOME10 " } })
		rerender(<CodeEntry onApply={onApply} loading />)
		expect(screen.getByRole("textbox")).toBeDisabled()
		fireEvent.submit(screen.getByRole("textbox").closest("form")!)
		expect(onApply).not.toHaveBeenCalled()
		rerender(<CodeEntry onApply={onApply} />)
		fireEvent.submit(screen.getByRole("textbox").closest("form")!)
		expect(onApply).toHaveBeenCalledWith("WELCOME10")
		rerender(<CodeEntry appliedCode="WELCOME10" onRemove={onRemove} loading />)
		fireEvent.click(screen.getByRole("button", { name: "Remove" }))
		expect(onRemove).not.toHaveBeenCalled()
	})

	it("replaces a failed cart image with initials and retries a new source", () => {
		const line = { id: "1", title: "Merino sweater", quantity: 1, price: "€89", imageSrc: "/missing.jpg" }
		const { rerender } = render(<CartSummary items={[line]} total="€89" />)
		fireEvent.error(screen.getByRole("img"))
		expect(screen.queryByRole("img")).not.toBeInTheDocument()
		expect(screen.getByText("MS")).toBeInTheDocument()
		rerender(<CartSummary items={[{ ...line, imageSrc: "/replacement.jpg" }]} total="€89" />)
		expect(screen.getByRole("img")).toHaveAttribute("src", "/replacement.jpg")
	})

	it("shows stock quantities visually as well as naming the gauge", () => {
		render(<InventoryLevel productName="Merino" stock={0} maxStock={120} reorderLevel={10} />)
		expect(screen.getByText("0 of 120 units")).toBeVisible()
		expect(screen.getByRole("progressbar", { name: "0 of 120 units" })).toHaveAttribute("aria-valuenow", "0")
		expect(screen.getByText("Out of stock")).toBeVisible()
	})

	it("normalizes supplied movement signs to their actual direction", () => {
		render(<LoyaltyPoints balance={0} movements={[
			{ id: "1", label: "Earn", date: "Today", points: "−30", earned: true },
			{ id: "2", label: "Spend", date: "Today", points: "+20", earned: false },
		]} />)
		expect(screen.getByText("+30")).toBeVisible()
		expect(screen.getByText("−20")).toBeVisible()
	})

	it("keeps calculated invoice amounts in both table and compact presentations", () => {
		const { container } = render(<InvoiceLineItems currency="EUR" taxRate={0.2} lines={[
			{ id: "1", description: "Implementation", quantity: 12, unitPrice: 45 },
		]} />)
		expect(within(screen.getByRole("table")).getAllByText("€540.00")[0]).toBeVisible()
		expect(within(screen.getByRole("list")).getByText("€540.00")).toBeVisible()
		expect(container.textContent?.match(/€648.00/g)).toHaveLength(2)
	})

	it("announces the current refund step independently of its color", () => {
		render(<RefundStatus stage="processing" amount="€20" />)
		expect(screen.getByText("Processing").closest("li")).toHaveAttribute("aria-current", "step")
		expect(screen.getByText("Completed").closest("li")).not.toHaveAttribute("aria-current")
	})
})
