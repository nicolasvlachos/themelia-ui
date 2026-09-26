/**
 * Local screenshots, one per preview example per theme, compared with baselines recorded on
 * this machine.
 *
 * Each example renders on a page of its own, `#/example/<page>/<id>`, in the docs shell and at
 * the width it has on its page, so a change shows as a diff of one component. Both themes,
 * because most token breakage shows in only one. Record baselines, or accept an intended
 * change after reading the diff, with `npm run screenshots -- --update-snapshots`.
 */
import { readdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test, type Locator, type Page } from "@playwright/test"

import { url } from "./routes"

const here = dirname(fileURLToPath(import.meta.url))

/* `toHaveScreenshot` reads a stylesheet file (`stylePath`); a `style` string is ignored. */
const CAPTURE_STYLE = resolve(here, "fixtures/visual-capture.css")

/** Every example file, `<page>/<id>`, as the preview registry keys them (`_` files are shared code). */
const EXAMPLES_DIR = resolve(here, "../src/preview/examples")
const EXAMPLE_KEYS = readdirSync(EXAMPLES_DIR, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.flatMap((folder) =>
		readdirSync(resolve(EXAMPLES_DIR, folder.name))
			.filter((file) => file.endsWith(".tsx") && !file.startsWith("_"))
			.map((file) => `${folder.name}/${file.replace(/\.tsx$/, "")}`),
	)
	.sort()

if (EXAMPLE_KEYS.length === 0) throw new Error("visual.spec.ts found no examples in src/preview/examples")

/** Settles the frame before the shutter: fonts, finite animations, charts, maps, then layout. */
async function settle(page: Page, target: Locator) {
	await expect(target).toBeVisible()
	await page.evaluate(() => document.fonts.ready)
	await page.evaluate(() => {
		/* Finite animations only: a spinner loops forever and its `finished` never resolves. */
		const finite = document
			.getAnimations()
			.filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
			.map((animation) => animation.finished.catch(() => {}))
		return Promise.all(finite)
	})
	await settleCharts(page)
	await settleMaps(page)
	await settleLayout(page, target)
}

/**
 * Take one throwaway capture, then wait for the target's height to hold for three polls: a
 * capture renders beyond the viewport, and a line on a wrap edge can change the height once.
 */
async function settleLayout(page: Page, target: Locator) {
	await target.screenshot({ animations: "disabled" }).catch(() => {})
	await page.waitForFunction(
		() => {
			const w = window as unknown as { __layoutH?: number; __layoutSteady?: number }
			const frame = document.querySelector("[data-example]")
			if (!frame) return true
			const height = Math.round(frame.getBoundingClientRect().height)
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
 */
async function settleCharts(page: Page) {
	const hasCharts = await page.evaluate(() => document.querySelector("svg path[d]") !== null)
	if (!hasCharts) return
	await page.waitForFunction(
		() => {
			const w = window as unknown as { __chartSig?: string; __chartSteady?: number }
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
 * Maps: tiles and markers come from the network and settle a few pixels differently between
 * runs, so they are hidden; the wait is for the lazily loaded map to mount.
 */
async function settleMaps(page: Page) {
	if ((await page.locator(".leaflet-container").count()) === 0) return
	await page.addStyleTag({
		content: ".leaflet-tile-pane, .leaflet-marker-pane, .leaflet-shadow-pane { visibility: hidden !important; }",
	})
}

/* Every baseline is a function of this repository alone: no off-origin requests, a fixed clock. */
test.beforeEach(async ({ page }) => {
	await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => route.abort())
	await page.clock.setFixedTime(new Date("2026-06-17T10:30:00Z"))
})

for (const theme of ["light", "dark"] as const) {
	test.describe(`${theme} theme`, () => {
		/* The docs app runs `colorScheme: "system"`, so the OS preference is what selects the theme. */
		test.use({ colorScheme: theme })

		test("site chrome", async ({ page }) => {
			await page.goto(url("/badge"))
			const rail = page.getByRole("navigation", { name: "Documentation" }).first().locator("..")
			await expect(rail).toBeVisible()
			await page.evaluate(() => document.fonts.ready)
			await expect(rail).toHaveScreenshot(`chrome-sidebar-${theme}.png`, { timeout: 30_000 })
		})

		for (const key of EXAMPLE_KEYS) {
			test(key, async ({ page }) => {
				await page.goto(url(`/example/${key}`))
				const frame = page.locator(`[data-example="${key}"]`)
				await settle(page, frame)
				await expect(frame).toHaveScreenshot(`${key.replace("/", "--")}-${theme}.png`, {
					stylePath: CAPTURE_STYLE,
					timeout: 20_000,
				})
			})
		}
	})
}
