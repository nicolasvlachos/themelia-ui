import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MetadataList } from "./metadata-list"

describe("MetadataList", () => {
	it("names a fact's info button after the fact, not after its tooltip", () => {
		render(<MetadataList items={[{ label: "Amount", value: "48,200", tooltip: "Excludes tax." }]} />)

		expect(screen.getByRole("button", { name: "Amount info" })).toBeTruthy()
	})
})
