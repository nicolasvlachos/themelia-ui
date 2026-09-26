/**
 * The type-scale recipe writes exactly the ladder the stylesheet declares: an override for a
 * step nothing declares reaches no reader.
 */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { deriveThemeTypeScale } from "./recipes"

const declared = [
	...readFileSync("src/styles/tokens/foundation.css", "utf8").matchAll(/^\s*(--text-[a-z0-9]+):\s*calc\(/gm),
]
	.map((match) => match[1])
	.filter((name) => name !== "--text-scale")

describe("deriveThemeTypeScale", () => {
	it("emits each declared step and its line height, and nothing else", () => {
		expect(declared.length).toBeGreaterThan(4)
		const expected = declared.flatMap((name) => [name, `${name}--line-height`]).sort()
		expect(Object.keys(deriveThemeTypeScale({ baseSize: 16 })).sort()).toEqual(expected)
	})
})
