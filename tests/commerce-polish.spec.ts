/** Commerce blocks keep code entry and order history working, pass axe, and swap the line-item table for a list on a phone. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

test("commerce blocks keep code entry and order history working", async ({ page }) => {
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
	const violations = (await new AxeBuilder({ page }).include('main').analyze()).violations
	expect(violations).toEqual([])
	expect(errors).toEqual([])
})

test("narrow screens swap the invoice line-item table for a stacked list", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 900 })
	await visitRoute(page, "/blocks-commerce")
	await expect(page.locator('#invoice-line-items').getByRole('table')).not.toBeVisible()
	await expect(page.locator('#invoice-line-items').getByText('€3,120.00', { exact: true }).filter({ visible: true })).toBeVisible()
})
