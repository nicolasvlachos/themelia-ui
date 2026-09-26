import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { InventorySection } from "./inventory-section"
import { SeoListing } from "./seo-listing"
import { VendorProfile } from "./vendor-profile"

describe("catalogue interaction contracts", () => {
	it("reports raw stock edits and their previous value without owning a draft", () => {
		const onFieldChange = vi.fn()
		render(<InventorySection value={{ available: "84" }} onFieldChange={onFieldChange} sections={["tracking"]} />)
		const available = screen.getByRole("textbox", { name: "Available" })
		fireEvent.change(available, { target: { value: "0007" } })
		expect(onFieldChange).toHaveBeenCalledWith({ field: "available", value: "0007", previousValue: "84" })
		expect(available).toHaveValue("84")
		expect(available).toHaveAttribute("inputmode", "numeric")
		expect(screen.queryByRole("textbox", { name: "SKU" })).not.toBeInTheDocument()
	})
	it("makes a record without a change handler explicitly read-only", () => {
		render(<InventorySection value={{ sku: "MRN", available: "84" }} />)
		expect(screen.getByRole("textbox", { name: "SKU" })).toHaveAttribute("readonly")
		for (const toggle of screen.getAllByRole("switch")) expect(toggle).toBeDisabled()
		expect(screen.getByRole("combobox", { name: "When out of stock" })).toBeDisabled()
	})
	it("restores caller-owned quantities after tracking is re-enabled", () => {
		const { rerender } = render(<InventorySection value={{ trackQuantity: false, available: "84" }} />)
		expect(screen.queryByRole("textbox", { name: "Available" })).not.toBeInTheDocument()
		rerender(<InventorySection value={{ trackQuantity: true, available: "84" }} />)
		expect(screen.getByRole("textbox", { name: "Available" })).toHaveValue("84")
	})
	it("keeps fallback content, score formatting, and edit callbacks customizable", () => {
		const onEdit = vi.fn()
		render(<SeoListing listing={{}} onEdit={onEdit} strings={{ noTitle: "Untitled page", noDescription: "Add a summary", noPermalink: "Add an address", edit: "Edit appearance", formatScore: score => `Quality ${score}` }} />)
		expect(screen.getByText("Untitled page")).toBeVisible()
		expect(screen.getByText("Add a summary")).toBeVisible()
		expect(screen.getByText("Add an address")).toBeVisible()
		expect(screen.getByText(/^Quality /)).toBeVisible()
		fireEvent.click(screen.getByRole("button", { name: "Edit appearance" }))
		expect(onEdit).toHaveBeenCalledOnce()
	})
	it("keeps supplier tabs controlled and removes redundant navigation for a single view", () => {
		const onViewChange = vi.fn()
		const metrics = [{ label: "Lead time", value: "6 days" }]
		const stats = [{ label: "On-time", value: "96%" }]
		const { rerender } = render(<VendorProfile name="Supplier" metrics={metrics} stats={stats} view="overview" onViewChange={onViewChange} />)
		fireEvent.click(screen.getByRole("tab", { name: "Performance" }))
		expect(onViewChange).toHaveBeenCalledWith("stats")
		expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true")
		rerender(<VendorProfile name="Supplier" metrics={metrics} stats={stats} view="stats" onViewChange={onViewChange} />)
		expect(screen.getByText("96%")).toBeVisible()
		rerender(<VendorProfile name="Supplier" metrics={metrics} view="stats" onViewChange={onViewChange} />)
		expect(screen.queryByRole("tablist")).not.toBeInTheDocument()
		expect(screen.getByText("6 days")).toBeVisible()
	})
})
