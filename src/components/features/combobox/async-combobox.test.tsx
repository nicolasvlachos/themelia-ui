import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AsyncCombobox, AsyncMultiCombobox } from "./async-combobox"

describe("async combobox", () => {
	it("shows the query when opened by its parent and the selection when closed", () => {
		const props = { items: ["Greece"], selectedValue: "Greece", searchValue: "fra", onSearchValueChange: vi.fn(), onSelectedValueChange: vi.fn(), getItemLabel: (value: string) => value }
		const { rerender } = render(<AsyncCombobox {...props} open />)
		expect(screen.getByRole("combobox")).toHaveValue("fra")
		rerender(<AsyncCombobox {...props} open={false} />)
		expect(screen.getByRole("combobox")).toHaveValue("Greece")
	})
	it("associates the field error with its input", () => {
		render(<AsyncCombobox items={[]} selectedValue={null} searchValue="" onSearchValueChange={vi.fn()} onSelectedValueChange={vi.fn()} getItemLabel={String} error="Choose an available country" />)
		expect(screen.getByRole("combobox")).toHaveAccessibleDescription("Choose an available country")
	})
	it("discards the apply draft when its parent closes the picker", () => {
		const props = { items: ["Greece", "Germany"], selectedValues: [], searchValue: "", onSearchValueChange: vi.fn(), onSelectedValuesChange: vi.fn(), getItemLabel: (value: string) => value, minSearchLength: 0, applyButton: true }
		const { rerender } = render(<AsyncMultiCombobox {...props} open />)
		fireEvent.click(screen.getByRole("option", { name: "Greece" }))
		expect(screen.getByRole("option", { name: "Greece" })).toHaveAttribute("aria-selected", "true")
		rerender(<AsyncMultiCombobox {...props} open={false} />)
		rerender(<AsyncMultiCombobox {...props} open />)
		expect(screen.getByRole("option", { name: "Greece" })).toHaveAttribute("aria-selected", "false")
	})

	it("shows no-match feedback even while retaining the selected option", async () => {
		render(<AsyncCombobox items={[]} selectedValue="Greece" searchValue="zzzz" open onSearchValueChange={vi.fn()} onSelectedValueChange={vi.fn()} getItemLabel={String} />)
		expect(await screen.findByText("No results found.")).toBeVisible()
		expect(screen.getByRole("option", { name: "Greece" })).toHaveAttribute("aria-selected", "true")
	})

})
