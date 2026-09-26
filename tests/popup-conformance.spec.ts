/** Popup behaviour: popups inside a modal dialog, keyboard-only popover menus and comboboxes, checkbox menu rows, and ActionMenu label truncation. */
import { expect, test } from "@playwright/test"

import { url } from "./routes"

test("an iconless checkbox menu row toggles and shows its indicator", async ({ page }) => {
	await page.goto(url("/action-menu"))
	const trigger = page.getByRole("button", { name: "Custom trigger", exact: true })
	await trigger.click()
	const choice = page.getByRole("menuitemcheckbox", { name: "Show archived", exact: true })
	await expect(choice).toHaveAttribute("aria-checked", "false")
	await choice.click()
	await trigger.click()
	await expect(choice).toHaveAttribute("aria-checked", "true")
	await expect(choice.locator('[data-slot="dropdown-menu-checkbox-item-indicator"] svg')).toBeVisible()
	await page.keyboard.press("Escape")
	await expect(trigger).toBeFocused()
})

for (const width of [1280, 390]) {
	test(`fixed-width action labels truncate without clipping the popup at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 844 })
		await page.goto(url("/action-menu"))
		await page.getByRole("button", { name: "Fixed 280px", exact: true }).click()
		const menu = page.getByRole("menu", { name: "Fixed 280px", exact: true })
		await expect(menu).toHaveCSS("opacity", "1")
		const label = menu.getByRole("menuitem", { name: "A considerably longer label that would otherwise set the width", exact: true }).locator(".action-menu--item-label")
		await expect(label).toHaveCSS("text-overflow", "ellipsis")
		await expect(label).toHaveCSS("overflow", "hidden")
		const bounds = await label.evaluate((el) => ({ width: el.clientWidth, textWidth: el.scrollWidth }))
		expect(bounds.textWidth).toBeGreaterThan(bounds.width)
		const box = (await menu.boundingBox())!
		expect(box.width).toBeCloseTo(280, 0)
		expect(box.x).toBeGreaterThanOrEqual(0)
		expect(box.x + box.width).toBeLessThanOrEqual(width)
	})
}

/*
 * A modal <dialog> sits in the top layer and makes the rest of the document inert, so the
 * overlay hosts its own portal target for popups opened inside it.
 */
test("popups opened inside a modal dialog render inside it and stay operable", async ({ page }) => {
	await page.goto(url("/overlay"))
	await page.locator("#dialog-popups").scrollIntoViewIfNeeded()
	await page.getByRole("button", { name: "Invite member" }).click()
	const dialog = page.locator("dialog[open]")
	await expect(dialog).toBeVisible()

	await dialog.getByRole("combobox").click()
	const listbox = page.getByRole("listbox")
	await expect(listbox).toBeVisible()
	expect(await listbox.evaluate((el) => !!el.closest("dialog"))).toBe(true)
	await page.getByRole("option", { name: "Owner" }).click()
	await expect(dialog.getByRole("combobox")).toHaveText(/Owner/)

	await dialog.getByRole("button", { name: /More/ }).click()
	const menu = page.getByRole("menu")
	await expect(menu).toBeVisible()
	const hitsItem = await menu.evaluate((el) => {
		const item = el.querySelector('[role="menuitem"]')!.getBoundingClientRect()
		return !!document.elementFromPoint(item.x + item.width / 2, item.y + item.height / 2)?.closest('[role="menuitem"]')
	})
	expect(hitsItem, "the menu must be hit-testable above the modal").toBe(true)

	/* Escape closes the top layer only, and focus returns to the menu's trigger. */
	await page.keyboard.press("Escape")
	await expect(menu).toBeHidden()
	await expect(dialog).toBeVisible()
	await expect(dialog.getByRole("button", { name: /More/ })).toBeFocused()
})

/* With no search field, focus must still land inside the command root that owns the arrow keys. */
test("a searchless popover menu is keyboard operable and closes on a single pick", async ({ page }) => {
	await page.goto(url("/popover-menu"))
	const trigger = page.getByRole("button", { name: "No search" })
	await trigger.focus()
	await page.keyboard.press("Enter")
	const popup = page.locator('[data-slot="popover-content"]')
	await expect(popup).toBeVisible()
	const highlighted = () => popup.locator('[cmdk-item][data-selected="true"]').textContent()
	const first = await highlighted()
	await page.keyboard.press("ArrowDown")
	expect(await highlighted()).not.toBe(first)
	await page.keyboard.press("Enter")
	await expect(popup).toBeHidden()
	await expect(trigger).toBeFocused()
})

/* Base UI drives the combobox list from an input, so the trigger-only shape searches inside its popup. */
test("a trigger-only combobox is operable from the keyboard through its popup search", async ({ page }) => {
	await page.goto(url("/combobox"))
	const trigger = page.locator('#combobox-select [data-slot="combobox-trigger"]').first()
	await trigger.focus()
	await page.keyboard.press("Enter")
	await expect(page.locator(":focus")).toHaveAttribute("aria-label", "Search countries")
	await page.keyboard.type("aus")
	await page.keyboard.press("ArrowDown")
	await page.keyboard.press("Enter")
	await expect(trigger).toHaveText(/Australia/)
	await expect(trigger).toBeFocused()
})
