/**
 * Visual regression, one baseline per component page per theme.
 *
 * Both themes, because most token breakage shows in only one. Accept intended changes with
 * `npx playwright test visual --update-snapshots`, after reading the diff.
 */
import { expect, test, type Locator, type Page } from "@playwright/test"
import { readdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { COMPONENT_ROUTES, slug, url } from "./routes"

/* `toHaveScreenshot` reads a stylesheet file (`stylePath`); a `style` string is ignored. */
const CAPTURE_STYLE = resolve(dirname(fileURLToPath(import.meta.url)), "fixtures/visual-capture.css")

test("the Darwin baseline inventory matches the component route registry", () => {
	const snapshotDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "visual.spec.ts-snapshots")
	const actual = readdirSync(snapshotDirectory)
		.filter((name) => name.endsWith("-chromium-darwin.png"))
		.sort()
	const expected = [
		"chrome-sidebar-dark-chromium-darwin.png",
		"chrome-sidebar-light-chromium-darwin.png",
		...COMPONENT_ROUTES.flatMap((route) =>
			(["dark", "light"] as const).map(
				(theme) => `${slug(route.path)}-${theme}-chromium-darwin.png`,
			),
		),
	].sort()

	expect(actual).toEqual(expected)
})

/** Settles the page before the shutter: fonts, finite animations, charts, then layout. */
async function settle(page: import("@playwright/test").Page) {
	await page.waitForSelector("h1")
	await page.evaluate(() => document.fonts.ready)
	await page.evaluate(() => {
		/*
		 * Finite animations only: a spinner loops forever and its `finished` never resolves.
		 * Looping ones are frozen by `animations: "disabled"` at capture.
		 */
		const finite = document
			.getAnimations()
			.filter((animation) => {
				const iterations = animation.effect?.getTiming().iterations
				return iterations !== Infinity
			})
			.map((animation) => animation.finished.catch(() => {}))
		return Promise.all(finite)
	})
	await settleCharts(page)
	await settleLayout(page, page.locator("main").first())
}

/**
 * Take one throwaway capture, then wait for `main`'s height to hold for three polls.
 *
 * A full-element capture renders beyond the viewport, a layout path whose text measurements
 * persist. Where a line sits on a wrap edge it changes the height, and `toHaveScreenshot`
 * then times out waiting for two identical images. Nothing cheaper (scrolling, resizing, a
 * clip) triggers it, so every route pays one extra capture.
 */
async function settleLayout(page: Page, target: Locator) {
	await target.screenshot({ animations: "disabled" }).catch(() => {})
	await page.waitForFunction(
		() => {
			const w = window as unknown as { __layoutH?: number; __layoutSteady?: number }
			const main = document.querySelector("main")
			if (!main) return true
			const height = Math.round(main.getBoundingClientRect().height)
			if (w.__layoutH === height) w.__layoutSteady = (w.__layoutSteady ?? 0) + 1
			else { w.__layoutH = height; w.__layoutSteady = 0 }
			return (w.__layoutSteady ?? 0) >= 3
		},
		null,
		{ timeout: 15_000, polling: 100 },
	)
}

/**
 * Wait for chart geometry to stop moving. Recharts animates SVG attributes from
 * `requestAnimationFrame`, which neither `getAnimations()` nor `animations: "disabled"` sees.
 * Compares a signature over three polls rather than sleeping.
 */
async function settleCharts(page: import("@playwright/test").Page) {
	const hasCharts = await page.evaluate(() => document.querySelector("svg path[d]") !== null)
	if (!hasCharts) return

	await page.waitForFunction(
		() => {
			const w = window as unknown as { __chartSig?: string; __chartSteady?: number }
			/* `d` covers lines and areas; a bar is a rect, and only its y/height animate. */
			const parts = [...document.querySelectorAll<SVGElement>("svg path[d], svg rect")].map(
				(node) => node.getAttribute("d") ?? `${node.getAttribute("y")}:${node.getAttribute("height")}`,
			)
			const signature = `${parts.length}|${parts.join(",")}`
			if (w.__chartSig === signature) w.__chartSteady = (w.__chartSteady ?? 0) + 1
			else { w.__chartSig = signature; w.__chartSteady = 0 }
			return (w.__chartSteady ?? 0) >= 3
		},
		null,
		{ timeout: 15_000, polling: 100 },
	)
}

