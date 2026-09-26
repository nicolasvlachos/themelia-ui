/** Opted-in fields render at 16px on an iPhone, so Safari does not zoom on focus, whatever the root font size. */
import { expect, test } from "@playwright/test"
import { visitRoute } from "./routes"

test("opted-in fields render at 16px on an iPhone", async ({ browser, baseURL }) => {
	const context = await browser.newContext({ baseURL, userAgent: "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Safari/605.1.15", viewport: { width: 390, height: 844 } })
	const page = await context.newPage()
	try {
		await visitRoute(page, "/input")
		const demo = page.locator("#iphone-input-zoom")
		for (const label of ["Enabled on iPhones", "iPhone textarea", "iPhone native select"]) {
			await expect(demo.getByLabel(label, { exact: true })).toHaveCSS("font-size", "16px")
		}
		/* A nested opt-out, a button select and a field that never opted in keep the shared field size. */
		await expect(demo.getByLabel("Nested opt-out")).not.toHaveCSS("font-size", "16px")
		await expect(demo.getByLabel("Button select")).not.toHaveCSS("font-size", "16px")
		await expect(page.locator("#shared-surface").getByLabel("Input", { exact: true })).not.toHaveCSS("font-size", "16px")
		/* 16px is absolute: a smaller root font size must not bring the zoom back. */
		await page.evaluate(() => { document.documentElement.style.fontSize = "12px" })
		await expect(page.getByLabel("Enabled on iPhones", { exact: true })).toHaveCSS("font-size", "16px")
	} finally { await context.close() }
})
