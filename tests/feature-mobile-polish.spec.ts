/** Feature polish at desktop and phone widths: DataView and filter sheets, mentions, activities, reflow, text-pair leading and popup density. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
	test.describe(`${viewport.width}px feature polish`, () => {
		test.use({ viewport })
		test("DataView filters apply and clear without losing the table", async ({ page }, info) => {
			await visitRoute(page, "/data-view")
			const example = page.locator("#data-view")
			if (viewport.width < 768) {
				await expect(example.getByRole("combobox", { name: "Saved views", exact: true })).toBeVisible()
				await example.getByRole("button", { name: "Filters", exact: true }).click()
				const sheet = page.getByRole("dialog", { name: "Filters", exact: true })
				await expect(sheet).toHaveCSS("opacity", "1")
				const bounds = await sheet.boundingBox()
				/* The sheet takes at most 90% of the viewport width. */
				expect(bounds!.width).toBeLessThanOrEqual(viewport.width * .9 + 1)
				expect(bounds!.x).toBeGreaterThanOrEqual(viewport.width * .05 - 1)
				/* Captured for review, not compared. */
				await page.screenshot({ path: info.outputPath("mobile-filters.png") })
				await sheet.getByRole("button", { name: "Status Any" }).click()
				await sheet.getByRole("option", { name: "Confirmed", exact: true }).click()
				await sheet.getByRole("button", { name: "Apply", exact: true }).click()
				await expect(sheet.getByRole("button", { name: /Status .*Confirmed/ })).toBeFocused()
				await expect(sheet).toContainText("1 filter applied")
				expect((await new AxeBuilder({ page }).include("dialog[open]").analyze()).violations).toEqual([])
				await sheet.getByRole("button", { name: "Done", exact: true }).click()
				await expect(example.getByRole("button", { name: "Filters 1", exact: true })).toBeFocused()
				await expect(example.getByRole("table")).not.toContainText("BK-4418")
				await example.getByRole("button", { name: "Filters 1", exact: true }).click()
				await sheet.getByRole("button", { name: "Clear: Status" }).click()
				await expect(sheet).toContainText("No filters applied")
				await page.keyboard.press("Escape")
				await expect(example.getByRole("table")).toContainText("The Old Granary")
			} else {
				await example.getByRole("button", { name: "Edit: Status" }).click()
				await page.getByRole("option", { name: "Confirmed", exact: true }).click()
				await page.getByRole("button", { name: "Apply", exact: true }).click()
				await expect(example.getByRole("table")).not.toContainText("BK-4418")
				await example.getByRole("button", { name: "Clear filters" }).click()
				await expect(example.getByRole("table")).toContainText("The Old Granary")
			}
			await example.getByRole("textbox", { name: "Search", exact: true }).fill("does-not-exist")
			await expect(example.getByRole("table")).not.toContainText("Marlow Hall")
			await example.getByRole("textbox", { name: "Search", exact: true }).fill("")
			await expect(example.getByRole("table")).toContainText("Marlow Hall")
		})

		test("mentions keep the caret, navigate results and support button search", async ({ page }, info) => {
			await visitRoute(page, "/mentions")
			const example = page.locator("#mention-inline")
			const editor = example.getByRole("textbox")
			await editor.fill("@")
			const inline = page.locator(".mention-inline-suggestions--component")
			await expect(inline.getByRole("option")).toHaveCount(3)
			await expect(editor).toBeFocused()
			await editor.press("ArrowDown")
			await expect(inline.getByRole("option", { name: /Marcus Webb/ })).toHaveAttribute("aria-selected", "true")
			await expect(editor).toBeFocused()
			await page.screenshot({ path: info.outputPath("mentions-inline.png") })
			const inset = await inline.evaluate(panel => {
				const surface = panel.getBoundingClientRect()
				const row = panel.querySelector("[role=option]")!.getBoundingClientRect()
				return { height: row.height, left: row.left - surface.left, right: surface.right - row.right, panelRight: surface.right }
			})
			/* Rows stay compact and inset at least 8px from the panel edges. */
			expect(inset.height).toBeLessThan(60)
			expect(inset.left).toBeGreaterThanOrEqual(8)
			expect(inset.right).toBeGreaterThanOrEqual(8)
			expect(inset.panelRight).toBeLessThanOrEqual(viewport.width)
			expect((await new AxeBuilder({ page }).include("#mention-inline").analyze()).violations).toEqual([])
			await editor.press("Enter")
			await expect(editor).toContainText("Marcus Webb")
			await expect(inline).toHaveCount(0)
			await editor.fill("@zzzzzz")
			await expect(inline).toContainText("No matches.")
			await editor.press("Escape")
			await expect(inline).toHaveCount(0)
			await expect(editor).toBeFocused()
			await editor.fill("")
			await example.getByRole("button", { name: "Insert reference", exact: true }).click()
			const picker = page.locator(".mention-picker--component")
			const search = picker.getByRole("combobox")
			await expect(search).toBeFocused()
			await search.fill("Alice")
			await expect(picker.getByRole("option", { name: /Alice Mercer/ })).toBeVisible()
			await page.screenshot({ path: info.outputPath("mentions-picker.png") })
			await search.press("ArrowDown")
			await search.press("Enter")
			await expect(picker).toHaveCount(0)
			await expect(editor).toContainText("Alice Mercer")
		})

		test("activities expand facts, run actions and preserve state during recovery", async ({ page }, info) => {
			await visitRoute(page, "/activities")
			const feed = page.locator("#activity-feed")
			const row = feed.locator('[data-slot="activity-row"]').first()
			await expect(row).not.toContainText("Deposit due")
			await row.getByRole("button", { name: "Show details" }).click()
			await expect(row).toContainText("Deposit due")
			await expect(row.getByRole("button", { name: "Hide details" })).toHaveAttribute("aria-controls", /.+/)
			await page.screenshot({ path: info.outputPath("activity-expanded.png") })
			expect((await new AxeBuilder({ page }).include("#activity-feed").analyze()).violations).toEqual([])
			await row.getByRole("button", { name: "Hide details" }).click()
			await feed.getByRole("button", { name: "Resend", exact: true }).click()
			await expect(feed).toContainText("The confirmation was delivered on retry.")
			await feed.getByRole("combobox", { name: "Feed state" }).click()
			await page.getByRole("option", { name: "Refresh failed", exact: true }).click()
			await expect(feed.getByRole("alert")).toBeVisible()
			await feed.getByRole("button", { name: "Try again" }).click()
			await expect(feed.getByRole("alert")).toHaveCount(0)
			if (viewport.width < 768) {
				const comment = page.locator("#activity-log .comment-item--component").first()
				await comment.scrollIntoViewIfNeeded()
				const outer = await comment.boundingBox()
				const content = await comment.locator(".comment-content--component").boundingBox()
				expect(content!.width).toBeGreaterThan(80)
				expect(content!.x + content!.width).toBeLessThanOrEqual(outer!.x + outer!.width + 1)
				await comment.getByRole("button", { name: "Comment actions", exact: true }).click()
				await expect(page.getByRole("menuitem", { name: "Delete", exact: true })).toBeVisible()
				await page.keyboard.press("Escape")
				await page.screenshot({ path: info.outputPath("activity-log-mobile.png"), animations: "disabled" })
			}
			for (const density of ["compact", "default", "rich"]) {
				await feed.getByRole("radio", { name: density, exact: true }).click()
				await page.screenshot({ path: info.outputPath(`activity-${density}.png`) })
			}
		})
	})
}

