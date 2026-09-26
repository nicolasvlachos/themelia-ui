/** Activity rows expand into labelled detail groups and never overflow, at every density, width and theme. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

for (const theme of ["light", "dark"] as const) {
	for (const width of [1280, 390]) {
		test(`activity structure at ${width}px in ${theme}`, async ({ page }, info) => {
			test.setTimeout(60_000)
			await page.setViewportSize({ width, height: 844 })
			await page.emulateMedia({ colorScheme: theme })
			await visitRoute(page, "/activities")
			const demo = page.locator("#activity-feed")
			const row = demo.locator('[data-slot="activity-row"]').first()
			const toggle = row.getByRole("button", { name: "Show details", exact: true })
			await expect(toggle).toHaveText("Show details")
			await toggle.focus()
			await toggle.press("Enter")
			await expect(row.getByRole("group", { name: "Changes", exact: true })).toBeVisible()
			await expect(row.getByRole("group", { name: "Context", exact: true })).toBeVisible()
			await expect(row.getByRole("group", { name: "Related records", exact: true })).toBeVisible()
			await expect(row.locator("dl dt")).toHaveText(["Status", "Deposit", "Notes"])
			/* Captured for review, not compared. */
			await page.screenshot({ path: info.outputPath("expanded.png"), fullPage: true })
			for (const density of ["Compact", "Default", "Comfortable"]) {
				/* The docs Density select is hidden on narrow viewports, so switch it at desktop width. */
				await page.setViewportSize({ width: 1280, height: 844 })
				await page.getByLabel("Density", { exact: true }).selectOption({ label: density })
				await page.setViewportSize({ width, height: 844 })
				const overflow = await row.evaluate(el => el.scrollWidth - el.clientWidth)
				expect(overflow).toBeLessThanOrEqual(1)
				const cols = await row.locator(".activity-changes--component dd").evaluateAll(es => es.map(el => el.getBoundingClientRect().left))
				expect(Math.max(...cols) - Math.min(...cols)).toBeLessThanOrEqual(1)
			}
			await page.setViewportSize({ width: 1280, height: 844 })
			await page.getByLabel("Density", { exact: true }).selectOption({ label: "Default" })
			await page.setViewportSize({ width, height: 844 })
			expect((await new AxeBuilder({ page }).include("#activity-feed").analyze()).violations).toEqual([])
			await row.getByRole("button", { name: "Hide details", exact: true }).click()
			await expect(row.getByRole("group", { name: "Changes", exact: true })).toHaveCount(0)
			for (const density of ["compact", "default", "rich"]) {
				await demo.getByRole("radio", { name: density, exact: true }).click()
				await expect(row).toHaveAttribute("data-activity-density", density)
				expect(await row.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1)
			}
		})
	}
}
