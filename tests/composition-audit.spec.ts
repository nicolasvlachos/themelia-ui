/** Block and feature pages: display labels match the canonical label in scope, examples render, no text under 12px, no page overflow. */
import { expect, test } from "@playwright/test"
import { COMPONENT_ROUTES, slug, sweepTimeout, visitRoute } from "./routes"

const routes = COMPONENT_ROUTES.filter(route => ["Features", "Blocks"].includes(route.group) || route.path === "/timeline")

for (const theme of ["light", "dark"] as const) {
	for (const width of [1440, 390]) {
		test(`block and feature composition at ${width}px in ${theme}`, async ({ page }, info) => {
			test.setTimeout(sweepTimeout(routes.length) * 3)
			await page.emulateMedia({ colorScheme: theme })
			await visitRoute(page, "/metadata")
			const labelClass = await page.locator('main .metadata-list--label').first().getAttribute('class')
			expect(labelClass).toBeTruthy()
			const findings: string[] = []
			let exampleCount = 0
			for (const density of ["Default", "Compact", "Comfortable"]) {
				/* The docs Density select is hidden on narrow viewports, so switch it at desktop width. */
				await page.setViewportSize({ width: 1440, height: 900 })
				await page.getByLabel("Density", { exact: true }).selectOption({ label: density })
				await page.setViewportSize({ width, height: 900 })
				for (const route of routes) {
					await visitRoute(page, route.path)
					await page.evaluate(() => document.fonts.ready)
					await expect(page.locator('main .example--component').first()).toBeVisible()
					if (route.path === '/map') await expect(page.locator('#map .leaflet-marker-icon').first()).toBeVisible()
					const result = await page.evaluate(({ labelClass }) => {
						const errors: string[] = []
						const visible = (element: Element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
						const style = (element: Element) => {
							const css = getComputedStyle(element)
							return [css.fontSize, css.fontWeight, css.fontFamily, css.lineHeight, css.color].join('|')
						}
						for (const label of document.querySelectorAll('main [data-typography="display-label"]')) {
							if (!visible(label)) continue
							// Put the canonical role in the SAME scope: nested themes are intentional.
							const reference = document.createElement('span')
							reference.className = labelClass!
							reference.textContent = 'Reference label'
							label.parentElement!.append(reference)
							const expected = style(reference)
							reference.remove()
							for (const text of [label, ...label.querySelectorAll('[data-typography="text"]')]) {
								if (style(text) !== expected) errors.push(`DisplayLabel ${label.textContent?.slice(0, 60)}: ${style(text)} != ${expected}`)
							}
						}
						const examples = [...document.querySelectorAll('main .example--component')]
						for (const example of examples) {
							if (example.getBoundingClientRect().height < 20) errors.push('Collapsed example')
							if (example.querySelector('.example--error')) errors.push('Example error boundary')
							for (const text of example.querySelectorAll('.example--preview [data-typography]')) {
								if (visible(text) && !text.closest('[data-artwork]') && parseFloat(getComputedStyle(text).fontSize) < 12) errors.push(`Text below 12px: ${text.textContent?.slice(0, 40)}`)
							}
						}
						if (document.documentElement.scrollWidth > innerWidth + 1) errors.push('Page overflow')
						return { errors, examples: examples.length }
					}, { labelClass })
					findings.push(...result.errors.map(error => `${route.path} ${density}: ${error}`))
					exampleCount += result.examples
					if (density === 'Default' && info.project.name === 'chromium') {
						/* Captured for review, not compared, with the docs header hidden. */
						const screenshotStyle = 'header:has(button[aria-label="Toggle navigation"]) { visibility: hidden !important; }'
						await page.locator('main').screenshot({ path: info.outputPath(`${slug(route.path)}.png`), animations: 'disabled', style: screenshotStyle })
						if (process.env.COMPOSITION_SCREENSHOTS && ((width === 390 && theme === 'light') || (width === 1440 && theme === 'dark'))) {
							for (const [index, example] of (await page.locator('main .example--preview').all()).entries()) {
								await example.screenshot({ path: info.outputPath(`${slug(route.path)}-${String(index).padStart(2, '0')}.png`), animations: 'disabled', style: screenshotStyle })
							}
						}
					}
				}
			}
			console.log(`${routes.length} routes, ${exampleCount} example inspections across three densities`)
			/* A floor on the route filter, so a renamed group cannot empty the sweep. */
			expect(routes.length).toBeGreaterThanOrEqual(25)
			expect(exampleCount).toBeGreaterThan(routes.length * 3)
			expect(findings).toEqual([])
		})
	}
}

test('feature primary text follows a consumer typography override', async ({ page }) => {
	const cases = [
		{ route: '/media-library', selector: '.media-library-card--component [data-typography="text"][title]' },
		/* The agenda card's facts are the calendar's body copy; a grid chip pins the xs step like Badge. */
		{ route: '/event-calendar', selector: '.event-calendar-event-card--component [data-typography="text"]:has-text("Marla Okonkwo")' },
		{ route: '/blocks-admin', selector: '.role-permissions--component [data-typography="text"]' },
		{ route: '/filters', selector: '.filter-pill--component [data-typography="text"]' },
	]
	for (const { route, selector } of cases) {
		await visitRoute(page, route)
		await page.addStyleTag({ content: ':root { --font-sans: Georgia, serif; } main { --text-default: 18px; --text-default--line-height: 26px; }' })
		const primary = page.locator(selector).first()
		await expect(primary).toBeVisible()
		await expect(primary).toHaveCSS('font-size', '18px')
		await expect(primary).toHaveCSS('font-family', 'Georgia, serif')
	}
})

for (const width of [390, 1440]) {
	test(`composed rows preserve readable content at ${width}px`, async ({ page }, info) => {
		await page.setViewportSize({ width, height: 900 })
		for (const route of ['/products', '/product-variants']) {
			await visitRoute(page, route)
			const rows = page.locator('main [data-slot="item"]:has([data-slot="item-title"])')
			expect(await rows.count()).toBeGreaterThan(0)
			for (const row of await rows.all()) {
				if (!await row.isVisible()) continue
				const content = await row.locator('[data-slot="item-content"]').first().boundingBox()
				expect(content!.width).toBeGreaterThan(100)
				const actions = row.locator('[data-slot="item-actions"]')
				if (await actions.count()) {
					const box = (await actions.boundingBox())!
					/* Beside or below the content, never overlapping it. */
					expect(box.x >= content!.x + content!.width - 1 || box.y >= content!.y + content!.height - 1).toBe(true)
				}
			}
		}
		await visitRoute(page, '/blocks-order')
		const properties = page.locator('.order-line-item--component .metadata-list--item')
		expect(await properties.count()).toBeGreaterThan(0)
		for (const item of await properties.all()) {
			const label = (await item.locator('.metadata-list--label').boundingBox())!
			const value = (await item.locator('.metadata-value--component').boundingBox())!
			/* Beside or below its label, never overlapping it. */
			expect(value.x >= label.x + label.width - 1 || value.y >= label.y + label.height - 1).toBe(true)
		}
		await visitRoute(page, '/blocks-admin')
		const description = page.getByText('Removes the workspace and everything inside it.', { exact: true })
		expect((await description.boundingBox())!.width).toBeGreaterThan(180)
		await page.locator('#blocks-sensitive').screenshot({ path: info.outputPath('sensitive-action.png'), animations: 'disabled' })
		await visitRoute(page, '/activities')
		const api = page.getByRole('group', { name: 'Component API' }).first()
		await expect(api).toBeVisible()
		/* The API table keeps its width and scrolls inside its focusable group. */
		expect((await api.locator('table').boundingBox())!.width).toBeGreaterThanOrEqual(640)
		if (width === 390) {
			await api.scrollIntoViewIfNeeded()
			await api.focus()
			await expect(api).toBeFocused()
			await api.press('ArrowRight', { delay: 100 })
			await expect.poll(() => api.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
		}
	})
}
