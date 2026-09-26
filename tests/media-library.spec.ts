/** Media library views keep selection and failed drafts, uploads recover, and every view passes axe in both themes. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

test("asset views preserve selection, expose metadata, and retain failed drafts", async ({ page }) => {
	await visitRoute(page, "/media-library")
	const demo = page.locator("#library")
	await demo.getByRole("button", { name: "Table view" }).click()
	await expect(demo.getByRole("columnheader", { name: "Usage" })).toBeVisible()
	await demo.getByRole("checkbox", { name: "Deselect: marlow-hall-exterior.jpg" }).press("Space")
	await demo.getByRole("checkbox", { name: "Select visible" }).press("Space")
	await expect(demo).toContainText("6 selected")
	await demo.getByRole("textbox", { name: "Search assets" }).fill("catering")
	await demo.getByRole("checkbox", { name: "Deselect visible" }).press("Space")
	await expect(demo).toContainText("5 selected")
	await demo.getByRole("textbox", { name: "Search assets" }).fill("")
	await demo.getByRole("button", { name: "Grid view" }).click()
	const details = demo.getByRole("button", { name: "Details: marlow-hall-exterior.jpg" })
	await details.click()
	const panel = demo.getByRole("complementary")
	await expect(panel).toBeFocused()
	await expect(panel.getByRole("textbox", { name: "Alt text" })).toHaveValue("Marlow Hall exterior at sunset")
	await panel.getByRole("textbox", { name: "Alt text" }).fill("Updated hall description")
	await demo.getByRole("button", { name: "Fail next action" }).click()
	await panel.getByRole("button", { name: "Save changes" }).click()
	await expect(panel.getByRole("alert")).toBeVisible()
	await expect(panel.getByRole("textbox", { name: "Alt text" })).toHaveValue("Updated hall description")
	await expect(demo.getByRole("button", { name: "Select: catering-menu.pdf" })).toBeVisible()
	await panel.getByRole("button", { name: "Save changes" }).click()
	// A field error is a polite status too, so the save confirmation is found by what it says.
	await expect(panel.getByRole("status").filter({ hasText: "Changes saved" })).toBeVisible()
	await panel.press("Escape")
	await expect(details).toBeFocused()
	await demo.getByRole("button", { name: "List view" }).click()
	await expect(demo.getByRole("checkbox", { name: "Deselect: floorplan-marlow.pdf" })).toBeChecked()
})

test("upload can cancel, fail, retry, and select the created asset", async ({ page }) => {
	await visitRoute(page, "/media-library")
	const demo = page.locator("#library")
	await demo.getByRole("tab", { name: "Upload", exact: true }).click()
	await demo.locator('input[type="file"]').setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("sample") })
	await demo.getByRole("button", { name: "Upload", exact: true }).click()
	await expect(demo.getByRole("progressbar", { name: "notes.txt" })).toBeVisible()
	await demo.getByRole("button", { name: "Cancel upload" }).click()
	await expect(demo.getByRole("button", { name: "Upload", exact: true })).toBeEnabled()
	await demo.getByRole("tab", { name: "Library", exact: true }).click()
	await demo.getByRole("button", { name: "Fail next action" }).click()
	await demo.getByRole("tab", { name: "Upload", exact: true }).click()
	await demo.getByRole("button", { name: "Upload", exact: true }).click()
	await expect(demo).toContainText("Upload failed")
	await demo.getByRole("button", { name: "Upload", exact: true }).click()
	await expect(demo.getByRole("button", { name: "Deselect: notes.txt" })).toHaveAttribute("aria-pressed", "true")
})

/* Both themes: this audit keeps axe's colour-contrast rule. */
for (const theme of ["light", "dark"] as const) test(`media library views stay accessible in ${theme}`, async ({ page }) => {
	await page.emulateMedia({ colorScheme: theme })
	await visitRoute(page, "/media-library")
	const demo = page.locator("#library")
	for (const view of ["Grid view", "List view", "Table view"]) {
		await demo.getByRole("button", { name: view }).click()
		expect((await new AxeBuilder({ page }).include("#library").analyze()).violations).toEqual([])
	}
	await demo.getByRole("button", { name: "Grid view" }).click()
	await demo.getByRole("button", { name: "Select: catering-menu.pdf" }).hover()
	await expect(demo.locator(".media-library-card--component").filter({ hasText: "catering-menu.pdf" }).locator("span[aria-hidden=true]")).toHaveCSS("opacity", "1")
	await demo.getByRole("button", { name: "Details: catering-menu.pdf" }).click()
	expect((await new AxeBuilder({ page }).include("#library").analyze()).violations).toEqual([])
})
