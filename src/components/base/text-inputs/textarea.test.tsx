import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Input } from "./input"
import { Textarea } from "./textarea"

describe("Textarea className", () => {
	it("lands on the textarea, like Input's on the input, so a caller can set resize", () => {
		const { container } = render(<Textarea className="no-resize" />)
		const control = container.querySelector("textarea")
		expect(control?.classList.contains("no-resize")).toBe(true)
		expect(control?.classList.contains("textarea--component")).toBe(true)
		expect(container.querySelector("[data-slot='textarea-frame']")?.classList.contains("no-resize")).toBe(false)
	})

	it("matches Input's split between control and frame", () => {
		const { container } = render(<Input className="probe" />)
		expect(container.querySelector("input")?.classList.contains("probe")).toBe(true)
		expect(container.querySelector("[data-slot='input-frame']")?.classList.contains("probe")).toBe(false)
	})
})