/**
 * Hide third-party map tiles, which change between runs. Injected with `addStyleTag`:
 * `toHaveScreenshot` ignores a `style` option (it reads `stylePath`), and `mask` paints over
 * the map box together with the controls positioned on it.
 */
async function hideLiveMapTiles(page: Page) {
	/*
	 * Markers go too: Leaflet's settled pin position varies by a few pixels between runs however
	 * long the wait, and a pin's exact pixel is not this kit's to assert.
	 */
	await page.addStyleTag({
		content: ".leaflet-tile-pane, .leaflet-marker-pane, .leaflet-shadow-pane { visibility: hidden !important; }",
	})
}

/**
 * Wait for a lazily-mounted map: `map-runtime.tsx` loads react-leaflet on demand, so markers
 * arrive with their chunks, well after `settle()` returns.
 */
async function settleMaps(page: Page) {
	if ((await page.locator(".leaflet-container").count()) === 0) return

	/*
	 * Not `networkidle`: Leaflet requests tiles for as long as it is on screen. Waits for at
	 * least one marker and for every marker's transform to hold over three polls, since the
	 * count settles while Leaflet is still easing the view. A marker-less map demo times out.
	 */
	await page.waitForFunction(
		() => {
			const w = window as unknown as { __mapSig?: string; __steady?: number }
			const pins = [...document.querySelectorAll<HTMLElement>(".leaflet-marker-icon")]
			const signature = `${pins.length}|${pins.map((p) => p.style.transform).join(",")}`
			if (w.__mapSig === signature) w.__steady = (w.__steady ?? 0) + 1
			else { w.__mapSig = signature; w.__steady = 0 }
			return pins.length > 0 && (w.__steady ?? 0) >= 3
		},
		null,
		{ timeout: 15_000, polling: 100 },
	)
}

/*
 * No off-origin requests: hidden map tiles would still be fetched and keep /map mutating.
 * Every baseline must be a function of this repository alone.
 */
test.beforeEach(async ({ page }) => {
	await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => route.abort())

	/*
	 * A fixed clock, so "today" rings and relative times ("2h ago") do not move the baselines.
	 * Mid-week, so the today ring lands inside a month grid rather than on an edge.
	 */
	await page.clock.setFixedTime(new Date("2026-06-17T10:30:00Z"))
})

for (const theme of ["light", "dark"] as const) {
	test.describe(`${theme} theme`, () => {
		/*
		 * Emulate the OS preference rather than set `data-theme`: the docs app runs
		 * `colorScheme: "system"`, which removes the attribute on mount.
		 */
		test.use({ colorScheme: theme })

		/*
		 * The site chrome, which the `main` captures never include. One route suffices; `/badge`
		 * sits inside a group, so the active state is captured too.
		 */
		test("site chrome", async ({ page }) => {
			await page.goto(url("/badge"))
			await settle(page)

			/* The scroll viewport, not the nav inside it, whose box is the full scrollable height. */
			const rail = page.locator("[class*='sidebarScroll']").first()
			await expect(rail).toHaveScreenshot(`chrome-sidebar-${theme}.png`, { timeout: 30_000 })
		})

		for (const route of COMPONENT_ROUTES) {
			test(route.label, async ({ page }) => {
				await page.goto(url(route.path))
				await settle(page)
				await hideLiveMapTiles(page)
				await settleMaps(page)

				/* An element capture takes all of `main`, below the fold included. */
				const main = page.locator("main").first()
				await expect(main).toHaveScreenshot(`${slug(route.path)}-${theme}.png`, {
					/* The floating app utility has its own light/dark baselines in theme-tweaker-live. */
					stylePath: CAPTURE_STYLE,

					/*
					 * Above the 5s default: the longest pages are over 9000px tall, and under eight
					 * workers two consecutive captures do not always fit in 5s. A ceiling, not a wait.
					 */
					timeout: 20_000,
				})
			})
		}
	})
}
