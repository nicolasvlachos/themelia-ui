import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FormField } from "@/components/base/forms"

import { LocalizedObjectField, LocalizedStringField } from "./localized-fields"

const LOCALES = [
	{ value: "en", label: "English" },
	{ value: "nl", label: "Nederlands" },
]

describe("LocalizedStringField", () => {
	it("takes the field's name and hint, with the locale in the name", () => {
		render(
			<FormField htmlFor={false} label="Display name" helperText="Switch locale — the value follows.">
				<LocalizedStringField locales={LOCALES} value={{ en: "Name" }} />
			</FormField>,
		)
		const input = screen.getByRole("textbox", { name: "Display name English" })
		expect(input).toHaveAccessibleDescription("Switch locale — the value follows.")

		fireEvent.click(screen.getByRole("radio", { name: "Nederlands" }))
		expect(screen.getByRole("textbox", { name: "Display name Nederlands" })).toHaveValue("")
	})
})

describe("LocalizedObjectField", () => {
	it("gives every field a visible label naming it, with the locale", () => {
		render(
			<LocalizedObjectField
				locales={LOCALES}
				fields={[
					{ name: "title", label: "Title" },
					{ name: "body", label: "Body", multiline: true },
				]}
			/>,
		)
		expect(screen.getByText("Title")).toBeVisible()
		expect(screen.getByRole("textbox", { name: "Title English" })).toBeInTheDocument()
		expect(screen.getByRole("textbox", { name: "Body English" })).toBeInTheDocument()
	})
})
