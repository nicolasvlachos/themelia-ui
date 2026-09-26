/** Commerce and catalogue blocks render labels, values and descriptions in the canonical metadata and item typography. */
import { expect, test, type Locator } from "@playwright/test"
import { visitRoute } from "./routes"

async function typography(locator: Locator) {
	return locator.evaluateAll(elements => elements.map(element => {
		// Inspect the text-bearing descendant: a correct outer DisplayLabel can hide an override.
		const hasOwnText = [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
		const text = hasOwnText ? element : element.querySelector('[data-typography="text"]') ?? element
		const css = getComputedStyle(text)
		return { size: css.fontSize, weight: css.fontWeight, family: css.fontFamily, leading: css.lineHeight, color: css.color }
	}))
}

for (const theme of ["light", "dark"] as const) {
	for (const width of [1440, 390]) {
		test(`commerce follows canonical typography at ${width}px in ${theme}`, async ({ page }) => {
			test.setTimeout(90_000)
			await page.emulateMedia({ colorScheme: theme })
			await visitRoute(page, "/metadata")
			for (const density of ["Compact", "Default", "Comfortable"]) {
				/* The docs Density select is hidden on narrow viewports, so switch it at desktop width. */
				await page.setViewportSize({ width: 1440, height: 900 })
				await page.getByLabel("Density", { exact: true }).selectOption({ label: density })
				await page.setViewportSize({ width, height: 900 })
				await visitRoute(page, "/metadata")
				const canonicalLabel = (await typography(page.locator('.metadata-list--rows .metadata-list--label').first()))[0]
				expect(canonicalLabel).toBeDefined()
				const canonicalValue = (await typography(page.locator('.metadata-list--rows .value--component').first()))[0]
				expect(canonicalValue).toBeDefined()
				await visitRoute(page, "/item")
				const canonicalDescription = (await typography(page.locator('[data-slot="item-description"]').first()))[0]
				expect(canonicalDescription).toBeDefined()
				await visitRoute(page, "/blocks-commerce")
				for (const id of ["order-status", "shipment-tracking", "refund-status"]) {
					const labels = await typography(page.locator(`#${id} .metadata-list--label`))
					expect(labels.length, `${id} must render canonical metadata`).toBeGreaterThan(0)
					for (const label of labels) expect(label, `${id} in ${density}`).toEqual(canonicalLabel)
					const values = await typography(page.locator(`#${id} .metadata-list--rows .value--component`))
					expect(values.length).toBeGreaterThan(0)
					for (const value of values) expect(value, `${id} value in ${density}`).toEqual(canonicalValue)
				}
				for (const id of ["cart-summary", "upcoming-bookings"]) {
					const descriptions = await typography(page.locator(`#${id} [data-slot="item-description"]`))
					expect(descriptions.length).toBeGreaterThan(0)
					for (const description of descriptions) expect(description, `${id} in ${density}`).toEqual(canonicalDescription)
				}
				for (const id of ["cart-summary", "tax-breakdown"]) {
					const normal = (await typography(page.locator(`#${id} .amount-row--component:not([data-total]) .amount-row--value`).first()))[0]
					const total = (await typography(page.locator(`#${id} [data-total] .amount-row--value`)))[0]
					expect(total.size, `${id} total retains the shared text size`).toBe(normal.size)
					expect(total.family).toBe(normal.family)
				}
				await visitRoute(page, "/blocks-catalogue")
				const catalogueLabels = await typography(page.locator('.metadata-list--label'))
				expect(catalogueLabels.length).toBeGreaterThan(0)
				for (const label of catalogueLabels) expect(label, `catalogue in ${density}`).toEqual(canonicalLabel)
			}
		})
	}
}
