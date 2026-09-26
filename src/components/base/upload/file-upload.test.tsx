import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FormField } from "@/components/base/forms"

import { FileUpload } from "./file-upload"

/** FileUpload: the zone's visible words name the file input, structurally (a `<label>`). */
describe("FileUpload", () => {
	it("names the input from the zone's own instruction", () => {
		render(<FileUpload value={[]} onValueChange={() => {}} />)

		const input = screen.getByLabelText(/drag|browse|drop/i)
		expect(input).toHaveAttribute("type", "file")
	})

	it("uses the caller's label as the name when one is given", () => {
		render(<FileUpload value={[]} onValueChange={() => {}} label="Attach your receipts" />)

		expect(screen.getByLabelText(/attach your receipts/i)).toHaveAttribute("type", "file")
	})

	it("leaves no file input unnamed", () => {
		/* The rule axe reports, stated directly rather than through one phrasing of the copy. */
		const { container } = render(
			<FileUpload value={[]} onValueChange={() => {}} multiple hint="PNG up to 2MB" />,
		)

		for (const input of container.querySelectorAll("input[type=file]")) {
			expect(input).toHaveAccessibleName()
		}
	})

	it("puts the field's state on the input, not on the zone around it", () => {
		render(
			<FormField label="Receipts" error="Attach at least one receipt.">
				<FileUpload value={[]} onValueChange={() => {}} />
			</FormField>,
		)
		const input = screen.getByLabelText(/receipts/i)
		expect(input).toHaveAttribute("type", "file")
		expect(input).toHaveAttribute("aria-invalid", "true")
		expect(input).toHaveAccessibleDescription("Attach at least one receipt.")
		expect(input.closest("label")).not.toHaveAttribute("aria-invalid")
	})

	it("moves focus to the next row when a file is removed, then to the input", () => {
		const files = ["a.txt", "b.txt"].map((name) => new File(["x"], name, { type: "text/plain" }))
		render(<FileUpload multiple defaultValue={files} />)

		const first = screen.getByRole("button", { name: /a\.txt/ })
		first.focus()
		fireEvent.click(first)
		const second = screen.getByRole("button", { name: /b\.txt/ })
		expect(second).toHaveFocus()

		fireEvent.click(second)
		expect(document.querySelector("input[type=file]")).toHaveFocus()
	})
})
