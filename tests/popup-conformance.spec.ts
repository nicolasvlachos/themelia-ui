/** Shared popup geometry and ActionMenu label overflow contracts. */
import { expect, test } from "@playwright/test"

import { url } from "./routes"



/* Custom openers by route; any other route clicks the first `[aria-haspopup]`. */
const OPEN: Record<string, (page: import("@playwright/test").Page) => Promise<void>> = {
	/* Already on screen — the palette is the example. */
	"/command": async () => {},
}

/** Open the first popup on the page and return its rows' resolved geometry. */
async function openFirstPopup(page: import("@playwright/test").Page, route?: string) {
	const open = route ? OPEN[route] : undefined
	if (open) await open(page)
	else await page.locator("main [aria-haspopup]").first().click()
	/* Closed, portal-mounted overlays may precede the popup under test in DOM order. */
	const popup = page.locator("[role=menu]:visible, [role=listbox]:visible").first()
	await popup.waitFor({ state: "visible" })
	return popup.evaluate((popup) => {
		const row = popup.querySelector("[role=menuitem], [role=option]")
		if (!row) return null
		const cs = getComputedStyle(row)
		return {
			minHeight: cs.minHeight,
			paddingBlock: `${cs.paddingTop}/${cs.paddingBottom}`,
			paddingInlineStart: cs.paddingLeft,
			borderRadius: cs.borderRadius,
		}
	})
}

test("every popup family resolves one row geometry", async ({ page }) => {
	/*
	 * One route per CSS module that draws a row; action, context and menubar menus all share
	 * `dropdown-menu.module.css`. The combobox opens from its trigger, which carries
	 * `aria-haspopup`.
	 */
	const families = ["/action-menu", "/dropdown-menu", "/select", "/command", "/combobox"]
	const seen: Record<string, unknown> = {}

	for (const route of families) {
		await page.goto(url(route))
		seen[route] = await openFirstPopup(page, route)
		expect(seen[route], `${route} opened no popup`).not.toBeNull()
	}

	const [first, ...rest] = families
	for (const route of rest) {
		expect(seen[route], `${route} disagrees with ${first} about the row`).toEqual(seen[first])
	}
})

test("iconless menu rows use the normal inset and preserve their checkbox", async ({ page, browserName }) => {
	/* Linux WebKit only: the label sits 1.8px inside the inset; not reproducible on macOS. */
	test.fixme(browserName === "webkit" && process.platform === "linux", "label 1.8px off the inset on Linux WebKit")
	await page.goto(url("/action-menu"))
	const trigger = page.getByRole("button", { name: "Custom trigger", exact: true })
	await trigger.click()
	const choice = page.getByRole("menuitemcheckbox", { name: "Show archived", exact: true })
	const offset = await choice.evaluate((row) => {
		const label = row.querySelector(".action-menu--item-label")!
		return {
			actual: label.getBoundingClientRect().left - row.getBoundingClientRect().left,
			expected: parseFloat(getComputedStyle(row).paddingLeft),
		}
	})
	expect(offset.actual).toBeCloseTo(offset.expected, 0)
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

test("every popup module follows changes to the shared row tokens", async ({ page }) => {
	for (const route of ["/action-menu", "/dropdown-menu", "/select", "/command", "/combobox"]) {
		await page.goto(url(route))
		await page.addStyleTag({ content: `
			:root, [data-ui-scope], [data-density], [data-theme], .light, .dark {
				--row-px: 23px; --menu-row-py: 7px;
				--menu-row-min-h: 47px; --radius-sm: 13px;
			}
			*, *::before, *::after { transition: none !important; }
		` })
		expect(await openFirstPopup(page, route), route).toEqual({
			minHeight: "47px", paddingBlock: "7px/7px", paddingInlineStart: "23px", borderRadius: "13px",
		})
	}
})

test("popup families take the container radius", async ({ page }) => {
	const families = {
		"/action-menu": "[data-slot='dropdown-menu-content']",
		"/dropdown-menu": "[data-slot='dropdown-menu-content']",
		"/select": "[data-slot='select-content']",
		"/combobox": "[data-slot='combobox-popup']",
	}
	for (const [route, selector] of Object.entries(families)) {
		await page.goto(url(route))
		await page.addStyleTag({ content: `
			:root, [data-ui-scope], [data-density], [data-theme], .light, .dark {
				--radius: 14px; --radius-sm: 9px;
			}
		` })
		await page.locator("main [aria-haspopup]").first().click()
		const popup = page.locator(`${selector}:visible`).first()
		await expect(popup).toHaveCSS("border-radius", "14px")
		await page.keyboard.press("Escape")
	}
})

test("a submenu keeps the container radius and separates from its parent", async ({ page }) => {
	await page.goto(url("/dropdown-menu"))
	await page.addStyleTag({ content: `
		:root, [data-ui-scope], [data-density], [data-theme], .light, .dark {
			--radius: 14px;
		}
		*, *::before, *::after { animation: none !important; transition: none !important; }
	` })
	await page.getByRole("button", { name: "Options", exact: true }).click()
	await page.getByRole("menuitem", { name: "Sort by", exact: true }).hover()
	const parent = page.locator("[data-slot='dropdown-menu-content']:visible").first()
	const child = page.locator("[data-slot='dropdown-menu-sub-content']:visible")
	await expect(parent).toHaveCSS("border-radius", "14px")
	await expect(child).toHaveCSS("border-radius", "14px")
	/* DropdownMenuSubContent's offsets leave the submenu 4px clear of its parent. */
	const gap = await Promise.all([parent.boundingBox(), child.boundingBox()]).then(([a, b]) => {
		if (!a || !b) return -1
		return Math.max(b.x - (a.x + a.width), a.x - (b.x + b.width))
	})
	expect(gap).toBeCloseTo(4, 0)
})

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