test("mobile sheet preserves drafts and supports async, range, tag and date editors", async ({ page }, info) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await visitRoute(page, "/filters")
	await page.getByRole("button", { name: "Filters 1", exact: true }).click()
	const sheet = page.getByRole("dialog", { name: "Filters", exact: true })
	await sheet.getByRole("button", { name: /Status .*Confirmed/ }).click()
	await sheet.getByRole("option", { name: "Pending", exact: true }).click()
	await sheet.getByRole("button", { name: "Back to filters" }).click()
	await expect(sheet.getByRole("button", { name: /Status .*Confirmed/ })).not.toContainText("Pending")
	await sheet.getByRole("button", { name: "Venue Any" }).click()
	await sheet.getByRole("combobox").fill("Riverside")
	await sheet.getByRole("option", { name: "Riverside Rooms", exact: true }).click()
	await sheet.getByRole("button", { name: "Apply", exact: true }).click()
	await expect(sheet.getByRole("button", { name: /Venue .*Riverside Rooms/ })).toBeFocused()
	await sheet.getByRole("button", { name: "Guests Any" }).click()
	await sheet.getByRole("spinbutton", { name: "Min" }).fill("20")
	await sheet.getByRole("spinbutton", { name: "Max" }).fill("80")
	await sheet.getByRole("button", { name: "Apply", exact: true }).click()
	await sheet.getByRole("button", { name: /Guests .*20, 80/ }).click()
	await sheet.getByRole("button", { name: "Comparison", exact: true }).click()
	await page.getByRole("menuitemradio", { name: "greater than", exact: true }).click()
	await expect(sheet.getByRole("spinbutton", { name: "Max" })).toHaveCount(0)
	await sheet.getByRole("button", { name: "Apply", exact: true }).click()
	await expect(sheet.getByRole("button", { name: "Guests greater than 20" })).toBeVisible()
	await sheet.getByRole("button", { name: "Tag Any" }).click()
	await sheet.getByPlaceholder("Add a tag and press Enter").fill("priority")
	await sheet.getByPlaceholder("Add a tag and press Enter").press("Enter")
	await sheet.getByRole("button", { name: "Apply", exact: true }).click()
	await expect(sheet.getByRole("button", { name: /Tag .*priority/ })).toBeVisible()
	await sheet.getByRole("button", { name: "Date Any" }).click()
	await sheet.getByRole("combobox", { name: "Choose a date" }).click()
	await expect(page.getByRole("grid").first()).toBeVisible()
	await expect(page.getByRole("grid")).toHaveCount(1)
	const calendarBounds = await page.getByRole("grid").boundingBox()
	expect(calendarBounds!.x + calendarBounds!.width).toBeLessThanOrEqual(390)
	await page.screenshot({ path: info.outputPath("filter-date-mobile.png"), animations: "disabled" })
	// Base UI uses visually hidden role=button focus sentinels for WebKit.
	// Audit the actual calendar controls, excluding only those library sentinels.
	expect((await new AxeBuilder({ page }).include("dialog[open]").exclude("[data-base-ui-focus-guard]").analyze()).violations).toEqual([])
	await page.keyboard.press("Escape")
	await expect(sheet).toBeVisible()
	await sheet.getByRole("button", { name: "Back to filters" }).click()
	await sheet.getByRole("button", { name: "Clear filters", exact: true }).click()
	await expect(sheet).toContainText("No filters applied")
	await sheet.getByRole("button", { name: "Done", exact: true }).click()
	await page.getByRole("button", { name: "Show pending state" }).click()
	await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeDisabled()
	await page.getByRole("button", { name: "Resume filtering" }).click()
	await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeEnabled()
})

