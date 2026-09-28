/**
 * The type-scale recipe writes exactly the steps the stylesheet declares: an override for a
 * step nothing declares reaches no reader.
 */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { deriveThemeTypeScale } from "./recipes"

const declared = [
	...readFileSync("src/styles/theme/typography.css", "utf8").matchAll(/^\s*(--text-[a-z0-9]+):\s*[\d.]+rem;/gm),
].map((match) => match[1])

describe("deriveThemeTypeScale", () => {
	it("emits each declared step, and nothing else", () => {
		expect(declared.length).toBeGreaterThan(4)
		expect(Object.keys(deriveThemeTypeScale({ baseSize: 16 })).sort()).toEqual([...declared].sort())
	})
})
