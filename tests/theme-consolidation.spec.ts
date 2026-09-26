/**
 * Theme overrides: native color-scheme follows theme scopes, and the documented surface, font,
 * padding and typography overrides reach the components that read them.
 */
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

test("documented overrides reach cards, content blocks and overlays", async ({ page }) => {
	const visit = async (route: string) => {
		await visitRoute(page, route)
		await page.addStyleTag({ content: ":root { --surface-x: 2rem; --surface-y: 1.5rem; --font-sans: Georgia, serif; }" })
	}

	await visit("/card")
	const header = await page.locator('[data-slot="card-header"]').first().evaluate(el => {
		const s = getComputedStyle(el)
		return { x: parseFloat(s.paddingLeft), y: parseFloat(s.paddingTop), font: s.fontFamily }
	})
	/* The injected --surface-x / --surface-y ratio (2rem / 1.5rem), each rounded to a pixel. */
	expect(header.x / header.y).toBeCloseTo(4 / 3, 1)
	expect(header.font).toContain("Georgia")

	await visit("/content-block")
	const framed = page.locator(".content-block--component").filter({ hasText: 'surface="bordered"' }).first()
	await page.addStyleTag({ content: ".content-block--component { --content-block-p: 10px; }" })
	await expect(framed).toHaveCSS("padding-left", "10px")
	await expect(framed).toHaveCSS("padding-top", "10px")

	await visit("/overlay")
	await page.getByRole("button", { name: "center", exact: true }).click()
	const body = page.getByRole("dialog", { name: "center", exact: true }).locator('[data-slot="overlay-body"]')
	await expect(body).toHaveCSS("font-family", /Georgia/)
	await page.addStyleTag({ content: '[data-slot="overlay-content"] { --overlay-region-p: 10px; }' })
	await expect(body).toHaveCSS("padding-left", "10px")
	await expect(body).toHaveCSS("padding-top", "10px")
})

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
