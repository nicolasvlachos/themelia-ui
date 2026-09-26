/**
 * The pages under test, parsed as text from the app's route table (`src/preview/routes.ts`).
 * Importing it would pull in every CSS module, which Playwright's Node loader cannot parse.
 */
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { expect, type Page } from "@playwright/test"

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(here, "../src/preview/routes.ts"), "utf8")

export type TestRoute = { path: string; label: string; group: string }

function parseRoutes(): TestRoute[] {
	const routes: TestRoute[] = []
	let group = "unknown"

	for (const line of source.split("\n")) {
		const groupMatch = line.match(/^\tgroup\("([^"]+)"/)
		if (groupMatch) {
			group = groupMatch[1]
			continue
		}
		const routeMatch = line.match(/path: "([^"]+)", label: "([^"]+)"/)
		if (routeMatch) routes.push({ path: routeMatch[1], label: routeMatch[2], group })
	}
	return routes
}

export const ROUTES = parseRoutes()

if (ROUTES.length === 0) {
	// A silent empty list would turn every suite below into a no-op that reports green.
	throw new Error("tests/routes.ts parsed no routes out of src/preview/routes.ts")
}

/**
 * Component pages only. `/review` renders every component at once, so a failure there names
 * no component; `/` is prose.
 */
export const COMPONENT_ROUTES = ROUTES.filter(
	(route) => route.path !== "/" && route.path !== "/review",
)

/** Every page a reader can reach, prose included; for audits that need not name a component. */
export const READABLE_ROUTES = ROUTES.filter((route) => route.path !== "/review")

/** The dev server, for a spec that imports source modules at runtime: `test.use({ baseURL: DEV_ORIGIN })`. */
export const DEV_ORIGIN = `http://localhost:${process.env.DEV_PORT ?? 5198}`

/** `#/card` — the docs site is a HashRouter, so a bare path would land on the index. */
export const url = (path: string) => `/#${path}`

/**
 * Wait for the requested route's React commit, independently of background traffic. Firefox
 * gets 20s: under a loaded machine its first render of the docs shell missed the 5s default.
 */
export async function visitRoute(page: Page, path: string) {
	const timeout = page.context().browser()?.browserType().name() === "firefox" ? 20_000 : undefined
	await page.goto(url(path))
	await expect(page.getByRole("navigation", { name: "Documentation", includeHidden: true }).locator(`a[href="#${path}"]`))
		.toHaveAttribute("aria-current", "page", { timeout })
	await expect(page.locator("main h1").first()).toBeVisible({ timeout })
}

/** Filesystem-safe name for a screenshot baseline. */
export const slug = (path: string) => path.replace(/^\//, "") || "index"

/**
 * A timeout for a test that walks every route, derived from the route count, with a floor
 * for the browser start.
 */
export const sweepTimeout = (routes: number) => Math.max(2 * 60 * 1000, routes * 6_000)

/**
 * A long sweep split into `count` tests over consecutive slices of `routes`, so the workers
 * run them side by side. Each slice is named `n/count` in its test title.
 */
export function shards<T>(routes: readonly T[], count: number): { routes: T[]; name: string }[] {
	const size = Math.ceil(routes.length / count)
	return Array.from({ length: count }, (_, i) => routes.slice(i * size, (i + 1) * size))
		.filter((slice) => slice.length > 0)
		.map((slice, i, all) => ({ routes: slice, name: `${i + 1}/${all.length}` }))
}
