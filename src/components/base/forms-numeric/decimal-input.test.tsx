import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { DecimalInput } from "./decimal-input"

describe("DecimalInput editing", () => {
	it("lets a controlled field pass through intermediate digits below its minimum", () => {
		function Field() {
			const [value, setValue] = useState("")
			return <DecimalInput aria-label="Amount" min={10} max={100} value={value} onChange={e => setValue(e.target.value)} />
		}
		render(<Field />)
		const input = screen.getByRole("textbox")
		fireEvent.change(input, { target: { value: "1" } })
		expect(input).toHaveValue("1")
		fireEvent.change(input, { target: { value: "15" } })
		fireEvent.blur(input)
		expect(input).toHaveValue("15.00")
	})
	it("steps with arrow keys and respects a consumer's prevented key event", () => {
		const onChange = vi.fn()
		const { rerender } = render(<DecimalInput aria-label="Amount" defaultValue="5" min={5} step={10} onChange={onChange} />)
		const input = screen.getByRole("textbox")
		fireEvent.keyDown(input, { key: "ArrowUp" })
		expect(input).toHaveValue("15.00")
		rerender(<DecimalInput aria-label="Amount" defaultValue="5" min={5} step={10} onChange={onChange} onKeyDown={e => e.preventDefault()} />)
		fireEvent.keyDown(input, { key: "ArrowUp" })
		expect(input).toHaveValue("15.00")
	})
	it("does not step or normalize a read-only field", () => {
		const onChange = vi.fn()
		render(<DecimalInput aria-label="Amount" defaultValue="5" readOnly step={1} onChange={onChange} />)
		for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled()
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "ArrowUp" })
		fireEvent.blur(screen.getByRole("textbox"))
		expect(onChange).not.toHaveBeenCalled()
	})
})

describe("DecimalInput steppers", () => {
	it.each([
		["7", "ArrowDown", "5.00"],
		["7", "ArrowUp", "10.00"],
		["8", "ArrowUp", "10.00"],
		["8", "ArrowDown", "5.00"],
		["10", "ArrowUp", "15.00"],
		["10", "ArrowDown", "5.00"],
	])("steps %s %s to the next value on the grid, %s", (start, key, expected) => {
		render(<DecimalInput aria-label="Amount" defaultValue={start} step={5} />)
		const input = screen.getByRole("textbox")
		fireEvent.keyDown(input, { key })
		expect(input).toHaveValue(expected)
	})

	it("disables the stepper that can go no further, in an uncontrolled field", () => {
		render(<DecimalInput aria-label="Amount" defaultValue="1" min={0} max={2} step={1} decimalPlaces={0} />)
		const input = screen.getByRole("textbox")
		const decrement = screen.getByRole("button", { name: "Decrement" })
		const increment = screen.getByRole("button", { name: "Increment" })
		expect(decrement).toBeEnabled()
		expect(increment).toBeEnabled()
		fireEvent.keyDown(input, { key: "ArrowUp" })
		expect(input).toHaveValue("2")
		expect(increment).toBeDisabled()
		fireEvent.click(decrement)
		fireEvent.click(decrement)
		expect(input).toHaveValue("0")
		expect(decrement).toBeDisabled()
		expect(increment).toBeEnabled()
	})

	it("leaves focus in the field when a stepper is pressed", () => {
		render(<DecimalInput aria-label="Amount" defaultValue="1" step={1} />)
		const input = screen.getByRole("textbox")
		input.focus()
		const increment = screen.getByRole("button", { name: "Increment" })
		const pressed = fireEvent.mouseDown(increment)
		expect(pressed).toBe(false)
		fireEvent.click(increment)
		expect(input).toHaveFocus()
	})
})

describe("DecimalInput paste", () => {
	it("keeps the whole-number part of a pasted formatted amount", () => {
		function Field() {
			const [value, setValue] = useState("")
			return <DecimalInput aria-label="Amount" value={value} onChange={e => setValue(e.target.value)} />
		}
		render(<Field />)
		const input = screen.getByRole("textbox")
		fireEvent.paste(input, { clipboardData: { getData: () => "€1,234.50" } })
		expect(input).toHaveValue("1234.50")
	})
})
