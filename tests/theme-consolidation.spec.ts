/** Native color-scheme follows theme scopes, and cards, content blocks and overlays share one surface inset, gap, font and radius. */
import { expect, test } from "@playwright/test"
import { visitRoute } from "./routes"

test("native color scheme follows explicit and system theme scopes", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "light" })
	await page.goto("/")
	await expect(page.locator("main h1").first()).toBeVisible()

	const root = page.locator("html")
	await expect(root).toHaveCSS("color-scheme", "light")

	await root.evaluate((element) => element.setAttribute("data-theme", "dark"))
	await expect(root).toHaveCSS("color-scheme", "dark")

	const nestedLight = page.locator("body").locator("[data-test-color-scheme]")
	await page.locator("body").evaluate((body) => {
		const scope = document.createElement("div")
		scope.dataset.testColorScheme = ""
		scope.dataset.theme = "light"
		body.append(scope)
	})
	await expect(nestedLight).toHaveCSS("color-scheme", "light")

	await root.evaluate((element) => element.removeAttribute("data-theme"))
	await page.emulateMedia({ colorScheme: "dark" })
	await expect(root).toHaveCSS("color-scheme", "dark")

	await root.evaluate((element) => element.setAttribute("data-theme", "light"))
	await expect(root).toHaveCSS("color-scheme", "light")
})

for (const theme of ["light", "dark"] as const) {
	for (const width of [1440, 390]) {
		test(`shared theme contract at ${width}px in ${theme}`, async ({ page }, info) => {
			test.setTimeout(90_000)
			await page.setViewportSize({ width, height: 900 })
			await page.emulateMedia({ colorScheme: theme })
			const visit = async (route: string) => {
				await visitRoute(page, route)
				await page.addStyleTag({ content: `:root { --surface-x: 2rem; --surface-y: 1.5rem; --font-sans: Georgia, serif; --radius: 0.25rem; }` })
			}
			await visit("/card")
			for (const density of ["Compact", "Default", "Comfortable"]) {
				/* The docs Density select is hidden on narrow viewports, so switch it at desktop width. */
				await page.setViewportSize({ width: 1440, height: 900 })
				await page.getByLabel("Density", { exact: true }).selectOption({ label: density })
				await page.setViewportSize({ width, height: 900 })
				await visit("/card")
				const header = page.locator('[data-slot="card-header"]').first()
				await expect(page.locator('[data-slot="card-footer"]').first()).toHaveCSS('align-items', 'center')
				await expect(page.locator('[data-slot="card-footer"]').first()).toHaveCSS('flex-wrap', 'wrap')
				const footerGap = await page.locator('[data-slot="card-footer"]').first().evaluate(el => getComputedStyle(el).gap)
				const reference = await header.evaluate(el => {
					const s = getComputedStyle(el)
					return { x: parseFloat(s.paddingLeft), y: parseFloat(s.paddingTop), gap: s.rowGap, font: s.fontFamily }
				})
				/* The injected --surface-x / --surface-y ratio (2rem / 1.5rem), each rounded to a pixel. */
				expect(reference.x / reference.y).toBeCloseTo(4 / 3, 1)
				expect(reference.font).toContain("Georgia")
				const radius = await page.locator('.card--component').first().evaluate(el => getComputedStyle(el).borderTopLeftRadius)
				await visit("/content-block")
				const block = page.locator('.content-block--component').filter({ has: page.locator('.content-block--heading') })
				const framed = await block.evaluateAll(els => els.filter(el => parseFloat(getComputedStyle(el).borderTopWidth) > 0).map(el => {
					const s = getComputedStyle(el)
					return { x: parseFloat(s.paddingLeft), y: parseFloat(s.paddingTop) }
				}))
				expect(framed.length).toBeGreaterThan(0)
				for (const inset of framed) { expect(inset.x).toBeCloseTo(reference.x); expect(inset.y).toBeCloseTo(reference.y) }
				await expect(page.locator('.content-block--heading').first()).toHaveCSS('row-gap', reference.gap)
				await expect(page.locator('.content-block--component').filter({ hasText: 'surface="bordered"' }).first()).toHaveCSS('border-top-left-radius', radius)
				if (density === 'Default') {
					const override = await page.addStyleTag({ content: `.content-block--component { --content-block-p: 10px; }` })
					const framedBlock = page.locator('.content-block--component').filter({ hasText: 'surface="bordered"' }).first()
					await expect(framedBlock).toHaveCSS('padding-left', '10px')
					await expect(framedBlock).toHaveCSS('padding-top', '10px')
					await override.evaluate(el => el.remove())
				}
				await visit("/overlay")
				await page.getByRole('button', { name: 'center', exact: true }).click()
				const dialog = page.getByRole('dialog', { name: 'center', exact: true })
				await expect(dialog.locator('[data-slot="overlay-footer"]')).toHaveCSS('gap', footerGap)
				await expect(dialog.locator('[data-slot="overlay-footer"]')).toHaveCSS('align-items', 'center')
				const body = dialog.locator('[data-slot="overlay-body"]')
				await expect(body).toHaveCSS('padding-left', `${reference.x}px`)
				await expect(body).toHaveCSS('padding-top', `${reference.y}px`)
				/* The header keeps the 0.75 chrome factor, rounded to a whole pixel, and adds one --space-2xs optical inset above the title. */
				const opticalInset = await dialog.evaluate(el => {
					const probe = document.createElement('div')
					probe.style.paddingTop = 'var(--space-2xs)'
					el.appendChild(probe)
					const value = parseFloat(getComputedStyle(probe).paddingTop)
					probe.remove()
					return value
				})
				expect(await dialog.locator('[data-slot="overlay-header"]').evaluate(el => parseFloat(getComputedStyle(el).paddingTop))).toBeCloseTo(Math.round(reference.y * 0.75) + opticalInset, 2)
				await expect(dialog.locator('[data-slot="overlay-header"]')).toHaveCSS('row-gap', reference.gap)
				await expect(body).toHaveCSS('font-family', reference.font)
				expect(await dialog.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1)
				if (density === 'Default') {
					await dialog.screenshot({ path: info.outputPath('asymmetric-overlay.png') })
					const override = await page.addStyleTag({ content: `[data-slot="overlay-content"] { --overlay-region-p: 10px; }` })
					await expect(body).toHaveCSS('padding-left', '10px')
					await expect(body).toHaveCSS('padding-top', '10px')
					await override.evaluate(el => el.remove())
				}
				await page.keyboard.press('Escape')
			}
		})
	}
}
