/** Global search keeps its keyboard highlight, loading, empty, recent and palette states, and moves its figures inline on a phone. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

/* The booking row's figure. The row renders it twice, beside the content and inline in it; the container width shows one. */
const TOTAL = "€12,400"

test("global search moves through results, loading, empty, recent and palette states", async ({ page }) => {
	await visitRoute(page, "/global-search")
	const panel = page.locator("#panel")
	const input = panel.getByRole("textbox", { name: "Search…", exact: true })
	const rows = panel.locator('[data-slot="global-search-result-row"]')
	await expect(rows).toHaveCount(5)
	const booking = rows.filter({ hasText: "autumn showcase" })
	await expect(booking.locator('[data-slot="item-title"]')).toBeVisible()
	await expect(booking.locator('[data-slot="badge"]')).toHaveText("Confirmed")
	/* The tab's name carries its count. */
	await expect(panel.getByRole("tab", { name: "All 5" })).toBeVisible()
	/* At this width the figure sits beside the content. */
	await expect(booking.getByText(TOTAL, { exact: true }).filter({ visible: true })).toHaveCount(1)
	await expect(booking.locator('[data-slot="item-content"]').getByText(TOTAL, { exact: true })).toBeHidden()
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
	/* The palette's example reports the row it opened. */
	await expect(page.locator("#dialog").getByText("opened: Marlow Hall — autumn showcase", { exact: true })).toBeVisible()
})

test("on a phone the figures move inline and nothing overflows", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await visitRoute(page, "/global-search")
	const panel = page.locator("#panel")
	const booking = panel.locator('[data-slot="global-search-result-row"]').filter({ hasText: "autumn showcase" })
	/* Below 576px the figure moves into the row's content. */
	await expect(booking.locator('[data-slot="item-content"]').getByText(TOTAL, { exact: true })).toBeVisible()
	await expect(booking.getByText(TOTAL, { exact: true }).filter({ visible: true })).toHaveCount(1)
	const overflow = await panel.evaluate(el => {
		const root = el.querySelector('[data-slot="global-search"]')!
		return root.scrollWidth - root.clientWidth
	})
	expect(overflow).toBeLessThanOrEqual(1)
	await page.getByRole("button", { name: "Open the palette", exact: true }).click()
	await expect(page.getByRole("dialog", { name: "Search", exact: true }).getByRole("textbox")).toBeFocused()
	expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
})
