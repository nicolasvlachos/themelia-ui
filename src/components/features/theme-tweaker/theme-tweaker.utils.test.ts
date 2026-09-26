import { describe, expect, it } from "vitest"

import { createTheme, serializeTheme } from "./theme-tweaker.utils"

/* Browser behaviour of these selectors is checked in tests/theme-tweaker-live.spec.ts. */
describe("serializeTheme", () => {
	const css = serializeTheme(
		createTheme({
			shared: { "--text-sm": "1rem" },
			light: { "--primary": "red" },
			dark: { "--primary": "blue" },
		}),
		{ banner: false },
	)

	it("writes shared values at every scope boundary, not only :root", () => {
		expect(css).toMatch(/^:root,\n\[data-ui-scope\],\n\[data-density\],\n\[data-theme\],\n\.light,\n\.dark \{\n\t--text-sm: 1rem;/)
	})

	it("reaches the provider's data-theme and the OS preference, not only a .dark class", () => {
		expect(css).toContain('[data-theme="dark"]')
		expect(css).toContain("@media (prefers-color-scheme: dark) {")
		expect(css).toContain("@media (prefers-color-scheme: light) {")
	})

	it("puts the OS-preference blocks before the explicit ones, so an explicit theme wins", () => {
		expect(css.indexOf("prefers-color-scheme: dark")).toBeLessThan(css.indexOf('\n[data-theme="dark"]'))
	})
})
