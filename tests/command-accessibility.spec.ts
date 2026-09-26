/** Decorative command separators preserve listbox semantics and keyboard navigation. */
import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { url } from "./routes"

test("command separators do not become options or invalidate the result list", async ({ page }) => {
	await page.goto(url("/command"))
	const list = page.locator("main [role=listbox]").first()
	await expect(list.getByRole("option")).toHaveCount(4)
	const results = await new AxeBuilder({ page }).include("main").withRules(["aria-required-children"]).analyze()
	expect(results.violations).toEqual([])

	const input = page.getByPlaceholder("Type a command or search…").first()
	await input.focus()
	await input.press("ArrowDown")
	await input.press("ArrowDown")
	const active = await input.getAttribute("aria-activedescendant")
	expect(active).toBeTruthy()
	await expect(page.locator(`[id="${active}"]`)).toHaveAttribute("role", "option")
	await expect(page.locator(`[id="${active}"]`)).toContainText("Profile")
})
