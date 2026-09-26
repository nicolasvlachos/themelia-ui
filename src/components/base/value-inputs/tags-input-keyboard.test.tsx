import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { TagsInput } from "./tags-input"

function Field() {
	const [tags, setTags] = useState<string[]>(["alpha", "beta"])
	return <TagsInput aria-label="Tags" value={tags} onValueChange={setTags} />
}

describe("TagsInput editing", () => {
	it("commits on a typed comma", () => {
		render(<Field />)
		const input = screen.getByRole("textbox", { name: "Tags" })
		fireEvent.change(input, { target: { value: "gamma," } })
		expect(screen.getByRole("button", { name: "Remove gamma" })).toBeInTheDocument()
		expect(input).toHaveValue("")
	})

	it("says why a duplicate was not added", () => {
		render(<Field />)
		const input = screen.getByRole("textbox", { name: "Tags" })
		fireEvent.change(input, { target: { value: "ALPHA" } })
		fireEvent.keyDown(input, { key: "Enter" })
		expect(input).toHaveValue("ALPHA")
		expect(input).toHaveAttribute("aria-invalid", "true")
		expect(screen.getByRole("status")).toHaveTextContent("Not added: ALPHA.")
	})
})
