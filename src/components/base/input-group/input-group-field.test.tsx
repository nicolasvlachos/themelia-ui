import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FormField } from "@/components/base/forms"

import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group"

describe("InputGroup inside a FormField", () => {
	it("hands the field's label, error and description to the control, not the group", () => {
		render(
			<FormField label="Search orders" error="Enter at least two characters.">
				<InputGroup>
					<InputGroupAddon>#</InputGroupAddon>
					<InputGroupInput />
				</InputGroup>
			</FormField>,
		)
		const input = screen.getByRole("textbox", { name: "Search orders" })
		expect(input).toHaveAttribute("aria-invalid", "true")
		expect(input).toHaveAccessibleDescription("Enter at least two characters.")
		const label = document.querySelector("label")!
		expect(label).toHaveAttribute("for", input.id)
	})
})
