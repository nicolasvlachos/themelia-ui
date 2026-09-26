import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LanguageSwitcher } from "./language-switcher"

const LOCALES = [
	{ value: "en", label: "English" },
	{ value: "nl", label: "Nederlands" },
]

describe("LanguageSwitcher", () => {
	it("names the menu trigger with the visible language inside it", () => {
		render(<LanguageSwitcher locales={LOCALES} value="nl" />)
		expect(screen.getByRole("button", { name: "Language Nederlands" })).toBeInTheDocument()
	})

	it("falls back to the label while no language is active", () => {
		render(<LanguageSwitcher locales={LOCALES} />)
		expect(screen.getByRole("button", { name: "Language" })).toBeInTheDocument()
	})

	it("names each pill by its language and submits no field", () => {
		const { container } = render(
			<form>
				<LanguageSwitcher variant="pills" locales={LOCALES} value="en" />
				<LanguageSwitcher variant="pills" locales={LOCALES} value="nl" />
			</form>,
		)
		expect(screen.getAllByRole("radio", { name: "Nederlands" })).toHaveLength(2)
		expect([...new FormData(container.querySelector("form")!).keys()]).toEqual([])
	})
})
