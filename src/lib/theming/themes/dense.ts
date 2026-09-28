import { pair } from "./pair"
import type { ThemePreset } from "./types"

/** Dense: blue on cool neutrals, compact spacing, small corners and bordered cards, for screens full of data. */
export const dense: ThemePreset = {
	label: "Dense",
	description: "Compact spacing and small corners for screens full of data.",
	config: {
		density: "compact",
		motion: { durations: { fast: "100ms", normal: "140ms" } },
		defaults: { card: { surface: "card", headerDivider: true } },
		theme: {
			radius: "0.625rem",
			radiusSm: "0.3125rem",
			vars: { shadow: "0 1px 1px oklch(0 0 0 / 5%)" },
			colors: {
		background: pair("oklch(0.99 0.005 245)", "oklch(0.195 0.018 255)"),
		foreground: pair("oklch(0.27 0.03 250)", "oklch(0.965 0.008 245)"),
		card: pair("oklch(1 0 0)", "oklch(0.235 0.022 255)"),
		"card-foreground": pair("oklch(0.27 0.03 250)", "oklch(0.965 0.008 245)"),
		popover: pair("oklch(1 0 0)", "oklch(0.265 0.024 255)"),
		"popover-foreground": pair("oklch(0.27 0.03 250)", "oklch(0.965 0.008 245)"),
		muted: pair("oklch(0.965 0.012 245)", "oklch(0.22 0.02 255)"),
		"muted-foreground": pair("oklch(0.48 0.035 250)", "oklch(0.72 0.03 248)"),
		accent: pair("oklch(0.955 0.02 245)", "oklch(0.31 0.035 255)"),
		"accent-foreground": pair("oklch(0.24 0.04 250)", "oklch(0.975 0.006 245)"),
		border: pair("oklch(0.915 0.016 245)", "oklch(0.85 0.04 250 / 13%)"),
		input: pair("oklch(0.72 0.03 248)", "oklch(0.85 0.04 250 / 30%)"),
		ring: pair("oklch(0.55 0.14 252)", "oklch(0.66 0.12 252)"),
		primary: pair("oklch(0.48 0.16 255)", "oklch(0.72 0.13 250)"),
		"primary-foreground": pair("oklch(0.985 0 0)", "oklch(0.18 0.04 255)"),
		secondary: pair("oklch(0.96 0.015 245)", "oklch(0.25 0.025 255)"),
		"secondary-foreground": pair("oklch(0.24 0.04 250)", "oklch(0.965 0.008 245)"),
		link: pair("oklch(0.47 0.17 258)", "oklch(0.74 0.12 250)"),
		"chart-1": pair("oklch(0.55 0.15 252)", "oklch(0.72 0.13 250)"),
		sidebar: pair("oklch(0.965 0.01 245)", "oklch(0.16 0.018 255)"),
		"sidebar-foreground": pair("oklch(0.27 0.03 250)", "oklch(0.965 0.008 245)"),
		"sidebar-accent": pair("oklch(0.985 0.006 245)", "oklch(0.27 0.03 255)"),
		"sidebar-accent-foreground": pair("oklch(0.24 0.04 250)", "oklch(0.975 0.006 245)"),
		"sidebar-border": pair("oklch(0.915 0.016 245)", "oklch(0.85 0.04 250 / 13%)"),
		"sidebar-ring": pair("oklch(0.55 0.14 252)", "oklch(0.66 0.12 252)"),
			},
		},
	},
}
