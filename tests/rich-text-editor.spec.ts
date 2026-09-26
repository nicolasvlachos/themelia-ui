/** Rich text editor toolbar alignment and roving focus, plus TipTap undo, formatting, source mode, paste and mentions. */
import { expect, test } from "@playwright/test"

import { visitRoute } from "./routes"

for (const density of ["compact", "default", "comfortable"] as const) {
	test(`toolbar separators stay centered with their controls at ${density} density`, async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 })
		await visitRoute(page, "/rich-text-editor")
		await page.getByRole("combobox", { name: "Density", exact: true }).selectOption(density)

		for (const width of [1440, 390, 320]) {
			await page.setViewportSize({ width, height: 900 })
			for (const [id, label] of [["editor", "Source code"], ["editor-compact", "Insert reference"]] as const) {
				const demo = page.locator(`#${id}`)
				const divider = await demo.getByRole("separator").boundingBox()
				const control = demo.getByRole("button", { name: label, exact: true })
				const button = await control.boundingBox()
				const toolbar = await demo.getByRole("toolbar").boundingBox()
				expect(divider).not.toBeNull()
				expect(button).not.toBeNull()
				expect(toolbar).not.toBeNull()
				expect(Math.abs(divider!.y + divider!.height / 2 - button!.y - button!.height / 2),
					`${id} divider must share its control's row and center at ${width}px`,
				).toBeLessThanOrEqual(1)
				expect(divider!.x).toBeGreaterThanOrEqual(toolbar!.x)
				expect(button!.x + button!.width).toBeLessThanOrEqual(toolbar!.x + toolbar!.width)

				await control.focus()
				await control.press("ArrowLeft")
				await expect(demo.getByRole("button", { name: "Redo", exact: true })).toBeFocused()
				await page.keyboard.press("ArrowRight")
				await expect(control).toBeFocused()
			}
		}
	})
}

test("TipTap is the default and typing has real undo and redo states", async ({ page }) => {
	await visitRoute(page, "/rich-text-editor")
	const demo = page.locator("#editor-compact")
	const editor = demo.getByRole("textbox", { name: "Rich text editor", exact: true })
	await expect(editor).toHaveClass(/ProseMirror/)
	const undo = demo.getByRole("button", { name: "Undo", exact: true })
	const redo = demo.getByRole("button", { name: "Redo", exact: true })
	await expect(undo).toBeDisabled()
	await expect(redo).toBeDisabled()
	await editor.fill("A recoverable draft")
	await expect(undo).toBeEnabled()
	await undo.click()
	await expect(editor).toHaveText("")
	await expect(undo).toBeDisabled()
	await expect(redo).toBeEnabled()
	await redo.click()
	await expect(editor).toHaveText("A recoverable draft")
	await expect(redo).toBeDisabled()
})

test("formatting changes the selected document and typing preserves the caret", async ({ page }) => {
	await visitRoute(page, "/rich-text-editor")
	const demo = page.locator("#editor-compact")
	const editor = demo.getByRole("textbox", { name: "Rich text editor", exact: true })
	await editor.fill("Format this")
	await editor.press("ControlOrMeta+A")
	await demo.getByRole("button", { name: "Bold", exact: true }).click()
	await expect(editor.locator("strong")).toHaveText("Format this")
	await demo.getByRole("button", { name: "Italic", exact: true }).click()
	await expect(editor.locator("em")).toHaveText("Format this")
	await editor.press("ArrowRight")
	await editor.pressSequentially(" here")
	await expect(editor).toHaveText("Format this here")
	await demo.getByRole("button", { name: "Bullet list", exact: true }).click()
	await expect(editor.locator("ul li")).toHaveText("Format this here")
})

test("source mode keeps one live editor and formatting works after repeated switches", async ({ page }) => {
	await visitRoute(page, "/rich-text-editor")
	const demo = page.locator("#editor")
	const editor = demo.getByRole("textbox", { name: "Rich text editor", exact: true })
	const source = demo.getByRole("button", { name: "Source code", exact: true })
	for (const text of ["First source", "Second source"]) {
		await source.click()
		await expect(demo.getByRole("button", { name: "Bold", exact: true })).toBeDisabled()
		await demo.getByRole("textbox", { name: "HTML source" }).fill(`<p>${text}</p>`)
		await source.click()
		await expect(editor).toHaveText(text)
		await expect(demo.locator(".ProseMirror")).toHaveCount(1)
		await editor.press("ControlOrMeta+A")
		await demo.getByRole("button", { name: "Bold", exact: true }).click()
		await expect(editor.locator("strong")).toHaveText(text)
	}
	await source.click()
	await demo.getByRole("textbox", { name: "HTML source" }).fill("<ul><li><p>First item</p></li><li><p>Second item</p></li></ul>")
	await source.click()
	const rendered = page.locator("#editor-output")
	await expect(rendered.locator("li")).toHaveText(["First item", "Second item"])
	for (const surface of [editor, rendered]) {
		await expect(surface.locator("li > p").first()).toHaveCSS("margin-block-start", "0px")
		await expect(surface.locator("li > p").last()).toHaveCSS("margin-block-end", "0px")
	}
})

