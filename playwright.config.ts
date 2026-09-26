import { defineConfig, devices } from "@playwright/test"

/* The static test build; the dev server only for specs that import source at runtime. */
const PORT = Number(process.env.PORT ?? 4173)
/* Not 5173: another app on the usual dev port would be reused and tested instead of this one. */
const DEV_PORT = Number(process.env.DEV_PORT ?? 5198)
const TAILWIND = "**/fixtures/tailwind-v4/*.test.ts"
const ENGINE_SPECS = [
	"interaction", "popup-conformance", "rich-text-editor", "foundations-interactions",
	"iphone-input-zoom", "command-accessibility", "button-loading", "geometry",
].map((name) => `**/${name}.spec.ts`)

/**
 * Visual and token-conformance tests over the docs site.
 *
 * The docs site is the test fixture: it already renders every component and every
 * variation, so the tests do not need their own harness pages that could drift from what
 * the library actually ships.
 *
 * `reuseExistingServer` matters during development — a dev server is usually already up,
 * and starting a second one on the same port fails rather than falling through.
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
		/*
		 * Pinned to where the baselines were recorded: a native date input formats by locale,
		 * and anything grouped by local day (the analytics heatmap) shifts with the zone.
		 */
		locale: "en-US",
		timezoneId: "Europe/Sofia",
		trace: "retain-on-failure",
	},

	/*
	 * An absolute pixel budget, not a ratio.
	 *
	 * Calibrated against a real regression rather than guessed: breaking --field-radius so
	 * every field on the Input page changes shape moves about 128 pixels, because a corner
	 * arc is a tiny area even when it changes everywhere. The first version of this config
	 * allowed 2% of the image — over twenty thousand pixels — and passed that change
	 * without noticing. A ratio is also the wrong unit here, since pages differ in height
	 * by a factor of five and the same defect would be "big" on a short page and invisible
	 * on a long one.
	 *
	 * Baselines are engine/platform-stamped (`-chromium-darwin`), so they are compared in
	 * Chromium on macOS only; other engines run the behavioral contracts below.
	 */
	expect: {
		toHaveScreenshot: { maxDiffPixels: 60, animations: "disabled" },
	},

	/*
	 * The viewport is declared HERE, after the device spread, because that is the only
	 * place it takes effect.
	 *
	 * A project's `use` overrides the top-level one wholesale, and `devices["Desktop
	 * Chrome"]` carries a viewport of its own — so a `viewport` written at the top level
	 * is silently discarded. This file declared 1280x900 there for its whole life, with a
	 * comment explaining why a fixed viewport was load-bearing, while every run took the
	 * device's 1280x720. Anyone reading the config to work out what is on screen at a
	 * given scroll position got an answer 180 pixels too generous.
	 *
	 * 720 rather than 900 because that is what every baseline in this repository was
	 * captured at. Changing the number is a re-record of the whole set, not a config edit.
	 */
	/* All engines run behavioral, accessibility and computed-layout checks. Pixel
	 * comparisons use the existing reviewed Chromium/Darwin baselines only. */
	projects: [
		{
			name: "chromium",
			/*
			 * Pixel baselines are macOS-only, so another platform skips them. The Tailwind fixture
			 * compiles the built package and runs in its own project, beside the build.
			 */
			testIgnore: [TAILWIND, ...(process.platform === "darwin" ? [] : ["**/visual.spec.ts"])],
			use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
		},
		{ name: "tailwind", testMatch: TAILWIND, use: { ...devices["Desktop Chrome"] } },
		/*
		 * Firefox and WebKit run what differs by engine — keyboard and focus, popups, editing,
		 * form controls, iOS zoom and sub-pixel geometry. The route sweeps measure what the app
		 * renders, which Chromium covers.
		 */
		{
			name: "firefox",
			testMatch: ENGINE_SPECS,
			use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 720 } },
		},
		{
			name: "webkit",
			testMatch: ENGINE_SPECS,
			use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 720 } },
		},
	],

	webServer: [
		{
			/*
			 * A development-mode bundle served statically: React's warnings stay on, but a fresh
			 * page loads one bundle instead of ~1,200 dev-server modules (≈380ms, was ≈700ms).
			 * Built per run, so an edit made during a run never reaches it.
			 */
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
