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

	/* Which half a light-dark() colour takes where the probe sits: the used scheme, measured. */
	const LIGHT = "rgb(1, 2, 3)"
	const DARK = "rgb(4, 5, 6)"
	const probe = (parent: string, id: string) =>
		page.evaluate(
			({ parent, id, light, dark }) => {
				const span = document.createElement("span")
				span.id = id
				span.style.color = `light-dark(${light}, ${dark})`
				document.querySelector(parent)?.append(span)
			},
			{ parent, id, light: LIGHT, dark: DARK },
		)
	await probe("body", "root-probe")
	const root = page.locator("html")
	const rootProbe = page.locator("#root-probe")
	await expect(rootProbe).toHaveCSS("color", LIGHT)

	await root.evaluate((element) => element.setAttribute("data-theme", "dark"))
	await expect(rootProbe).toHaveCSS("color", DARK)

	await page.locator("body").evaluate((body) => {
		const scope = document.createElement("div")
		scope.dataset.testColorScheme = ""
		scope.dataset.theme = "light"
		body.append(scope)
	})
	await probe("[data-test-color-scheme]", "nested-probe")
	await expect(page.locator("#nested-probe")).toHaveCSS("color", LIGHT)

	await root.evaluate((element) => element.removeAttribute("data-theme"))
	await page.emulateMedia({ colorScheme: "dark" })
	await expect(rootProbe).toHaveCSS("color", DARK)

	await root.evaluate((element) => element.setAttribute("data-theme", "light"))
	await expect(rootProbe).toHaveCSS("color", LIGHT)
})

test("a theme override reaches cards, content blocks and overlays", async ({ page }) => {
	/* The container inset and the interface font, set once at the root as a consumer's theme does. */
	const visit = async (route: string) => {
		await visitRoute(page, route)
		await page.addStyleTag({ content: ":root { --padding: 2rem; --font-sans: Georgia, serif; }" })
	}

	await visit("/card")
	const header = page.locator('[data-slot="card-header"]').first()
	await expect(header).toHaveCSS("padding-left", "32px")
	await expect(header).toHaveCSS("font-family", /Georgia/)

	await visit("/content-block")
	const framed = page.locator(".content-block--component").filter({ hasText: 'surface="bordered"' }).first()
	await expect(framed).toHaveCSS("padding-left", "32px")

	await visit("/overlay")
	await page.getByRole("button", { name: "center", exact: true }).click()
	const body = page.getByRole("dialog", { name: "center", exact: true }).locator('[data-slot="overlay-body"]')
	await expect(body).toHaveCSS("font-family", /Georgia/)
	await expect(body).toHaveCSS("padding-left", "32px")
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
