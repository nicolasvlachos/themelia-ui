import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

import { fileURLToPath } from "node:url"

/**
 * The unit runner, for behaviour the Playwright suites structurally cannot see.
 *
 * Those suites walk preview routes, so they cover what a page renders. They cannot cover a
 * hook's reaction to a prop flipping mid-gesture, an effect's cleanup, SSR output, or two
 * React roots arbitrating over the document — and those are exactly where this kit's
 * defects have been. `UIRoot` shipped three of them at once.
 *
 * Deliberately narrow: unit tests here are for logic the routes cannot reach. Anything a
 * page can show belongs in the visual, contrast, geometry or layout-fault suites, which
 * scale automatically with the route table.
 */
export default defineConfig({
	plugins: [react()],
	resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
	test: {
		environment: "jsdom",
		globals: true,
		include: ["src/**/*.test.{ts,tsx}"],
		setupFiles: ["./tests/unit-setup.ts"],
	},
})
