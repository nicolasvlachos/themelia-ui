/** Two-line identities in feature rows keep a visible gap between their primary and secondary lines. */
import { expect, test, type Locator } from "@playwright/test"

import { visitRoute } from "./routes"

async function expectSeparatedPair(locator: Locator) {
	const metrics = await locator.evaluate((element) => {
		const children = [...element.children].filter((child) => child.getClientRects().length > 0)
		const first = children[0]?.getBoundingClientRect()
		const second = children[1]?.getBoundingClientRect()
		return {
			cssGap: Number.parseFloat(getComputedStyle(element).rowGap) || 0,
			visibleGap: first && second ? second.top - first.bottom : 0,
		}
	})

	expect(metrics.cssGap, "the two-line identity uses the shared spacing scale").toBeGreaterThan(0)
	/* Half a pixel of allowance for fractional line boxes. */
	expect(metrics.visibleGap, "primary and secondary lines do not meet").toBeGreaterThanOrEqual(metrics.cssGap - 0.5)
}

test("feature identity pairs keep primary and secondary lines visually distinct", async ({ page }) => {
	await visitRoute(page, "/async-preview")
	await expectSeparatedPair(page.locator(".preview-trigger-cell--component span[class*='cellText']").first())

	await visitRoute(page, "/media-library")
	const media = page.locator("#library")
	await media.getByRole("button", { name: "List view" }).click()
	await expectSeparatedPair(media.locator("span[class*='rowBody']").first())

	await visitRoute(page, "/filters")
	await page.locator("#filters").getByRole("button", { name: "Add filter" }).click()
	await expectSeparatedPair(page.locator("span[class*='optionBody']").filter({ hasText: "Select a date" }))

	/* Stub the geocoder so the suggestions are deterministic and offline. */
	await page.route("https://photon.komoot.io/api**", async (route) => {
		await route.fulfill({
			contentType: "application/json",
			body: JSON.stringify({
				type: "FeatureCollection",
				features: [{
					type: "Feature",
					geometry: { type: "Point", coordinates: [23.5, 42.5] },
					properties: { osm_id: 1, name: "Marlow Hall", city: "Marlow", country: "UK" },
				}],
			}),
		})
	})
	await visitRoute(page, "/map")
	await page.locator("#place-autocomplete").getByRole("textbox", { name: "Search" }).fill("Marlow")
	const place = page.locator("span[class*='autocompleteRow']").filter({ hasText: "Marlow Hall" })
	await expect(place).toBeVisible()
	await expectSeparatedPair(place)
})