for (const route of ["/data-view", "/filters", "/activities", "/mentions", "/comments"]) {
	test(`feature examples reflow and remain accessible: ${route}`, async ({ page }, info) => {
		const errors: string[] = []
		page.on("pageerror", error => errors.push(error.message))
		for (const [width, theme] of [[1280, "light"], [390, "dark"]] as const) {
			await page.setViewportSize({ width, height: 900 })
			await page.emulateMedia({ colorScheme: theme })
			await visitRoute(page, route)
			const examples = page.locator("main section[id]").filter({ has: page.getByRole("button", { name: "Preview", exact: true }) })
			for (const example of await examples.all()) {
				await example.scrollIntoViewIfNeeded()
				const box = await example.boundingBox()
				expect(box!.width).toBeGreaterThan(100)
				expect(box!.x).toBeGreaterThanOrEqual(0)
				expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1)
			}
			expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
			expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([])
			await page.locator("main").screenshot({ path: info.outputPath(`${width}-${theme}.png`), animations: "disabled" })
		}
		expect(errors).toEqual([])
	})
}

test("filter header and row text pairs keep tight leading with a small header gap", async ({ page }, info) => {
	await page.setViewportSize({ width: 390, height: 844 })
	for (const theme of ["light", "dark"] as const) {
		await page.emulateMedia({ colorScheme: theme })
		for (const density of ["compact", "default", "comfortable"]) {
			await visitRoute(page, "/data-view")
			await page.evaluate(value => document.documentElement.setAttribute("data-density", value), density)
			await page.locator("#data-view").getByRole("button", { name: "Filters", exact: true }).click()
			const sheet = page.getByRole("dialog", { name: "Filters", exact: true })
			await expect(sheet).toHaveCSS("opacity", "1")
			const gaps = await sheet.evaluate(root => {
				// Measure rendered text, including nested spans; CSS gap alone misses line-box space.
				const textBounds = (element: Element) => {
					const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
					const rects: DOMRect[] = []
					while (walker.nextNode()) {
						if (!walker.currentNode.textContent?.trim()) continue
						const range = document.createRange()
						range.selectNodeContents(walker.currentNode)
						rects.push(range.getBoundingClientRect())
					}
					return { top: Math.min(...rects.map(rect => rect.top)), bottom: Math.max(...rects.map(rect => rect.bottom)) }
				}
				const pairs = [root.querySelector('[data-slot="overlay-header"]')!, ...root.querySelectorAll('[data-slot="item-content"]')]
				return pairs.map(pair => ({
					visible: textBounds(pair.children[1]).top - textBounds(pair.children[0]).bottom,
					gap: parseFloat(getComputedStyle(pair).rowGap) || 0,
				}))
			})
			const lineGaps = gaps.map(pair => pair.visible - pair.gap)
			expect(gaps[0].gap, "surface header has a little breathing room").toBeGreaterThan(0)
			/*
			 * A pixel of overlap is allowed: Geist's line box (ascent + descent) is a little taller
			 * than its tight leading, with no ink touching. More than 3px apart and the pair reads as two.
			 */
			for (const gap of lineGaps) {
				expect(gap, `${theme}/${density}: text lines must remain distinct`).toBeGreaterThanOrEqual(-1)
				expect(gap, `${theme}/${density}: related text should read as one pair`).toBeLessThanOrEqual(3)
			}
			expect(Math.max(...lineGaps) - Math.min(...lineGaps), `${theme}/${density}: header/row parity`).toBeLessThanOrEqual(1.5)
			await sheet.screenshot({ path: info.outputPath(`text-pairs-${theme}-${density}.png`), animations: "disabled" })
			await sheet.getByRole("button", { name: "Done", exact: true }).click()
		}
	}
})

