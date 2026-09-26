/** Commerce blocks keep code entry, order history and row geometry working, without overflow, at every width, density and theme. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

const sections = ["cart-summary", "tax-breakdown", "discount-stack", "code-entry", "order-status", "shipment-tracking", "refund-status", "invoice-header", "invoice-line-items", "invoice-mini", "address-card", "payment-method", "payment-timeline", "subscription-summary", "inventory-level", "upcoming-bookings", "loyalty-points"]

for (const theme of ["light", "dark"] as const) {
	for (const width of [1440, 390, 320]) {
		test(`commerce blocks at ${width}px in ${theme}`, async ({ page }, info) => {
			test.setTimeout(120_000)
			await page.setViewportSize({ width, height: 900 })
			await page.emulateMedia({ colorScheme: theme })
			const errors: string[] = []
			page.on("pageerror", error => errors.push(error.message))
			page.on("console", message => { if (message.type() === "error" || message.type() === "warning") errors.push(message.text()) })
			await visitRoute(page, "/blocks-commerce")
			await expect(page.locator('#shipment-tracking [data-status="current"]')).toContainText('In transit')
			const codes = page.locator("#code-entry")
			const field = codes.getByRole("textbox", { name: "Discount code", exact: true })
			await field.fill("INVALID")
			await field.press("Enter")
			await expect(field).toBeDisabled()
			await expect(codes.getByText("Code not found. Try WELCOME10.")).toBeVisible()
			await field.fill("WELCOME10")
			await field.press("Enter")
			await expect(codes.getByText("WELCOME10", { exact: true })).toBeVisible()
			await codes.getByRole("button", { name: "Remove", exact: true }).first().click()
			await expect(field).toBeVisible()
			await page.locator("#order-status").getByRole("button", { name: "Order history (5 events)" }).click()
			await expect(page.locator("#order-status").getByText("Order placed", { exact: true })).toBeVisible()
			for (const density of ["Compact", "Default", "Comfortable"]) {
				/* The docs Density select is hidden on narrow viewports, so switch it at desktop width. */
				await page.setViewportSize({ width: 1440, height: 900 })
				await page.getByLabel("Density", { exact: true }).selectOption({ label: density })
				await page.setViewportSize({ width, height: 900 })
				const commerceRows = page.locator('#cart-summary .item--component, #upcoming-bookings .item--component')
				await expect(commerceRows).toHaveCount(6)
				for (const row of await commerceRows.all()) {
					const rowBounds = await row.boundingBox()
					const columns = row.locator('[data-slot="item-content"]')
					const body = await columns.first().boundingBox()
					const price = await columns.last().boundingBox()
					/* Under a 320px row the price stacks below the body; from 320px it sits beside it. */
					if (rowBounds && body && price && rowBounds.width < 320) expect(Math.abs(price.x - body.x)).toBeLessThanOrEqual(1)
					if (rowBounds && body && price && rowBounds.width >= 320) {
						expect(price.x).toBeGreaterThanOrEqual(body.x + body.width)
						expect(price.y).toBeGreaterThanOrEqual(body.y - 1)
						expect(price.y).toBeLessThanOrEqual(body.y + body.height)
					}
				}
				for (const tile of await page.locator('#upcoming-bookings .date-block--component').all()) {
					const bounds = await tile.boundingBox()
					expect(bounds).not.toBeNull()
					/* A date tile stays roughly square. */
					expect(bounds!.height / bounds!.width).toBeLessThanOrEqual(1.1)
				}
				for (const id of sections) {
					const section = page.locator(`#${id}`)
					expect(await section.evaluate(el => el.scrollWidth - el.clientWidth), `${id} in ${density}`).toBeLessThanOrEqual(1)
					const clippedCells = await section.locator('.adaptive-grid--component').evaluateAll(grids => grids.flatMap(grid => {
						const bounds = grid.getBoundingClientRect()
						return [...grid.children].filter(cell => cell.getBoundingClientRect().right > bounds.right + 1).map(() => 'clipped grid cell')
					}))
					expect(clippedCells, `${id} in ${density}`).toEqual([])
				}
			}
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.getByLabel("Density", { exact: true }).selectOption({ label: "Default" })
			await page.setViewportSize({ width, height: 900 })
			for (const id of sections) {
				/* Captured for review, not compared. */
				await page.locator(`#${id}`).screenshot({ path: info.outputPath(`${id}.png`) })
			}
			if (width < 500) {
				/* Narrow screens swap the line-item table for a stacked list. */
				await expect(page.locator('#invoice-line-items').getByRole('table')).not.toBeVisible()
				await expect(page.locator('#invoice-line-items').getByText('€3,120.00', { exact: true }).filter({ visible: true })).toBeVisible()
			}
			const violations = (await new AxeBuilder({ page }).include('main').analyze()).violations
			expect(violations).toEqual([])
			expect(errors).toEqual([])
		})
	}
}
