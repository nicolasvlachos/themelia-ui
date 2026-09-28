import { describe, expect, it } from "vitest"

import { themes } from "@/lib/theming"

import { createTheme, serializeTheme, splitLightDark, themeFromConfig, themeToStyle } from "./theme-tweaker.utils"

/* Browser behaviour of the pairs is checked in tests/theme-tweaker-live.spec.ts. */
describe("serializeTheme", () => {
	it("writes one block, a colour edited in both modes as one light-dark pair", () => {
		const css = serializeTheme(
			createTheme({
				shared: { "--text-sm": "1rem" },
				light: { "--primary": "red" },
				dark: { "--primary": "blue" },
			}),
			{ banner: false },
		)
		expect(css).toBe(":root {\n\t--primary: light-dark(red, blue);\n\t--text-sm: 1rem;\n}\n")
	})

	it("keeps the kit's other half when a colour is edited in one mode", () => {
		const css = serializeTheme(createTheme({ light: { "--primary": "red" } }), { banner: false })
		const value = /--primary: (.+);/.exec(css)?.[1] ?? ""
		const halves = splitLightDark(value)
		expect(halves?.[0]).toBe("red")
		/* The dark half is the theme's own dark primary, not the light edit. */
		expect(halves?.[1]).toMatch(/^oklch\(/)
		expect(halves?.[1]).not.toBe("red")
	})

	it("scopes to a selector of the caller's", () => {
		const css = serializeTheme(createTheme({ shared: { "--radius": "0" } }), {
			banner: false,
			selectors: { shared: ".brand" },
		})
		expect(css.startsWith(".brand {")).toBe(true)
	})
})

describe("splitLightDark", () => {
	it("splits at the top-level comma, keeping a colour-mix half whole", () => {
		expect(splitLightDark("light-dark(color-mix(in oklab, red 20%, blue), oklch(0.2 0 0))")).toEqual([
			"color-mix(in oklab, red 20%, blue)",
			"oklch(0.2 0 0)",
		])
		expect(splitLightDark("oklch(0.5 0 0)")).toBeNull()
	})
})

describe("themeToStyle", () => {
	it("carries both modes in the style, so the element's color-scheme picks", () => {
		const style = themeToStyle(createTheme({ mode: "dark", light: { "--primary": "red" }, dark: { "--primary": "blue" } }))
		expect(style["--primary"]).toBe("light-dark(red, blue)")
	})
})

describe("themeFromConfig", () => {
	it.each(Object.entries(themes))("loads the %s theme so the style it produces is the theme itself", (_name, preset) => {
		const theme = preset.config.theme ?? {}
		const style = themeToStyle(themeFromConfig(theme))
		expect(style["--radius"]).toBe(theme.radius)
		expect(style["--radius-sm"]).toBe(theme.radiusSm)
		for (const [name, value] of Object.entries({ ...theme.colors, ...theme.vars })) {
			expect(style[`--${name}`]).toBe(value)
		}
	})

	it("keeps a single colour for both modes", () => {
		const theme = themeFromConfig({ colors: { primary: "oklch(0.5 0.1 200)" } })
		expect(theme.light["--primary"]).toBe("oklch(0.5 0.1 200)")
		expect(theme.dark["--primary"]).toBe("oklch(0.5 0.1 200)")
	})
})
