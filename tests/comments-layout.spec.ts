/** Comment threads keep their nested bubble geometry at every width, density and theme, and their actions stay usable. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

for (const theme of ["light", "dark"] as const) {
	for (const width of [1280, 390]) {
		test(`compact comments at ${width}px in ${theme}`, async ({ page }) => {
			test.setTimeout(60_000)
			await page.setViewportSize({ width, height: 844 })
			await page.emulateMedia({ colorScheme: theme })
			await visitRoute(page, "/comments")
			const demo = page.locator("#comments")
			const root = demo.locator('[data-comment-id="c1"]')
			const bubble = root.locator('[class*="itemBubble_"]').first()
			await expect(bubble.locator("p")).toHaveCount(1)
			await expect(bubble.locator("p")).toContainText("Deposit is still outstanding — Maria Petrova can you chase it before Friday?")
			await root.getByRole("button", { name: "Show 1 reply", exact: true }).click()
			await expect(root.getByRole("button", { name: "Hide replies" })).toHaveAttribute("aria-expanded", "true")
			await expect(root.locator('[data-comment-id="c2"]')).toContainText("Chased.")
			for (const density of ["Compact", "Default", "Comfortable"]) {
				/* The docs Density select is hidden on narrow viewports, so switch it at desktop width. */
				await page.setViewportSize({ width: 1280, height: 844 })
				await page.getByLabel("Density", { exact: true }).selectOption({ label: density })
				await page.setViewportSize({ width, height: 844 })
				/*
				 * A comment is an avatar gutter and a bubble: nothing overflows its row, the
				 * bubble stays inside it, and a reply's bubble sits further in than the bubble
				 * of the comment it answers — the thread's shape, at every density and width.
				 */
				const geometry = await demo.locator('[data-slot="comment"]').evaluateAll(nodes => nodes.map(el => {
					const own = (node: Element | null | undefined) => node?.querySelector('[class*="itemBubble_"]')?.getBoundingClientRect()
					const row = el.getBoundingClientRect()
					const bubble = own(el)
					const parent = own(el.parentElement?.closest('[data-slot="comment"]'))
					return {
						overflow: el.scrollWidth - el.clientWidth,
						inside: !!bubble && bubble.left >= row.left - 1 && bubble.right <= row.right + 1,
						indent: bubble && parent ? bubble.left - parent.left : null,
					}
				}))
				expect(geometry.some((row) => row.indent !== null), "the opened reply is nested").toBe(true)
				for (const row of geometry) {
					expect(row.overflow).toBeLessThanOrEqual(1)
					expect(row.inside).toBe(true)
					if (row.indent !== null) expect(row.indent).toBeGreaterThan(0)
				}
			}
			await page.setViewportSize({ width: 1280, height: 844 })
			await page.getByLabel("Density", { exact: true }).selectOption({ label: "Default" })
			await page.setViewportSize({ width, height: 844 })
			const reaction = root.getByRole("button", { name: "👍 3", exact: true })
			await expect(reaction).toHaveAttribute("aria-pressed", "true")
			await reaction.click()
			await expect(root.getByRole("button", { name: "👍 2", exact: true })).toHaveAttribute("aria-pressed", "false")
			const menu = root.getByRole("button", { name: "Comment actions", exact: true }).first()
			await menu.focus()
			await menu.press("Enter")
			await expect(page.getByRole("menuitem", { name: "Edit", exact: true })).toBeVisible()
			await page.getByRole("menuitem", { name: "Edit", exact: true }).click()
			await expect(demo.getByText("Editing comment", { exact: true })).toBeVisible()
			await demo.getByRole("button", { name: "Cancel", exact: true }).last().click()
			await root.getByRole("button", { name: "Reply", exact: true }).first().click()
			await expect(demo.getByText("Replying to Marcus Webb", { exact: true })).toBeVisible()
			await demo.getByRole("button", { name: "Cancel", exact: true }).last().click()
			await menu.click()
			await page.getByRole("menuitem", { name: "Delete", exact: true }).click()
			await expect(page.getByRole("alertdialog")).toBeVisible()
			await page.getByRole("alertdialog").getByRole("button", { name: "Cancel", exact: true }).click()
			await expect(root).toBeVisible()
			/* Audit the settled page: mid-exit, the fading dialog's title measures as text on its own ground. */
			await expect(page.getByRole("alertdialog")).toBeHidden()
			const a11y = await new AxeBuilder({ page }).include("#comments").analyze()
			expect(a11y.violations).toEqual([])
		})
	}
}
