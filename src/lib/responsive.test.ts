/**
 * The pixel breakpoints JavaScript uses are the stylesheet's `--bp-*` custom media, so a
 * hook and a media query flip at the same width.
 */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { BREAKPOINT_MIN_WIDTH } from "./responsive"

describe("BREAKPOINT_MIN_WIDTH", () => {
	it("matches every min-width breakpoint in breakpoints.css", () => {
		const css = readFileSync("src/styles/theming/breakpoints.css", "utf8")
		const declared = Object.fromEntries(
			[...css.matchAll(/@custom-media --bp-(sm|md|lg|xl|2xl) \(min-width: ([\d.]+)rem\)/g)].map(
				(match) => [match[1], Number(match[2]) * 16],
			),
		)
		expect(Object.keys(declared)).toHaveLength(5)
		expect(BREAKPOINT_MIN_WIDTH).toEqual(declared)
	})
})
