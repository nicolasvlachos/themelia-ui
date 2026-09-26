import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { ObjectRepeater, type ObjectRow } from "./object-repeater"

function Rows() {
	const [value, setValue] = useState<ObjectRow[]>([{ name: "Ada" }, { name: "Grace" }])
	return <ObjectRepeater sortable value={value} onValueChange={setValue} fields={[{ name: "name", label: "Name" }]} />
}

describe("ObjectRepeater keys", () => {
	it("moves a row's own field with it, and keeps it through an edit", () => {
		render(<Rows />)
		const ada = screen.getByDisplayValue("Ada")
		fireEvent.change(ada, { target: { value: "Ada L" } })
		expect(screen.getByDisplayValue("Ada L")).toBe(ada)

		fireEvent.keyDown(screen.getByRole("button", { name: /Reorder item 1/ }), { key: "ArrowDown" })
		const fields = screen.getAllByRole("textbox")
		expect(fields[1]).toBe(ada)
		expect(ada).toHaveValue("Ada L")
	})
})