for (const theme of ["light", "dark"] as const) {
	test(`mobile popup geometry follows density in ${theme}`, async ({ page }, info) => {
		await page.setViewportSize({ width: 390, height: 844 })
		await page.emulateMedia({ colorScheme: theme })
		const fontSizes: string[] = []
		for (const density of ["compact", "default", "comfortable"]) {
			await visitRoute(page, "/mentions")
			// data-density is a supported CSS scope, also used by UIProvider.
			await page.evaluate(value => document.documentElement.setAttribute("data-density", value), density)
			await page.locator("#mention-inline").getByRole("textbox").fill("@")
			const panel = page.locator(".mention-inline-suggestions--component")
			await expect(panel.getByRole("option")).toHaveCount(3)
			const first = panel.getByRole("option").first()
			fontSizes.push(await first.locator('[data-typography="text"]').first().evaluate(node => getComputedStyle(node).fontSize))
			const box = await panel.boundingBox()
			expect(box!.x).toBeGreaterThanOrEqual(0)
			expect(box!.x + box!.width).toBeLessThanOrEqual(390)
			await page.screenshot({ path: info.outputPath(`mentions-${density}.png`), animations: "disabled" })
			await visitRoute(page, "/filters")
			await page.evaluate(value => document.documentElement.setAttribute("data-density", value), density)
			await page.getByRole("button", { name: "Filters 1", exact: true }).click()
			const sheet = page.getByRole("dialog", { name: "Filters", exact: true })
			await expect(sheet).toHaveCSS("opacity", "1")
			const bounds = await sheet.boundingBox()
			/* 90% of the 390px viewport, plus 1px of rounding. */
			expect(bounds!.width).toBeLessThanOrEqual(352)
			expect(bounds!.y).toBeGreaterThanOrEqual(0)
			await page.screenshot({ path: info.outputPath(`filters-${density}.png`), animations: "disabled" })
		}
		/* Density moves popup geometry, never its type size. */
		expect(new Set(fontSizes).size).toBe(1)
	})
}
