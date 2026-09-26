import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Input } from "./input"
import { PasswordInput } from "./password-input"
import { Textarea } from "./textarea"

describe("field affordances", () => {
	it.each([
		[Input, "disabled"], [Input, "readOnly"],
		[Textarea, "disabled"], [Textarea, "readOnly"],
	] as const)("does not clear a protected field", (Component, state) => {
		const onChange = vi.fn()
		render(<Component aria-label="Value" defaultValue="Keep" clearable {...{ [state]: true }} onChange={onChange} />)
		const clear = screen.queryByRole("button", { name: "Clear input" })
		if (clear) {
			expect(clear).toBeDisabled()
			fireEvent.click(clear)
		}
		expect(screen.getByRole("textbox")).toHaveValue("Keep")
		expect(onChange).not.toHaveBeenCalled()
	})
	it("tracks a numeric default value in the clear affordance", () => {
		render(<Input aria-label="Value" defaultValue={0} clearable />)
		expect(screen.getByRole("button", { name: "Clear input" })).toBeEnabled()
	})
	it("names the reveal action by what it will do, with no second state", async () => {
		render(<PasswordInput aria-label="Password" defaultValue="secret" />)
		const reveal = screen.getByRole("button", { name: "Show password" })
		expect(reveal).not.toHaveAttribute("aria-pressed")
		fireEvent.click(reveal)
		expect(screen.getByRole("button", { name: "Hide password" })).not.toHaveAttribute("aria-pressed")
		expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text")
	})
	it("disables the reveal action with its password field", () => {
		render(<PasswordInput aria-label="Password" defaultValue="secret" disabled />)
		expect(screen.getByRole("button")).toBeDisabled()
	})
})
