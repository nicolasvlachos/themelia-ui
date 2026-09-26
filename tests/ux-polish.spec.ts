/** Upload pickers, rejection messages and touch affordances, plus DataView debounce, paging, sorting and empty recovery. */
import { expect, test } from "@playwright/test"
import { url } from "./routes"

test("every empty and filled image picker opens the native chooser", async ({ page }) => {
	await page.goto(url("/file-upload"))
	const inputs = page.locator("#media-upload input[type=file]")
	await expect(inputs).toHaveCount(4)
	for (const input of await inputs.all()) {
		const chooser = page.waitForEvent("filechooser")
		await input.click({ timeout: 3000 })
		await (await chooser).setFiles([])
	}
})

test("upload examples keep full-width pickers on a phone", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url("/file-upload"))
	for (const input of await page.locator("#media-upload .image-upload--component input").all()) {
		const box = await input.boundingBox()
		expect(box!.width).toBeGreaterThan(250)
	}
})

test("an upload rejection is explained and clears after a valid selection", async ({ page }) => {
	await page.goto(url("/file-upload"))
	const picker = page.locator("#media-upload .image-upload--component").first()
	const input = picker.locator("input")
	await input.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("Not an image") })
	// A field error is announced politely (role=status), and this page holds other status regions.
	const message = page.locator("#media-upload").getByText("notes.txt is not an accepted file type.")
	await expect(message).toHaveAttribute("role", "status")
	await expect(input).toHaveAttribute("aria-invalid", "true")
	await expect(input).toHaveAccessibleDescription("notes.txt is not an accepted file type.")
	await input.setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64") })
	await expect(message).toHaveCount(0)
	await expect(input).not.toHaveAttribute("aria-invalid", "true")
	await expect(input).toHaveAccessibleDescription("PNG or JPEG, up to 2 MB.")
	await expect(picker.getByRole("button", { name: "Remove image" })).toBeVisible()
})

test("a mixed drop retains the accepted preview and explains the rejected file", async ({ page }) => {
	await page.goto(url("/file-upload"))
	const picker = page.locator("#media-upload .image-upload--component").first()
	await picker.locator("input").evaluate((input) => {
		const files = new DataTransfer()
		files.items.add(new File(["image"], "photo.png", { type: "image/png" }))
		files.items.add(new File(["text"], "notes.txt", { type: "text/plain" }))
		input.parentElement!.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer: files }))
	})
	await expect(picker.getByRole("button", { name: "Remove image" })).toBeVisible()
	await expect(page.locator("#media-upload").getByText("notes.txt is not an accepted file type.")).toHaveAttribute("role", "status")
})

test("reset cancels a search that has not reached its debounce deadline", async ({ page }) => {
	await page.goto(url("/data-view"))
	await page.clock.install()
	const demo = page.locator("#data-view")
	await demo.getByRole("button", { name: "Next page", exact: true }).click()
	await demo.getByPlaceholder("Search bookings…").fill("Riverside")
	await demo.getByRole("button", { name: "Reset view", exact: true }).click()
	/* Past the search debounce, which the reset must have cancelled. */
	await page.clock.runFor(500)
	await expect(demo.getByPlaceholder("Search bookings…")).toHaveValue("")
	await expect(demo).toContainText("1–3 of 6 bookings")
})

for (const theme of ["light", "dark"] as const) {
	test(`touch upload affordances and keyboard focus in ${theme}`, async ({ browser }) => {
		const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, colorScheme: theme })
		const page = await context.newPage()
		try {
			await page.goto(url("/file-upload"))
			await page.addStyleTag({ content: "* { transition-duration: 0s !important; }" })
			const picker = page.locator("#media-upload .image-upload--component").last()
			const overlay = picker.getByText("Change image", { exact: true })
			await expect(overlay.locator("..")).toHaveCSS("opacity", "1")
			const chooser = page.waitForEvent("filechooser")
			await picker.locator("input").tap()
			await (await chooser).setFiles([])
			await picker.getByRole("button", { name: "Remove image" }).click()
			await expect(picker.getByRole("button", { name: "Remove image" })).toHaveCount(0)
			await expect(picker.locator("input")).toBeFocused()
			// Named by its field first, then by what it does — not by the action alone.
			await expect(picker.locator("input")).toHaveAccessibleName("Cover image Drop an image here, or browse")
			const keyboardChooser = page.waitForEvent("filechooser")
			await page.keyboard.press("Enter")
			await (await keyboardChooser).setFiles([])
		} finally {
			await context.close()
		}
	})
}

test("booking pages, sorting, filtering, and empty recovery share the same records", async ({ page }) => {
	await page.goto(url("/data-view"))
	const demo = page.locator("#data-view")
	const rows = demo.locator("tbody tr")
	await expect(rows).toHaveCount(3)
	await expect(demo).toContainText("1–3 of 6 bookings")
	await demo.getByRole("button", { name: "Next page", exact: true }).click()
	await expect(demo).toContainText("4–6 of 6 bookings")
	await expect(rows.first()).toContainText("BK-4420")
	await demo.getByRole("button", { name: "Guests", exact: true }).click()
	await expect(demo).toContainText("1–3 of 6 bookings")
	// Numeric columns sort descending first, across the full record set.
	await expect(rows.first()).toContainText("BK-4422")
	await demo.getByPlaceholder("Search bookings…").fill("Riverside")
	await expect(rows).toHaveCount(2)
	await expect(demo).toContainText("2 bookings")
	await expect(demo.getByRole("navigation", { name: "Pagination" })).toHaveCount(0)
	await demo.getByPlaceholder("Search bookings…").fill("no-such-venue")
	await expect(demo).toContainText("No bookings match your filters")
	await demo.getByRole("button", { name: "Clear filters", exact: true }).last().click()
	await expect(rows).toHaveCount(3)
	await expect(demo.getByPlaceholder("Search bookings…")).toHaveValue("")
})
