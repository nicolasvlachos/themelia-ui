import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { PillRadioGroup } from "./pill-radio-group"

const OPTIONS = [
	{ value: "grid", label: "Grid" },
	{ value: "list", label: "List" },
	{ value: "board", label: "Board", disabled: true },
	{ value: "table", label: "Table" },
]

function Group() {
	const [value, setValue] = useState<string | null>("grid")
	return <PillRadioGroup aria-label="View" options={OPTIONS} value={value} onValueChange={setValue} />
}

describe("PillRadioGroup keyboard", () => {
	it("has one tab stop and moves selection with the arrows, skipping disabled options", () => {
		render(<Group />)
		expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument()
		const radios = screen.getAllByRole("radio")
		expect(radios.filter((radio) => radio.tabIndex === 0)).toHaveLength(1)
		radios[0]!.focus()
		fireEvent.keyDown(radios[0]!, { key: "ArrowRight" })
		expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true")
		fireEvent.keyDown(screen.getByRole("radio", { name: "List" }), { key: "ArrowRight" })
		expect(screen.getByRole("radio", { name: "Table" })).toHaveAttribute("aria-checked", "true")
		expect(screen.getByRole("radio", { name: "Table" })).toHaveFocus()
		fireEvent.keyDown(screen.getByRole("radio", { name: "Table" }), { key: "ArrowRight" })
		expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true")
	})
})

describe("PillRadioGroup form value and names", () => {
	const noop = () => {}
	const submitted = (form: HTMLFormElement) => new FormData(form).get("view")

	it("submits the value under its name, and nothing when cleared or disabled", () => {
		const { container, rerender } = render(<form><PillRadioGroup name="view" options={OPTIONS} value="list" onValueChange={noop} /></form>)
		const form = container.querySelector("form")!
		expect(submitted(form)).toBe("list")
		rerender(<form><PillRadioGroup name="view" options={OPTIONS} value={null} onValueChange={noop} /></form>)
		expect(submitted(form)).toBeNull()
		rerender(<form><PillRadioGroup name="view" options={OPTIONS} value="list" disabled onValueChange={noop} /></form>)
		expect(submitted(form)).toBeNull()
	})

	it("names a pill by the text of a node label rather than its value", () => {
		render(
			<PillRadioGroup
				aria-label="Language"
				options={[{ value: "nl", label: <span lang="nl">Nederlands</span> }]}
				value="nl"
				onValueChange={noop}
			/>,
		)
		expect(screen.getByRole("radio", { name: "Nederlands" })).toBeInTheDocument()
	})
})