test("imperative insertion and controlled reset update the same TipTap document", async ({ page }) => {
	await visitRoute(page, "/rich-text-editor")
	const demo = page.locator("#editor-compact")
	const editor = demo.getByRole("textbox", { name: "Rich text editor", exact: true })
	await demo.getByRole("button", { name: "Insert reference", exact: true }).click()
	await expect(editor).toHaveText("@")
	await editor.pressSequentially("Maria")
	await expect(editor).toHaveText("@Maria")
	await demo.getByRole("button", { name: "Post", exact: true }).click()
	await expect(editor).toHaveText("")
	await expect(demo.getByRole("button", { name: "Post", exact: true })).toBeDisabled()
	await editor.fill("Next draft")
	await expect(editor).toHaveText("Next draft")
})

test("formatted paste remains editable and preserves inline mention identities", async ({ page }) => {
	await visitRoute(page, "/rich-text-editor")
	const editor = page.locator("#editor-compact").getByRole("textbox", { name: "Rich text editor", exact: true })
	await editor.focus()
	await editor.evaluate((node) => {
		const data = new DataTransfer()
		data.setData("text/html", '<p>Hello <strong>team</strong> <span data-ref-id="user:17" data-ref-kind="user" data-ref-tone="info" contenteditable="false">@Maria</span></p>')
		data.setData("text/plain", "Hello team @Maria")
		const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true })
		// Firefox discards constructor-supplied data on synthetic clipboard events.
		Object.defineProperty(event, "clipboardData", { value: data })
		node.dispatchEvent(event)
	})
	await expect(editor.locator("strong")).toHaveText("team")
	await expect(editor.locator('[data-ref-id="user:17"]')).toHaveText("@Maria")
	await expect(editor.locator('[data-ref-id="user:17"]')).toHaveAttribute("contenteditable", "false")
	await editor.press("ControlOrMeta+End")
	await editor.pressSequentially(" welcome")
	await expect(editor).toContainText("welcome")
})

test("comment mentions replace the trigger and survive posting", async ({ page }) => {
	await visitRoute(page, "/comments")
	const demo = page.locator("#comments")
	const editor = demo.getByRole("textbox", { name: "Write a comment…", exact: true })
	await editor.fill("Please ask @Ma")
	await page.getByRole("option", { name: /Maria Petrova/ }).click()
	const mention = editor.locator('[data-ref-id="user:1"]')
	await expect(mention).toHaveText("@Maria Petrova")
	await expect(mention).toHaveAttribute("contenteditable", "false")
	await expect(editor).not.toContainText("@Ma@")
	await demo.getByRole("button", { name: "Post comment", exact: true }).click()
	await expect(editor).toHaveText("")
	await expect(demo.locator('[data-slot="comment"]').filter({ hasText: "Please ask" }).locator('[data-ref-id="user:1"]')).toHaveText("Maria Petrova")
})

test("existing mention chips are boundaries when inserting another mention", async ({ page }) => {
	await visitRoute(page, "/comments")
	const demo = page.locator("#comments")
	const editor = demo.getByRole("textbox", { name: "Write a comment…", exact: true })
	await editor.focus()
	await editor.evaluate((node) => {
		const data = new DataTransfer()
		data.setData("text/html", '<p>Hello <span data-ref-id="user:1" data-ref-kind="user" contenteditable="false">@Maria</span></p>')
		const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true })
		Object.defineProperty(event, "clipboardData", { value: data })
		node.dispatchEvent(event)
	})
	await expect(editor).toHaveText("Hello @Maria")
	await expect(page.getByRole("option", { name: /Maria Petrova/ })).toHaveCount(0)
	await editor.pressSequentially(" @Ma")
	await page.getByRole("option", { name: /Marcus Webb/ }).click()
	await expect(editor).toHaveText("Hello @Maria @Marcus Webb")
	await expect(editor.locator('[data-ref-id="user:1"]')).toHaveText("@Maria")
	await expect(editor.locator('[data-ref-id="user:2"]')).toHaveText("@Marcus Webb")
})

test("leaving a comment editor dismisses its inline mention suggestions", async ({ page }) => {
	await visitRoute(page, "/comments")
	const editor = page.locator("#comments").getByRole("textbox", { name: "Write a comment…", exact: true })
	await editor.fill("@Ma")
	await expect(page.getByRole("option", { name: /Maria Petrova/ })).toBeVisible()
	await page.getByRole("button", { name: "Search components", exact: true }).focus()
	await expect(page.getByRole("option", { name: /Maria Petrova/ })).toHaveCount(0)
	await expect(editor).toHaveText("@Ma")
})
