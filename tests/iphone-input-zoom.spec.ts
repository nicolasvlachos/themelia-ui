/** Opted-in fields render at 16px on iPhone only, so Safari does not zoom on focus; everything else keeps 14px. */
import { expect, test } from "@playwright/test"
import { visitRoute } from "./routes"

for (const platform of ["iPhone", "iPad", "Macintosh", "Android", "Windows NT 10.0"]) test(`field typography stays consistent for ${platform}`, async ({ browser, baseURL }) => {
	const context = await browser.newContext({ baseURL, userAgent: `Mozilla/5.0 (${platform}) AppleWebKit/605.1.15 Safari/605.1.15`, viewport: { width: 390, height: 844 } })
	const page = await context.newPage()
	try {
		await visitRoute(page, "/input")
		for (const width of [390, 1024]) {
			await page.setViewportSize({ width, height: 844 })
			const demo = page.locator("#iphone-input-zoom")
			for (const label of ["Enabled on iPhones", "iPhone textarea", "iPhone native select"]) {
				await expect(demo.getByLabel(label, { exact: true })).toHaveCSS("font-size", platform === "iPhone" ? "16px" : "14px")
			}
			await expect(demo.getByLabel("Nested opt-out")).toHaveCSS("font-size", "14px")
			await expect(demo.getByLabel("Button select")).toHaveCSS("font-size", "14px")
			await expect(page.locator("#shared-surface").getByLabel("Input", { exact: true })).toHaveCSS("font-size", "14px")
		}
		if (platform === "iPhone") {
			/* 16px is absolute: a smaller root font size must not bring the zoom back. */
			await page.evaluate(() => { document.documentElement.style.fontSize = "12px" })
			await expect(page.getByLabel("Enabled on iPhones", { exact: true })).toHaveCSS("font-size", "16px")
		}
	} finally { await context.close() }
})
