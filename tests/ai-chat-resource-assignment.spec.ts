/** AI chat send, stop and retry, and resource assignment's failure, retry and cancel flows. */
import { expect, test } from "@playwright/test"

import { url } from "./routes"

test("chat send, stop, and recovery keep the composer usable", async ({ page }) => {
	await page.goto(url("/ai-chat"))
	const demo = page.locator("#chat")
	const input = demo.getByPlaceholder("Ask anything…")

	await input.fill("Check the latest invoices")
	await demo.getByRole("button", { name: "Send message", exact: true }).click()
	await expect(input).toHaveValue("")
	await expect(demo.getByText("Check the latest invoices", { exact: true })).toBeVisible()
	await expect(demo.getByText("Thinking…", { exact: true })).toBeVisible()
	await expect(demo.getByText("Working", { exact: true })).toBeVisible()
	await expect(demo.getByRole("button", { name: "Stop generating", exact: true })).toBeEnabled()

	await demo.getByRole("button", { name: "Stop generating", exact: true }).click()
	await expect(demo.getByText("Generation stopped.", { exact: true })).toBeVisible()
	await expect(demo.getByText("Idle", { exact: true })).toBeVisible()
	await expect(demo.getByText("Thinking…", { exact: true })).toHaveCount(0)
	await expect(demo.getByRole("button", { name: "Send message", exact: true })).toBeDisabled()
	await input.fill("Try again with cents")
	await expect(demo.getByRole("button", { name: "Send message", exact: true })).toBeEnabled()
	await demo.getByRole("button", { name: "Send message", exact: true }).click()
	await expect(demo.getByText("Try again with cents", { exact: true })).toBeVisible()
	await expect(demo.getByText("Working", { exact: true })).toBeVisible()
	await expect(page.locator("#ai-chat-rules")).toContainText("stopped generation")
})

test("a rejected assignment keeps its selection and retries on a narrow screen", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url("/resource-assignment"))
	const demo = page.locator("#retry")
	await demo.getByRole("button", { name: "Assign", exact: true }).click()

	const dialog = page.getByRole("dialog", { name: "Choose a venue", exact: true })
	await expect(dialog).toBeVisible()
	await dialog.getByRole("radio", { name: /Riverside Rooms/ }).click()
	await dialog.getByRole("button", { name: "Assign venue", exact: true }).click()
	await expect(dialog.getByRole("button", { name: "Assign venue", exact: true })).toBeDisabled()
	await expect(dialog.getByRole("alert")).toContainText(
		"The assignment service is temporarily unavailable.",
	)
	await expect(dialog.getByRole("radio", { name: /Riverside Rooms/ })).toBeChecked()
	const dialogBox = await dialog.boundingBox()
	/* Within the 390px viewport, allowing 1px of rounding. */
	expect(dialogBox!.x).toBeGreaterThanOrEqual(0)
	expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(391)

	await dialog.getByRole("button", { name: "Assign venue", exact: true }).click()
	await expect(dialog).toHaveCount(0)
	await expect(demo).toContainText("Riverside Rooms")

	const box = await demo.boundingBox()
	expect(box!.x).toBeGreaterThanOrEqual(0)
	expect(box!.x + box!.width).toBeLessThanOrEqual(391)
})

test("cancelling assignment restores focus to the change trigger", async ({ page }) => {
	await page.goto(url("/resource-assignment"))
	const demo = page.locator("#assigned")
	const trigger = demo.getByRole("button", { name: "Change", exact: true })
	await trigger.click()
	const dialog = page.getByRole("dialog", { name: "Choose a venue", exact: true })
	await dialog.getByRole("button", { name: "Cancel", exact: true }).click()
	await expect(dialog).toHaveCount(0)
	await expect(trigger).toBeFocused()
})
