/** Global search keeps its layout, keyboard highlight, loading, empty and palette states at desktop and phone widths. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

for (const theme of ["light", "dark"] as const) {
	for (const width of [1280, 390]) {
		test(`global search layout and state transitions at ${width}px in ${theme}`, async ({ page }, info) => {
			test.setTimeout(60_000)
			await page.setViewportSize({ width, height: 844 })
			await page.emulateMedia({ colorScheme: theme })
			await visitRoute(page, "/global-search")
			const panel = page.locator("#panel")
			const input = panel.getByRole("textbox", { name: "Search…", exact: true })
			const rows = panel.locator('[data-slot="global-search-result-row"]')
			await expect(rows).toHaveCount(5)
			const booking = rows.filter({ hasText: "autumn showcase" })
			await expect(booking.locator('[data-slot="item-title"]')).toBeVisible()
			await expect(booking.locator('[data-slot="badge"]')).toHaveText("Confirmed")
			/* The count is a tabular support figure, not a badge; the tab's name still carries it. */
			await expect(panel.getByRole("tab", { name: "All 5" }).locator('[class*="tabCount"]')).toHaveText("5")
			/* Below 576px the figures move inline with the row. */
			const figures = booking.locator(width < 576 ? '[class*="inlineFigure"]' : '[class*="figure_"]')
			await expect(figures).toBeVisible()
			const overflow = await panel.evaluate(el => {
				const root = el.querySelector('[data-slot="global-search"]')!
				return root.scrollWidth - root.clientWidth
			})
			expect(overflow).toBeLessThanOrEqual(1)
			await input.click()
			const pageY = await page.evaluate(() => window.scrollY)
			await input.press("ArrowDown")
			await input.press("ArrowDown")
			await input.press("ArrowDown")
			await input.press("ArrowDown")
			await expect(rows.last()).toHaveAttribute("data-active", "true")
			const inView = await rows.last().evaluate(el => {
				const row = el.getBoundingClientRect()
				const scroll = el.closest('[data-slot="scroll-area"]')!.getBoundingClientRect()
				return row.top >= scroll.top - 1 && row.bottom <= scroll.bottom + 1
			})
			expect(inView).toBe(true)
			/* Arrowing scrolls the result list, never the page. */
			expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(pageY, 0)
			await input.press("Enter")
			await expect(panel.getByText("opened: marlow-floorplan.pdf", { exact: true })).toBeVisible()
			await panel.getByRole("button", { name: "See all Bookings", exact: true }).click()
			await expect(input).toBeFocused()
			await expect(rows).toHaveCount(2)
			await expect(panel.getByText("2 results", { exact: true })).toBeVisible()
			await page.screenshot({ path: info.outputPath("search-results.png"), animations: "disabled" })
			expect((await new AxeBuilder({ page }).include("#panel").analyze()).violations).toEqual([])
			await panel.getByText("Simulate loading", { exact: true }).click()
			await expect(panel.getByText("Searching…", { exact: true })).toBeVisible()
			await expect(rows).toHaveCount(0)
			await panel.getByText("Simulate loading", { exact: true }).click()
			await input.fill("zzzzzz")
			await expect(panel.getByText('No results for “zzzzzz”')).toBeVisible()
			await input.fill("")
			await expect(panel.getByText("Recent", { exact: true })).toBeVisible()
			await panel.getByRole("button", { name: "Marlow Hall", exact: true }).click()
			await expect(input).toHaveValue("Marlow Hall")
			await expect(rows).toHaveCount(3)
			await page.getByRole("button", { name: "Open the palette", exact: true }).click()
			const dialog = page.getByRole("dialog", { name: "Search", exact: true })
			await expect(dialog.getByRole("textbox")).toBeFocused()
			await dialog.getByRole("button", { name: "Marlow Hall", exact: true }).click()
			await expect(dialog.locator('[data-slot="global-search-result-row"]')).toHaveCount(3)
			await dialog.locator('[data-slot="global-search-result-row"]').first().click()
			await expect(dialog).not.toBeVisible()
			expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
		})
	}
}
