import { createRef } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Select } from "@/components/base/choice-inputs"
import { CurrencyInput } from "@/components/base/forms-numeric"
import { FieldShell, Input, Textarea } from "@/components/base/text-inputs"
import { PhoneInput, TagsInput } from "@/components/base/value-inputs"

import { FormField } from "./form-field"

/**
 * FormField wiring: asserts the label→control relationship (not the `id`), including a
 * control with siblings.
 */
describe("FormField", () => {
	it("preserves an explicitly supplied accessible name", () => {
		render(<FormField label="Account"><Input aria-label="Billing account" /></FormField>)
		expect(screen.getByRole("textbox", { name: "Billing account" })).toBeInTheDocument()
	})
	it("names a single control", () => {
		render(
			<FormField label="Email">
				<input type="email" />
			</FormField>,
		)

		expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email")
	})

	it("names the control when something else sits beside it", () => {
		render(
			<FormField label="Tags">
				<input type="text" />
				<div>suggestions</div>
			</FormField>,
		)

		expect(screen.getByLabelText("Tags")).toHaveAttribute("type", "text")
	})

	it("keeps an id the caller set rather than overwriting it", () => {
		render(
			<FormField label="Email">
				<input type="email" id="my-own-id" />
			</FormField>,
		)

		expect(screen.getByLabelText("Email")).toHaveAttribute("id", "my-own-id")
	})

	it("describes the control by its error and marks it invalid", () => {
		render(
			<FormField label="Email" error="That address is not valid">
				<input type="email" />
				<div>beside it</div>
			</FormField>,
		)

		const control = screen.getByLabelText("Email")
		expect(control).toHaveAccessibleDescription("That address is not valid")
		expect(control).toHaveAttribute("aria-invalid", "true")
	})

	/*
	 * The same contract through the kit's own controls: each takes its own `invalid` and must
	 * not overwrite the `aria-invalid` FormField injects.
	 */
	it.each([
		["Input", <Input key="i" defaultValue="4242" />],
		["Textarea", <Textarea key="t" defaultValue="notes" />],
		["Select", <Select key="s" options={[{ value: "a", label: "A" }]} />],
		["PhoneInput", <PhoneInput key="p" />],
		["TagsInput", <TagsInput key="g" />],
		["CurrencyInput", <CurrencyInput key="c" />],
	])("keeps the invalid flag through %s", (_name, control) => {
		render(
			<FormField label="Card number" error="That card number is not valid">
				{control}
			</FormField>,
		)

		expect(screen.getByLabelText("Card number")).toHaveAttribute("aria-invalid", "true")
	})

	/* A control's own `invalid` still applies without a field error. */
	it("keeps a control's own invalid flag when the field has no error", () => {
		render(
			<FormField label="Card number">
				<Input invalid defaultValue="4242" />
			</FormField>,
		)

		expect(screen.getByLabelText("Card number")).toHaveAttribute("aria-invalid", "true")
	})

	it("wires nothing when there is no element to wire", () => {
		/* Plain text is a legal child and must render, not throw. */
		expect(() => render(<FormField label="Empty">just words</FormField>)).not.toThrow()
		expect(screen.getByText("just words")).toBeInTheDocument()
	})

	it("explicitly wires a control hidden behind a consumer wrapper", () => {
		render(
			<FormField label="Recovery email" required error="Use a different address">
				{(controlProps) => (
					<div data-consumer-wrapper>
						<input type="email" {...controlProps} />
					</div>
				)}
			</FormField>,
		)

		const control = screen.getByRole("textbox", { name: "Recovery email" })
		expect(control).toHaveAttribute("aria-required", "true")
		expect(control).toHaveAttribute("aria-invalid", "true")
		expect(control).toHaveAccessibleDescription("Use a different address")
	})

	it("composes through FieldShell without swallowing a consumer ref", () => {
		const ref = createRef<HTMLInputElement>()

		render(
			<FormField label="Weight" required hint="Use the packaged weight">
				{(fieldProps) => (
					<FieldShell {...fieldProps} end="kg">
						{(controlProps) => (
							<div data-custom-number-control>
								<input ref={ref} type="number" {...controlProps} />
							</div>
						)}
					</FieldShell>
				)}
			</FormField>,
		)

		const control = screen.getByRole("spinbutton", { name: "Weight" })
		expect(ref.current).toBe(control)
		expect(control).toHaveAttribute("aria-required", "true")
		expect(control).toHaveAccessibleDescription("Use the packaged weight")
	})
})
