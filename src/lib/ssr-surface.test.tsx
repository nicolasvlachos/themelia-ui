// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest"

import manifest from "../../architecture/manifest.json"
import { renderFamilyWithoutBrowser, type SsrFamily } from "./ssr-surface-test-utils"

/**
 * Every published family, imported and rendered with no browser present. The `node`
 * environment pragma above is what makes it a real test (jsdom defines `window`).
 *
 * One case per family so a failure names it. The budget is ~20x the slowest family's
 * solo time, so machine load cannot fail it and a genuine hang still does.
 */
const BUDGET_MS = 20_000
const families = manifest.families as SsrFamily[]

/* Accumulated across cases: non-vacuity is a property of the whole sweep. */
let renderedTotal = 0
let importedTotal = 0

describe.each(families)("$id server surface", (family) => {
	it(
		"imports and renders without a browser global",
		async () => {
			const result = await renderFamilyWithoutBrowser(family)
			renderedTotal += result.rendered
			if (result.imported) importedTotal += 1

			expect(result.hazards.join("\n")).toBe("")
			expect(result.imported).toBe(true)
		},
		BUDGET_MS,
	)
})

afterAll(() => {
	/* Guards against every case passing over nothing (a broken manifest or selector). */
	expect(importedTotal).toBe(families.length)
	expect(renderedTotal).toBeGreaterThan(500)
})
