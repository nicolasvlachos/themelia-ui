import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CardCheckboxGroup } from "./card-checkbox-group"

describe("CardCheckboxGroup", () => {
	it("describes an option by its tooltip, as the radio groups do", () => {
		render(
			<CardCheckboxGroup
				aria-label="Add-ons"
				options={[
					{ value: "backup", label: "Backups", tooltip: "Nightly, kept for 30 days" },
					{ value: "cdn", label: "CDN" },
				]}
			/>,
		)
		expect(screen.getByRole("button", { name: /Backups/ })).toHaveAccessibleDescription("Nightly, kept for 30 days")
		expect(screen.getByRole("button", { name: "CDN" })).not.toHaveAttribute("aria-describedby")
	})
})
