/** Map defaults preserve provider attribution and theme it through the public token contract. */
import { expect, test } from "@playwright/test"

import { url } from "./routes"

test("the default map renders its tile attribution with the micro-label token", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "dark" })
	await page.goto(url("/map"))
	await page.locator("#map .map--component:visible").first().waitFor()

	const attribution = page.locator("#map .map--component:visible .leaflet-control-attribution").first()
	await expect(attribution).toBeVisible()
	await expect(attribution.getByRole("link", { name: "OpenStreetMap" })).toHaveAttribute(
		"href",
		"https://www.openstreetmap.org/copyright",
	)

	const type = await attribution.evaluate((element) => {
		const probe = document.createElement("span")
		probe.style.fontSize = "var(--text-xs)"
		probe.style.background = "var(--background-80, var(--background))"
		element.append(probe)
		const probeStyle = getComputedStyle(probe)
		const expectedFontSize = probeStyle.fontSize
		const expectedBackground = probeStyle.backgroundColor
		probe.remove()

		const style = getComputedStyle(element)
		return {
			actualFontSize: style.fontSize,
			expectedFontSize,
			actualBackground: style.backgroundColor,
			expectedBackground,
			misspelledToken: style.getPropertyValue("--text-2xs").trim(),
		}
	})

	expect(type.actualFontSize).toBe(type.expectedFontSize)
	expect(type.actualBackground).toBe(type.expectedBackground)
	expect(type.misspelledToken).toBe("")
})
