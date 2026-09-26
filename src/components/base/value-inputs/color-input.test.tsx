import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { FormField } from "@/components/base/forms"

import { ColorInput } from "./color-input"

afterEach(() => {
	vi.unstubAllGlobals()
})

describe("ColorInput", () => {
	it("describes each swatch by the field it belongs to", () => {
		render(
			<>
				<FormField label="Primary">
					<ColorInput defaultValue="#336699" />
				</FormField>
				<ColorInput aria-label="Accent" defaultValue="#993366" />
			</>,
		)
		const [primary, accent] = screen.getAllByLabelText("Choose a colour")
		expect(primary).toHaveAccessibleDescription("Primary")
		expect(accent).toHaveAccessibleDescription("Accent")
		// The field's label still finds exactly one control: the text field.
		expect(screen.getByLabelText("Primary")).toHaveAttribute("type", "text")
	})

	it("shows an unreadable colour as one, and reports it once editing stops", () => {
		// jsdom has no CSS.supports; stand in with the one rule this needs.
		vi.stubGlobal("CSS", { supports: (_property: string, value: string) => !value.includes("zz") })
		const { container } = render(<ColorInput aria-label="Accent" defaultValue="#336699" />)
		const text = screen.getByRole("textbox", { name: "Accent" })
		const swatch = container.querySelector("[data-empty]")
		expect(swatch).toBeNull()

		text.focus()
		fireEvent.change(text, { target: { value: "#3366zz" } })
		expect(container.querySelector("[data-unreadable]")).not.toBeNull()
		expect(text).not.toHaveAttribute("aria-invalid")

		fireEvent.blur(text)
		expect(text).toHaveAttribute("aria-invalid", "true")
		// What was typed is kept verbatim.
		expect(text).toHaveValue("#3366zz")
	})

	it("leaves the caller's own invalid state alone", () => {
		vi.stubGlobal("CSS", { supports: () => false })
		render(<ColorInput aria-label="Accent" defaultValue="nope" aria-invalid={false} />)
		expect(screen.getByRole("textbox", { name: "Accent" })).not.toHaveAttribute("aria-invalid", "true")
	})
})
