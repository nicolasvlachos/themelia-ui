import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FieldShell } from "./field-shell"

/**
 * FieldShell passes a field's injected id and aria flags to its control, not the wrapper.
 * Driven by props rather than a `FormField`: `base/text-inputs` may not import `base/forms`.
 */
describe("FieldShell", () => {
	const control = () => screen.getByRole("spinbutton")

	it("passes the field's wiring to the control", () => {
		const { container } = render(
			<FieldShell
				id="weight-control"
				aria-invalid
				aria-describedby="weight-support"
				aria-required
				end={<span>kg</span>}
			>
				<input type="number" />
			</FieldShell>,
		)

		expect(control()).toHaveAttribute("id", "weight-control")
		expect(control()).toHaveAttribute("aria-invalid", "true")
		expect(control()).toHaveAttribute("aria-describedby", "weight-support")
		expect(control()).toHaveAttribute("aria-required", "true")

		/* And keeps none of it: a label pointing at the wrapper names a div. */
		const shell = container.querySelector("[data-field-shell]")!
		expect(shell).not.toHaveAttribute("id")
		expect(shell).not.toHaveAttribute("aria-invalid")
	})

	it("finds the control when an addon sits beside it as a sibling child", () => {
		render(
			<FieldShell id="weight-control">
				<input type="number" />
				<span>kg</span>
			</FieldShell>,
		)

		expect(control()).toHaveAttribute("id", "weight-control")
	})

	it("keeps a caller's own id rather than overwriting it", () => {
		// A caller's own id wins; they must then give the field the same id via `htmlFor`.
		render(
			<FieldShell id="injected">
				<input type="number" id="my-own-id" />
			</FieldShell>,
		)

		expect(control()).toHaveAttribute("id", "my-own-id")
	})

	it("adds nothing when used on its own", () => {
		render(
			<FieldShell>
				<input type="number" />
			</FieldShell>,
		)

		expect(control()).not.toHaveAttribute("id")
		expect(control()).not.toHaveAttribute("aria-invalid")
		expect(control()).not.toHaveAttribute("aria-required")
	})
	it("preserves an explicit control label when the shell receives a field label", () => {
		render(<><span id="field-label">Account</span><FieldShell aria-labelledby="field-label"><input aria-label="Billing account" /></FieldShell></>)
		expect(screen.getByRole("textbox")).toHaveAccessibleName("Billing account")
	})

	it("explicitly wires a control hidden behind a consumer wrapper", () => {
		render(
			<FieldShell
				id="wrapped-control"
				aria-invalid
				aria-describedby="wrapped-support"
				aria-required
			>
				{(controlProps) => (
					<div data-consumer-wrapper>
						<input type="number" {...controlProps} />
					</div>
				)}
			</FieldShell>,
		)

		expect(control()).toHaveAttribute("id", "wrapped-control")
		expect(control()).toHaveAttribute("aria-invalid", "true")
		expect(control()).toHaveAttribute("aria-describedby", "wrapped-support")
		expect(control()).toHaveAttribute("aria-required", "true")
	})
})
