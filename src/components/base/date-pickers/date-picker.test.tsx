import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { FormField } from "@/components/base/forms"

import { DatePicker } from "./date-picker"

describe("DatePicker pending availability", () => {
	it("closes its calendar when disabled and does not reopen on recovery", () => {
		const { rerender } = render(<DatePicker />)
		fireEvent.click(screen.getByRole("combobox", { name: "Choose a date" }))
		expect(screen.getByRole("dialog", { name: "Choose a date" })).toBeInTheDocument()
		rerender(<DatePicker disabled />)
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		expect(screen.getByRole("combobox", { name: "Choose a date" })).toBeDisabled()
		rerender(<DatePicker />)
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		expect(screen.getByRole("combobox", { name: "Choose a date" })).toBeEnabled()
	})
})

describe("DatePicker opening month", () => {
	it("opens on the selected date's month rather than on today", () => {
		render(<DatePicker value={new Date(2026, 2, 12)} />)
		/* A combobox: named by its label (here the fallback), with the date as its value. */
		const trigger = screen.getByRole("combobox", { name: "Choose a date" })
		expect(trigger).toHaveTextContent("12 Mar 2026")
		fireEvent.click(trigger)
		/* The caption names the selected date's month. */
		expect(screen.getByRole("dialog", { name: "Choose a date" })).toHaveTextContent("March 2026")
	})

	it("falls back to the current month for an empty field", () => {
		render(<DatePicker />)
		fireEvent.click(screen.getByRole("combobox", { name: "Choose a date" }))
		const today = new Date()
		const caption = today.toLocaleString("en-GB", { month: "long" }) + " " + today.getFullYear()
		expect(screen.getByRole("dialog", { name: "Choose a date" })).toHaveTextContent(caption)
	})
})

describe("preset pickers forward their ref", () => {
	it("hands the trigger button to a ref on SingleDatePicker and RangeDatePicker", async () => {
		const { createRef } = await import("react")
		const { SingleDatePicker, RangeDatePicker } = await import("./presets-pickers")
		const single = createRef<HTMLButtonElement>()
		const range = createRef<HTMLButtonElement>()
		render(
			<>
				<SingleDatePicker ref={single} aria-label="Due date" />
				<RangeDatePicker ref={range} aria-label="Stay" />
			</>,
		)
		expect(single.current).toBeInstanceOf(HTMLButtonElement)
		expect(single.current).toHaveAccessibleName(/Due date/)
		expect(range.current).toBeInstanceOf(HTMLButtonElement)
	})
})

describe("DatePicker required", () => {
	it("announces required through its field, which a plain button could not carry", () => {
		render(
			<FormField label="Due date" required>
				<DatePicker />
			</FormField>,
		)
		const trigger = screen.getByRole("combobox", { name: /Due date/ })
		expect(trigger).toHaveAttribute("aria-required", "true")
		expect(trigger).toHaveAttribute("aria-haspopup", "dialog")
		expect(trigger).not.toHaveAttribute("aria-label")
	})
})
