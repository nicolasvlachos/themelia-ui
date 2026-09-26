/** Feature data states: pending, failed and empty results recover without losing filters, expanded rows or drafts. */
import { expect, test, type Locator } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

import { visitRoute } from "./routes"

async function choose(control: Locator, option: string) {
	await control.click()
	await control.page().getByRole("option", { name: option, exact: true }).click()
}

test("activity presentation inherits the chosen theme instead of the system theme", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "dark" })
	await visitRoute(page, "/activities")
	await page.getByRole("button", { name: "Switch to light theme", exact: true }).click()
	const demo = page.locator("#activity-feed")
	for (const density of ["compact", "default", "rich"]) {
		await demo.getByRole("radio", { name: density, exact: true }).click()
		const colors = await demo.locator('[data-slot="activity-feed"]').evaluate((feed) => {
			const parent = getComputedStyle(feed)
			return [...feed.querySelectorAll('[data-slot="activity-row"], [data-slot="activity-marker"]')].map((node) => ({
				foreground: getComputedStyle(node).getPropertyValue("--foreground").trim(),
				expectedForeground: parent.getPropertyValue("--foreground").trim(),
				scale: getComputedStyle(node).getPropertyValue("--density-scale").trim(),
				expectedScale: parent.getPropertyValue("--density-scale").trim(),
			}))
		})
		expect(colors.length).toBeGreaterThan(0)
		for (const color of colors) {
			expect(color.foreground).toBe(color.expectedForeground)
			expect(color.scale).toBe(color.expectedScale)
		}
	}
})

test("saved views keep their filters and show a custom comparison as no view", async ({ page }) => {
	/*
	 * An edited comparison matches no saved view, so no tab is selected; choosing a view again
	 * reapplies its filters.
	 */
	await page.setViewportSize({ width: 1280, height: 844 })
	await visitRoute(page, "/data-view")
	const demo = page.locator("#data-view")
	const tab = (name: string) => demo.getByRole("tab", { name, exact: true })
	await tab("Needs attention").click()
	await expect(tab("Needs attention")).toHaveAttribute("aria-selected", "true")
	await expect(demo.getByRole("status")).toHaveText("3 bookings")
	await demo.getByRole("button", { name: "Comparison", exact: true }).click()
	await page.getByRole("menuitemradio", { name: "is not", exact: true }).click()
	await expect(demo.getByRole("tab", { selected: true })).toHaveCount(0)
	await tab("Confirmed").click()
	await expect(tab("Confirmed")).toHaveAttribute("aria-selected", "true")
	await expect(demo.getByRole("status")).toHaveText("3 bookings")
})

test("data views distinguish pending, failure, and empty results with recovery", async ({ page }) => {
	await visitRoute(page, "/data-view")
	const demo = page.locator("#data-view-states")
	const state = demo.getByRole("combobox", { name: "Result state" })
	await choose(state, "Updating")
	await expect(demo.getByRole("textbox", { name: "Search", exact: true })).toBeDisabled()
	await expect(demo.getByRole("tab", { name: "All", exact: true })).toBeDisabled()
	await expect(demo.getByRole("status")).toHaveText("Updating results…")
	await expect(demo.getByRole("table").getByText("BK-4417")).toBeVisible()
	await choose(state, "Failed")
	await expect(demo.getByRole("alert")).toContainText("Filters could not be applied")
	await expect(demo.getByRole("table").getByText("BK-4417")).toBeVisible()
	await demo.getByRole("button", { name: "Restore results" }).click()
	await expect(demo.getByRole("alert")).toHaveCount(0)
	await demo.getByRole("textbox", { name: "Search", exact: true }).fill("No matching booking")
	await expect(demo).toContainText("No bookings match your filters")
	await demo.getByRole("button", { name: "Clear filters", exact: true }).last().click()
	await expect(demo.getByRole("textbox", { name: "Search", exact: true })).toHaveValue("")
	await expect(demo.getByRole("table").getByText("BK-4417")).toBeVisible()
})

test("pending filters block keyboard changes and restore interaction", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 844 })
	await visitRoute(page, "/filters")
	const demo = page.locator("#filters")
	await demo.getByRole("button", { name: "Show pending state" }).click()
	await expect(demo.getByRole("textbox", { name: "Search", exact: true })).toBeDisabled()
	await expect(demo.getByRole("button", { name: "Clear filters", exact: true })).toBeDisabled()
	await expect(demo.getByRole("tab", { name: "All", exact: true })).toBeDisabled()
	await expect(demo.getByRole("status")).toHaveText("Updating results…")
	await demo.getByRole("button", { name: "Resume filtering" }).press("Enter")
	await demo.getByRole("button", { name: "Clear filters", exact: true }).press("Enter")
	await expect(demo.getByRole("tab", { name: "All", exact: true })).toHaveAttribute("aria-selected", "true")
	await demo.getByRole("textbox", { name: "Search", exact: true }).fill("Only search")
	await demo.getByRole("button", { name: "Clear filters", exact: true }).click()
	await expect(demo.getByRole("textbox", { name: "Search", exact: true })).toHaveValue("")
})

