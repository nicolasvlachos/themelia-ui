/**
 * Text contrast, every page, both themes.
 *
 * Measured rather than eyeballed, because a near-miss ratio looks fine in a screenshot. The
 * measurement itself is checked by contrast-measurement.spec.ts.
 */
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, url, sweepTimeout } from "./routes"
import { auditTextContrast } from "./helpers/contrast"

for (const theme of ["light", "dark"] as const) {
	/*
	 * Each theme in its own describe: `test.use` applies to the enclosing scope, so two calls
	 * at file level would both apply file-wide and the last would win.
	 */
	test.describe(`${theme} theme`, () => {
		/* The OS preference — the docs app runs colorScheme: "system". */
		test.use({ colorScheme: theme })

		test(`contrast audit — ${theme}`, async ({ page }) => {
			test.setTimeout(sweepTimeout(COMPONENT_ROUTES.length))

			const report: Record<string, string[]> = {}

			for (const route of COMPONENT_ROUTES) {
				await page.goto(url(route.path))
				await page.waitForSelector("h1")
				await page.evaluate(() => document.fonts.ready)

				const findings = await page.evaluate(auditTextContrast)

				if (findings.length) report[route.path] = findings
			}

			const unexpected = Object.entries(report).flatMap(([path, findings]) =>
				findings.map((finding) => `${path} — ${finding}`),
			)

			expect(unexpected, unexpected.join("\n")).toEqual([])
		})
	})
}
