/** Activity rows expand into labelled detail groups, collapse again and follow the feed's variant. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

test("activity rows expand into labelled detail groups", async ({ page }) => {
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
	expect((await new AxeBuilder({ page }).include("#activity-feed").analyze()).violations).toEqual([])
	await row.getByRole("button", { name: "Hide details", exact: true }).click()
	await expect(row.getByRole("group", { name: "Changes", exact: true })).toHaveCount(0)
	for (const variant of ["compact", "default", "rich"]) {
		await demo.getByRole("radio", { name: variant, exact: true }).click()
		await expect(row).toHaveAttribute("data-variant", variant)
	}
})