test("mobile pending filters disable the sheet and saved views, then recover", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await visitRoute(page, "/filters")
	const demo = page.locator("#filters")
	await demo.getByRole("button", { name: "Show pending state" }).click()
	await expect(demo.getByRole("textbox", { name: "Search", exact: true })).toBeDisabled()
	await expect(demo.getByRole("button", { name: "Filters 1", exact: true })).toBeDisabled()
	await expect(demo.getByRole("combobox", { name: "Saved views", exact: true })).toBeDisabled()
	await demo.getByRole("button", { name: "Resume filtering" }).press("Enter")
	await demo.getByRole("button", { name: "Filters 1", exact: true }).press("Enter")
	const sheet = page.getByRole("dialog", { name: "Filters", exact: true })
	await sheet.getByRole("button", { name: "Clear filters", exact: true }).press("Enter")
	await expect(sheet).toContainText("No filters applied")
	await sheet.getByRole("button", { name: "Done", exact: true }).press("Enter")
	await expect(demo.getByRole("button", { name: "Filters", exact: true })).toBeFocused()
	await expect(demo.getByRole("combobox", { name: "Saved views", exact: true })).toContainText("All")
})

test("activity refresh and retry retain expanded history", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await visitRoute(page, "/activities")
	const demo = page.locator("#activity-feed")
	await demo.getByRole("button", { name: "Show details", exact: true }).first().click()
	const state = demo.getByRole("combobox", { name: "Feed state" })
	await choose(state, "Refreshing")
	await expect(demo.getByRole("status")).toHaveText("Updating activity…")
	await expect(demo.getByRole("button", { name: "Hide details", exact: true }).first()).toBeVisible()
	await choose(state, "Refresh failed")
	await expect(demo.getByRole("alert")).toContainText("activity service is unavailable")
	await expect(demo.getByRole("button", { name: "Hide details", exact: true }).first()).toBeVisible()
	await demo.getByRole("button", { name: "Try again" }).click()
	await expect(demo.getByRole("alert")).toHaveCount(0)
	await choose(state, "Initial loading")
	await expect(demo.getByRole("status")).toHaveText("Loading activity…")
	await expect(demo.getByText("No activity yet.")).toHaveCount(0)
	await choose(state, "Initial load failed")
	await expect(demo.getByRole("alert")).toBeVisible()
	await expect(demo.getByText("No activity yet.")).toHaveCount(0)
	await demo.getByRole("button", { name: "Try again" }).click()
	await expect(demo.getByRole("button", { name: "Hide details", exact: true }).first()).toBeVisible()
})

test("mixed activity log preserves an unfinished comment across loading and errors", async ({ page }) => {
	await visitRoute(page, "/activities")
	const demo = page.locator("#activity-log")
	const editor = demo.getByRole("textbox", { name: "Add a note to this booking…" })
	await editor.fill("Keep this unfinished note")
	const state = demo.getByRole("combobox", { name: "Log state" })
	await choose(state, "Updating")
	await expect(editor).toHaveText("Keep this unfinished note")
	await choose(state, "Failed")
	await expect(demo.getByRole("alert")).toContainText("Your draft is still here")
	await expect(editor).toHaveText("Keep this unfinished note")
	await demo.getByRole("button", { name: "Try again" }).click()
	await expect(demo.getByRole("alert")).toHaveCount(0)
	await expect(editor).toHaveText("Keep this unfinished note")
})

for (const theme of ["light", "dark"] as const) {
	test(`feature loading and failure states remain accessible in ${theme} mode`, async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 })
		await page.emulateMedia({ colorScheme: theme })
		const audit = async (selector: string) => {
			const { violations } = await new AxeBuilder({ page })
				.include(selector)
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
				.disableRules(["color-contrast"])
				.analyze()
			expect(violations).toEqual([])
		}

		await visitRoute(page, "/filters")
		await page.getByRole("button", { name: "Show pending state", exact: true }).click()
		await audit("#filters")
		await visitRoute(page, "/data-view")
		await choose(page.getByRole("combobox", { name: "Result state", exact: true }), "Failed")
		await audit("#data-view-states")
		await visitRoute(page, "/activities")
		for (const state of ["Refreshing", "Refresh failed", "Initial load failed"]) {
			await choose(page.getByRole("combobox", { name: "Feed state", exact: true }), state)
			await audit("#activity-feed")
		}
	})
}
