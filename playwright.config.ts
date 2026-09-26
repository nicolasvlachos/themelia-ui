import { defineConfig, devices } from "@playwright/test"

/* The static test build; the dev server only for specs that import source at runtime. */
const PORT = Number(process.env.PORT ?? 4173)
/* Not 5173: another app on the usual dev port would be reused and tested instead of this one. */
const DEV_PORT = Number(process.env.DEV_PORT ?? 5198)
const TAILWIND = "**/fixtures/tailwind-v4/*.test.ts"
const VISUAL = "**/visual.spec.ts"
const AUDIT = "**/audit/**"
/* What differs by engine: keyboard and focus, popups and editing. */
const ENGINE_SPECS = ["interaction", "popup-conformance", "rich-text-editor", "foundations-interactions"].map(
	(name) => `**/${name}.spec.ts`,
)
/* A project's `use` replaces the top-level one, so the viewport goes after the device spread. */
const VIEWPORT = { width: 1280, height: 720 }

/**
 * Browser tests over the docs site, which renders every component and variation, so the tests
 * need no harness pages of their own.
 *
 * `npm test` runs `chromium` and `tailwind`; the release gate adds `firefox` and `webkit`.
 * `visual` and `audit` are local tools and never part of either.
 */
export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	/* The static build serves cheaply, so the browsers are the limit. */
	workers: "75%",
	/* No retries: a flaky test is a failure. `verify:release` adds --forbid-only. */
	retries: 0,
	reporter: [["list"]],

	use: {
		baseURL: `http://localhost:${PORT}`,
		/* A native date input formats by locale, and anything grouped by local day shifts with the zone. */
		locale: "en-US",
		timezoneId: "Europe/Sofia",
		trace: "retain-on-failure",
	},

	/* An absolute pixel budget: pages differ in height, so a ratio would hide a defect on a long one. */
	expect: {
		toHaveScreenshot: { maxDiffPixels: 60, animations: "disabled" },
	},

	projects: [
		{
			name: "chromium",
			testIgnore: [TAILWIND, VISUAL, AUDIT],
			use: { ...devices["Desktop Chrome"], viewport: VIEWPORT },
		},
		/* Compiles the built package through Tailwind v4. */
		{ name: "tailwind", testMatch: TAILWIND, use: { ...devices["Desktop Chrome"] } },
		{ name: "firefox", testMatch: ENGINE_SPECS, use: { ...devices["Desktop Firefox"], viewport: VIEWPORT } },
		{ name: "webkit", testMatch: ENGINE_SPECS, use: { ...devices["Desktop Safari"], viewport: VIEWPORT } },
		/*
		 * Local screenshots (`npm run screenshots`). Baselines are git-ignored: record them with
		 * `npm run screenshots -- --update-snapshots`, then later runs compare against them.
		 */
		{ name: "visual", testMatch: VISUAL, use: { ...devices["Desktop Chrome"], viewport: VIEWPORT } },
		/* On-demand sweeps (`npm run audit`) for a broad visual change; never a gate. */
		{ name: "audit", testMatch: AUDIT, use: { ...devices["Desktop Chrome"], viewport: VIEWPORT } },
	],

	webServer: [
		{
			/* A development-mode bundle served statically, built per run so an edit made mid-run never reaches it. */
			command: `npx vite build --mode development --outDir dist-test --emptyOutDir --logLevel warn && npx vite preview --outDir dist-test --port ${PORT} --strictPort`,
			url: `http://localhost:${PORT}`,
			env: { NODE_ENV: "development" },
			reuseExistingServer: false,
			timeout: 120_000,
		},
		{
			/* For the specs that import source modules at runtime, as a consumer's bundler would. */
			command: `npx vite --port ${DEV_PORT} --strictPort`,
			url: `http://localhost:${DEV_PORT}`,
			reuseExistingServer: false,
			timeout: 60_000,
		},
	],
})
