/** Comment threads render mentions inline, open replies, toggle reactions and keep their edit, reply and delete actions usable. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

test("comment threads open replies and keep their actions usable", async ({ page }) => {
	await visitRoute(page, "/comments")
	const demo = page.locator("#comments")
	const root = demo.locator('[data-comment-id="c1"]')
	const content = root.locator(".comment-content--component").first()
	await expect(content.locator("p")).toHaveCount(1)
	await expect(content.locator("p")).toContainText("Deposit is still outstanding — Maria Petrova can you chase it before Friday?")
	await root.getByRole("button", { name: "Show 1 reply", exact: true }).click()
	await expect(root.getByRole("button", { name: "Hide replies" })).toHaveAttribute("aria-expanded", "true")
	await expect(root.locator('[data-comment-id="c2"]')).toContainText("Chased.")
	const reaction = root.getByRole("button", { name: "👍 3", exact: true })
	await expect(reaction).toHaveAttribute("aria-pressed", "true")
	await reaction.click()
	await expect(root.getByRole("button", { name: "👍 2", exact: true })).toHaveAttribute("aria-pressed", "false")
	const menu = root.getByRole("button", { name: "Comment actions", exact: true }).first()
	await menu.focus()
	await menu.press("Enter")
	await expect(page.getByRole("menuitem", { name: "Edit", exact: true })).toBeVisible()
	await page.getByRole("menuitem", { name: "Edit", exact: true }).click()
	await expect(demo.getByText("Editing comment", { exact: true })).toBeVisible()
	await demo.getByRole("button", { name: "Cancel", exact: true }).last().click()
	await root.getByRole("button", { name: "Reply", exact: true }).first().click()
	await expect(demo.getByText("Replying to Marcus Webb", { exact: true })).toBeVisible()
	await demo.getByRole("button", { name: "Cancel", exact: true }).last().click()
	await menu.click()
	await page.getByRole("menuitem", { name: "Delete", exact: true }).click()
	await expect(page.getByRole("alertdialog")).toBeVisible()
	await page.getByRole("alertdialog").getByRole("button", { name: "Cancel", exact: true }).click()
	await expect(root).toBeVisible()
	/* Audit the settled page: mid-exit, the fading dialog's title measures as text on its own ground. */
	await expect(page.getByRole("alertdialog")).toBeHidden()
	const a11y = await new AxeBuilder({ page }).include("#comments").analyze()
	expect(a11y.violations).toEqual([])
})
