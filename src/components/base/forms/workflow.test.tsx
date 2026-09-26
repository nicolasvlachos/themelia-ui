import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FieldGroup } from "./field-group"
import { FormField } from "./form-field"
import { ErrorSummary } from "./workflow"

describe("ErrorSummary", () => {
	it("is named by its counted heading", () => {
		render(<ErrorSummary errors={["Name is required.", "Email is not valid."]} />)
		expect(screen.getByRole("alert", { name: "2 problems to fix" })).toBeInTheDocument()
	})

	it("takes focus when asked, and again when the count changes", () => {
		const { rerender } = render(
			<>
				<button type="submit">Save</button>
				<ErrorSummary autoFocus errors={["Name is required."]} />
			</>,
		)
		const summary = screen.getByRole("alert")
		expect(summary).toHaveFocus()

		screen.getByRole("button", { name: "Save" }).focus()
		rerender(
			<>
				<button type="submit">Save</button>
				<ErrorSummary autoFocus errors={["Name is required.", "Email is not valid."]} />
			</>,
		)
		expect(screen.getByRole("alert")).toHaveFocus()
	})

	it("leaves focus alone by default, but can still be focused", () => {
		render(<ErrorSummary errors={["Name is required."]} />)
		const summary = screen.getByRole("alert")
		expect(summary).not.toHaveFocus()
		expect(summary).toHaveAttribute("tabindex", "-1")
	})
})

describe("group descriptions", () => {
	it("describes a FormField group by its support line", () => {
		render(
			<FormField htmlFor={false} label="Contacts" helperText="Drag a handle to reorder.">
				<div />
			</FormField>,
		)
		expect(screen.getByRole("group", { name: "Contacts" })).toHaveAccessibleDescription(
			"Drag a handle to reorder.",
		)
	})

	it("describes a FieldGroup by its description", () => {
		render(
			<FieldGroup legend="Address" description="Where the invoice is sent.">
				<input aria-label="Street" />
			</FieldGroup>,
		)
		expect(screen.getByRole("group", { name: "Address" })).toHaveAccessibleDescription(
			"Where the invoice is sent.",
		)
	})
})
