/** Slider state, numeric stepping, tag recovery and stable button presses across desktop/mobile. */
import { expect, test } from "@playwright/test"
import { visitRoute } from "./routes"

for (const width of [1280, 390]) {
	test.describe(`foundation editing at ${width}px`, () => {
		test.use({ viewport: { width, height: 900 } })
		test("slider readouts, labels, and ranges track keyboard changes", async ({ page }) => {
			await visitRoute(page, "/slider")
			const slider = page.getByRole("slider", { name: "Steps of 10", exact: true })
			await slider.press("ArrowRight")
			await expect(slider).toHaveAttribute("aria-valuenow", "60")
			await expect(page.locator(".slider--component").filter({ has: slider })).toContainText("60")
			const invalid = page.getByRole("slider", { name: "Invalid", exact: true })
			await expect(invalid).toHaveAttribute("aria-invalid", "true")
			await expect(invalid).toHaveAccessibleDescription("Pick a value above 60.")
			await page.getByRole("slider", { name: "Minimum", exact: true }).press("ArrowRight")
			await expect(page.getByRole("slider", { name: "Minimum", exact: true })).toHaveAttribute("aria-valuenow", "21")
			await expect(page.getByRole("slider", { name: "Maximum", exact: true })).toHaveAttribute("aria-valuenow", "70")
		})
		test("numeric fields step from the keyboard and allow intermediate digits", async ({ page }) => {
			await visitRoute(page, "/decimal-input")
			const field = page.getByRole("textbox", { name: "With steppers", exact: true })
			await field.fill("1")
			await expect(field).toHaveValue("1")
			await field.fill("15")
			await field.press("ArrowUp")
			await expect(field).toHaveValue("25")
			await field.press("ArrowDown")
			await expect(field).toHaveValue("15")
		})
		test("tags retain invalid drafts and can recover", async ({ page }) => {
			await visitRoute(page, "/tags-input")
			const field = page.getByRole("textbox", { name: "Validated", exact: true })
			await field.fill("UPPER")
			await field.press("Enter")
			await expect(field).toHaveValue("UPPER")
			await field.fill("lower")
			await field.press("Enter")
			await expect(field).toHaveValue("")
			await expect(page.getByRole("button", { name: "Remove lower", exact: true })).toBeVisible()
			await field.press("Backspace")
			await expect(page.getByRole("button", { name: "Remove lower", exact: true })).toHaveCount(0)
			const labels = page.getByRole("textbox", { name: "Labels", exact: true })
			await labels.fill("alpha,beta,gamma")
			await labels.press("Enter")
			await expect(labels).toBeEnabled()
			await expect(page.getByRole("button", { name: "Remove gamma", exact: true })).toBeVisible()
			await labels.press("Backspace")
			await expect(page.getByRole("button", { name: "Remove gamma", exact: true })).toHaveCount(0)
		})
		/*
		 * No press transform: scaling about the centre moves the label and opens gaps in a joined
		 * group. The box must be identical before, during and after a press.
		 */
		test("pressing a standard button leaves its box exactly where it was", async ({ page }) => {
			await visitRoute(page, "/button")
			const button = page.locator("#tone-style .button--component").first()
			await button.scrollIntoViewIfNeeded()
			const bounds = (await button.boundingBox())!
			await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
			await page.mouse.down()
			await expect(button).toHaveCSS("scale", "none")
			await expect(button).toHaveCSS("transform", "none")
			const pressed = (await button.boundingBox())!
			expect(pressed).toEqual(bounds)
			await page.mouse.up()
			expect(await button.boundingBox()).toEqual(bounds)
		})
	})
}

test('a sheet honors its named cross-axis size on a narrow viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto('/#/overlay')
	await page.getByRole('button', { name: 'Flush, size="sm"', exact: true }).click()
	const sheet = page.locator('dialog[open]')
	await expect.poll(async () => Math.round((await sheet.boundingBox())!.width)).toBe(215)
})
