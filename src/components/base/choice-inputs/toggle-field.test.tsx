import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SwitchCard } from "./switch-card"
import { ToggleField } from "./toggle-field"

const submitted = (form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())

describe("ToggleField and SwitchCard", () => {
	it("SwitchCard submits 1 and 0, and toggles from anywhere on the card", () => {
		const onValueChange = vi.fn()
		const { container } = render(
			<form>
				<SwitchCard name="beta" label="Beta features" description="Try things early." onValueChange={onValueChange} />
			</form>,
		)
		const form = container.querySelector("form")!
		expect(submitted(form)).toEqual({ beta: "0" })

		fireEvent.click(screen.getByText("Try things early."))
		expect(onValueChange).toHaveBeenLastCalledWith(true)
		expect(submitted(form)).toEqual({ beta: "1" })
		expect(screen.getByRole("switch", { name: "Beta features" })).toHaveAccessibleDescription("Try things early.")
	})

	it("a ToggleField row keeps the platform's rule unless asked otherwise", () => {
		const { container } = render(
			<form>
				<ToggleField name="digest" label="Weekly digest" kind="checkbox" />
			</form>,
		)
		expect(submitted(container.querySelector("form")!)).toEqual({})
		fireEvent.click(screen.getByRole("checkbox", { name: "Weekly digest" }))
		expect(screen.getByRole("checkbox", { name: "Weekly digest" })).toBeChecked()
	})

	it("takes the card surface, icon and hint on ToggleField itself", () => {
		const { container } = render(<ToggleField surface="card" label="Invoices" hint="Sent on the 1st." defaultValue />)
		const card = container.firstElementChild as HTMLElement
		expect(card).toHaveAttribute("data-checked", "true")
		expect(screen.getByText("Sent on the 1st.")).toBeVisible()
	})
})
