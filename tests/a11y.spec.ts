/**
 * An accessibility audit of every component page.
 *
 * Axe with WCAG 2.1 A/AA and best-practice rules, scoped to `main` (the docs shell is the
 * site's own app). Colour contrast is disabled here because `contrast.spec.ts` measures it
 * more strictly. No violation is allowed. Each sweep runs as slices of the routes, in parallel.
 */
import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { READABLE_ROUTES, shards, sweepTimeout, url, visitRoute } from "./routes"

const RULES = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]

/*
 * One theme: with colour contrast disabled (contrast.spec measures it in both), axe checks
 * names, roles and structure, which a theme does not change.
 */
for (const theme of ["light"] as const) {
	test.describe(`${theme} theme`, () => {
		/* The OS preference — the docs app runs colorScheme: "system", as contrast.spec does. */
		test.use({ colorScheme: theme })

		for (const shard of shards(READABLE_ROUTES, 6)) {
			test(`accessibility audit — ${theme} ${shard.name}`, async ({ page }) => {
				test.setTimeout(sweepTimeout(shard.routes.length))
				const findings: string[] = []
				for (const route of shard.routes) {
					await page.goto(url(route.path))
					await page.waitForSelector("h1")
					await page.evaluate(() => document.fonts.ready)
					const results = await new AxeBuilder({ page })
						.include("main")
						.withTags(RULES)
						.disableRules(["color-contrast"])
						.analyze()
					for (const violation of results.violations) {
						for (const node of violation.nodes) {
							findings.push(`${route.path} — ${violation.id} (${violation.impact}): ${node.target.join(" ")}\n      ${violation.help}`)
						}
					}
				}
				expect(findings, `accessibility violations:\n${findings.join("\n")}`).toEqual([])
			})
		}
	})
}

/*
 * A `<label for>` must address an element that exists: axe passes any control with some name
 * (a placeholder, a zone's text), so a dangling label goes unnoticed there. A field with no
 * single control passes `htmlFor={false}` and becomes a named group instead. And an id used
 * twice misdirects a label or `aria-controls`; axe 4.x no longer checks `duplicate-id`.
 */
test.describe("labels and ids", () => {
	for (const shard of shards(READABLE_ROUTES, 2)) {
		test(`every caption addresses a control, and no id repeats — ${shard.name}`, async ({ page }) => {
			test.setTimeout(sweepTimeout(shard.routes.length))
			const problems: string[] = []
			let labels = 0
			let ids = 0
			for (const route of shard.routes) {
				await visitRoute(page, route.path)
				const found = await page.evaluate(() => {
					const scope = document.querySelector("main")
					if (!scope) return { problems: [] as string[], labels: 0, ids: 0 }
					const problems: string[] = []
					let labels = 0
					for (const label of Array.from(scope.querySelectorAll<HTMLLabelElement>("label[for]"))) {
						/* cmdk always renders a hidden label against its input id; vendored markup the axe sweep still checks. */
						if (label.hasAttribute("cmdk-label")) continue
						labels++
						const target = label.getAttribute("for")!
						if (!document.getElementById(target)) problems.push(`"${label.textContent?.trim().slice(0, 30)}" -> #${target} addresses nothing`)
					}
					const seen = new Map<string, number>()
					for (const el of Array.from(scope.querySelectorAll("[id]"))) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
					for (const [id, n] of seen) if (n > 1) problems.push(`id="${id}" on ${n} elements`)
					return { problems, labels, ids: seen.size }
				})
				labels += found.labels
				ids += found.ids
				for (const problem of found.problems) problems.push(`${route.path}  ${problem}`)
			}
			/* Proof the slice is not vacuous: with no labels or ids found, nothing can dangle or collide. */
			expect(labels, "no label[for] was found in this slice").toBeGreaterThan(0)
			expect(ids, "no element carried an id in this slice").toBeGreaterThan(0)
			expect(problems, `captions addressing nothing, or ids used twice:\n  ${problems.join("\n  ")}`).toEqual([])
		})
	}
})
