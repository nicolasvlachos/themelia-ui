/** Comment and activity recovery flows (empty log, failed attachment, failed submit, failed action) at phone widths. */
import { expect, test } from "@playwright/test"

import { url } from "./routes"

test("an empty activity log keeps its composer available for the first comment", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 844 })
	await page.goto(url("/activities"))
	const demo = page.locator("#activity-log")
	await demo.getByRole("button", { name: "Show empty log", exact: true }).click()
	const editor = demo.getByRole("textbox", { name: "Add a note to this booking…", exact: true })
	await expect(editor).toBeVisible()
	await editor.fill("First note on this booking")
	await demo.getByRole("button", { name: "Post comment", exact: true }).click()
	await expect(demo.locator('[data-slot="comment"]')).toContainText("First note on this booking")
	await expect(editor).toHaveText("")
	/* Within the 320px viewport, allowing 1px of rounding. */
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321)
})

test("a failed comment attachment recovers on retry at phone width", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url("/comments"))
	const demo = page.locator("#comments")
	await expect(demo).toBeVisible({ timeout: 3000 })

	await demo.locator('input[type="file"]').setInputFiles({
		name: "fail-invoice.pdf",
		mimeType: "application/pdf",
		buffer: Buffer.from("invoice"),
	})

	const attachment = demo.locator('[data-slot="comment-attachment"]').filter({ hasText: "fail-invoice.pdf" })
	await expect(attachment).toHaveAttribute("data-status", "failed")
	const retry = attachment.getByRole("button", { name: "Retry", exact: true })
	await retry.scrollIntoViewIfNeeded()
	await expect(retry).toBeInViewport()
	await retry.click()
	await expect(attachment).toHaveAttribute("data-status", "uploaded")
	await expect(retry).toHaveCount(0)

	const box = await demo.boundingBox()
	/* Within the 390px viewport, allowing 1px of rounding. */
	expect(box!.x).toBeGreaterThanOrEqual(0)
	expect(box!.x + box!.width).toBeLessThanOrEqual(391)
})

test("a failed comment submit retains its draft and retries after pending", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url("/comments"))
	const demo = page.locator("#comments-submit-recovery")
	await expect(demo).toBeVisible({ timeout: 3000 })
	const editor = demo.getByRole("textbox", { name: "Write a comment…" })
	await editor.fill("Keep this draft")

	await demo.getByRole("button", { name: "Post comment", exact: true }).click()
	const pending = demo.getByRole("button", { name: "Posting…", exact: true })
	await expect(pending).toBeDisabled()
	await expect(demo.getByRole("alert")).toHaveText("The comment could not be saved. Try again.")
	await expect(editor).toHaveText("Keep this draft")

	const retry = demo.getByRole("button", { name: "Post comment", exact: true })
	await expect(retry).toBeEnabled()
	await retry.click()
	await expect(pending).toBeDisabled()
	await expect(demo.locator('[data-slot="comment"]')).toContainText("Keep this draft")
	await expect(editor).toHaveText("")
})

test("a failed activity action recovers and remains reachable at phone width", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url("/activities"))
	const demo = page.locator("#activity-feed")
	await expect(demo).toBeVisible({ timeout: 3000 })

	const resend = demo.getByRole("button", { name: "Resend", exact: true })
	await resend.scrollIntoViewIfNeeded()
	await expect(resend).toBeInViewport()
	await resend.click()

	await expect(demo.getByText("The confirmation was delivered on retry.", { exact: true })).toBeVisible()
	await expect(resend).toHaveCount(0)
	const box = await demo.boundingBox()
	expect(box!.x).toBeGreaterThanOrEqual(0)
	expect(box!.x + box!.width).toBeLessThanOrEqual(391)
})
