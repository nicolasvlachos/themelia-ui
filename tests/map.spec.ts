/** The default map keeps its tile provider's attribution link. */
import { expect, test } from "@playwright/test"

import { url } from "./routes"

test("the default map credits OpenStreetMap", async ({ page }) => {
	await page.goto(url("/map"))
	await page.locator("#map .map--component:visible").first().waitFor()

	const attribution = page.locator("#map .map--component:visible .leaflet-control-attribution").first()
	await expect(attribution).toBeVisible()
	await expect(attribution.getByRole("link", { name: "OpenStreetMap" })).toHaveAttribute(
		"href",
		"https://www.openstreetmap.org/copyright",
	)
})
