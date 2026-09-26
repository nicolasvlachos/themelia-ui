import { describe, expect, it } from "vitest"

import { mergeUIConfig } from "./context"
import { DEFAULT_UI_CONFIG } from "./defaults"

/**
 * `mergeUIConfig`: a scope inherits everything it does not name, one level below each
 * slice too, so setting `theme.colors.primary` keeps the other colours.
 */
describe("mergeUIConfig", () => {
	const parent = mergeUIConfig(DEFAULT_UI_CONFIG, {
		theme: {
			colors: { primary: "blue", secondary: "blue" },
			palette: { "brand-600": "#3b82f6", "danger-600": "#ef4444" },
			vars: { "--brand-gap": "4px", "--brand-inset": "8px" },
		},
		typography: {
			fonts: { sans: "Inter", mono: "Menlo" },
			sizes: { sm: "13px", lg: "15px" },
		},
		motion: { durations: { fast: "80ms", normal: "160ms" } },
	})

	it("merges theme.colors one level rather than replacing the record", () => {
		const result = mergeUIConfig(parent, { theme: { colors: { primary: "red" } } })

		expect(result.theme?.colors).toEqual({ primary: "red", secondary: "blue" })
	})

	it("merges theme.palette", () => {
		const result = mergeUIConfig(parent, { theme: { palette: { "brand-600": "#000" } } })

		expect(result.theme?.palette).toEqual({ "brand-600": "#000", "danger-600": "#ef4444" })
	})

	it("merges theme.vars", () => {
		const result = mergeUIConfig(parent, { theme: { vars: { "--brand-gap": "12px" } } })

		expect(result.theme?.vars).toEqual({ "--brand-gap": "12px", "--brand-inset": "8px" })
	})

	it("merges typography.fonts and typography.sizes", () => {
		const result = mergeUIConfig(parent, {
			typography: { fonts: { mono: "Fira Code" }, sizes: { sm: "12px" } },
		})

		expect(result.typography?.fonts).toEqual({ sans: "Inter", mono: "Fira Code" })
		expect(result.typography?.sizes).toEqual({ sm: "12px", lg: "15px" })
	})

	it("merges motion.durations", () => {
		const result = mergeUIConfig(parent, { motion: { durations: { fast: "0ms" } } })

		expect(result.motion?.durations).toEqual({ fast: "0ms", normal: "160ms" })
	})

	it("keeps a sibling record the config never mentions", () => {
		/* Naming `colors` must not disturb `palette`. */
		const result = mergeUIConfig(parent, { theme: { colors: { primary: "red" } } })

		expect(result.theme?.palette).toEqual({ "brand-600": "#3b82f6", "danger-600": "#ef4444" })
	})

	it("still replaces a scalar inside a slice", () => {
		/* One level, not recursive. A scalar is a value, and naming it means replacing it. */
		const withRadius = mergeUIConfig(parent, { theme: { radius: "4px" } })
		const overridden = mergeUIConfig(withRadius, { theme: { radius: "8px" } })

		expect(overridden.theme?.radius).toBe("8px")
	})

	it("keeps a slice's other keys when a record is set", () => {
		const result = mergeUIConfig(parent, { typography: { fonts: { sans: "Georgia" } } })

		expect(result.typography?.defaultTextSize).toBe("sm")
	})

	it("leaves a record unset when neither side sets it", () => {
		/* No invented empty records: `{ ...undefined, ...undefined }` is `{}`. */
		const result = mergeUIConfig(DEFAULT_UI_CONFIG, { colorScheme: "dark" })

		expect(result.theme?.colors).toBeUndefined()
		expect(result.motion?.durations).toBeUndefined()
	})

	it("takes the child's record when the parent has none", () => {
		const result = mergeUIConfig(DEFAULT_UI_CONFIG, { theme: { colors: { primary: "red" } } })

		expect(result.theme?.colors).toEqual({ primary: "red" })
	})

	it("still merges component defaults per family", () => {
		/* Existing behaviour, pinned. */
		const base = mergeUIConfig(DEFAULT_UI_CONFIG, {
			defaults: { button: { tone: "primary", buttonStyle: "solid" } },
		})
		const result = mergeUIConfig(base, { defaults: { button: { tone: "destructive" } } })

		expect(result.defaults?.button).toEqual({ tone: "destructive", buttonStyle: "solid" })
	})

	it("keeps scalars falling through from the parent", () => {
		const result = mergeUIConfig(parent, { theme: { colors: { primary: "red" } } })

		expect(result.colorScheme).toBe(DEFAULT_UI_CONFIG.colorScheme)
		expect(result.money?.defaultCurrency).toBe("USD")
	})
})
