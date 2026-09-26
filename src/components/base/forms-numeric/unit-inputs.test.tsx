import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FormField } from "@/components/base/forms"

import { DimensionsInput, WeightInput } from "./unit-inputs"

describe("clustered numeric fields inside a FormField", () => {
	it("names each box by the field and its axis, and carries the error", () => {
		render(
			<FormField label="Package" error="Enter every side." required>
				<DimensionsInput />
			</FormField>,
		)
		const length = screen.getByRole("textbox", { name: "Package Length" })
		expect(length).toHaveAttribute("aria-invalid", "true")
		expect(length).toHaveAttribute("aria-required", "true")
		expect(length).toHaveAccessibleDescription("Enter every side.")
		expect(screen.getByRole("textbox", { name: "Package Height" })).toBeInTheDocument()
	})

	it("hands the error to a weight field's amount", () => {
		render(
			<FormField label="Weight" error="Too heavy.">
				<WeightInput />
			</FormField>,
		)
		const amount = screen.getByRole("textbox", { name: "Weight" })
		expect(amount).toHaveAttribute("aria-invalid", "true")
		expect(amount).toHaveAccessibleDescription("Too heavy.")
	})
})
