import { NO_SHADOW, pair } from "./pair"
import type { ThemePreset } from "./types"

/** Editorial: terracotta on warm paper, serif headings, a step larger type and generous spacing, for reading. */
export const editorial: ThemePreset = {
	label: "Editorial",
	description: "Serif headings on warm paper, set for reading.",
	config: {
		density: "comfortable",
		typography: {
			scale: 1.0625,
			fonts: { heading: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, ui-serif, serif" },
		},
		defaults: { card: { surface: "bordered", headerDivider: true } },
		theme: {
			radius: "0.75rem",
			radiusSm: "0.375rem",
			vars: { shadow: NO_SHADOW },
			colors: {
		background: pair("oklch(0.985 0.008 85)", "oklch(0.2 0.01 60)"),
		foreground: pair("oklch(0.28 0.02 60)", "oklch(0.96 0.01 85)"),
		card: pair("oklch(0.995 0.005 85)", "oklch(0.24 0.012 60)"),
		"card-foreground": pair("oklch(0.28 0.02 60)", "oklch(0.96 0.01 85)"),
		popover: pair("oklch(0.995 0.005 85)", "oklch(0.27 0.013 60)"),
		"popover-foreground": pair("oklch(0.28 0.02 60)", "oklch(0.96 0.01 85)"),
		muted: pair("oklch(0.955 0.014 80)", "oklch(0.225 0.011 60)"),
		"muted-foreground": pair("oklch(0.48 0.028 60)", "oklch(0.73 0.02 75)"),
		accent: pair("oklch(0.945 0.02 75)", "oklch(0.32 0.018 60)"),
		"accent-foreground": pair("oklch(0.25 0.025 55)", "oklch(0.97 0.008 85)"),
		border: pair("oklch(0.905 0.02 78)", "oklch(0.9 0.03 75 / 12%)"),
		input: pair("oklch(0.71 0.03 65)", "oklch(0.9 0.03 75 / 28%)"),
		ring: pair("oklch(0.55 0.12 45)", "oklch(0.66 0.11 50)"),
		primary: pair("oklch(0.47 0.14 40)", "oklch(0.72 0.12 50)"),
		"primary-foreground": pair("oklch(0.985 0.005 85)", "oklch(0.2 0.04 40)"),
		secondary: pair("oklch(0.95 0.016 78)", "oklch(0.25 0.012 60)"),
		"secondary-foreground": pair("oklch(0.25 0.025 55)", "oklch(0.96 0.01 85)"),
		link: pair("oklch(0.47 0.14 40)", "oklch(0.75 0.11 55)"),
		"chart-1": pair("oklch(0.55 0.13 45)", "oklch(0.72 0.12 50)"),
		sidebar: pair("oklch(0.96 0.012 80)", "oklch(0.17 0.01 60)"),
		"sidebar-foreground": pair("oklch(0.28 0.02 60)", "oklch(0.96 0.01 85)"),
		"sidebar-accent": pair("oklch(0.98 0.008 85)", "oklch(0.28 0.016 60)"),
		"sidebar-accent-foreground": pair("oklch(0.25 0.025 55)", "oklch(0.97 0.008 85)"),
		"sidebar-border": pair("oklch(0.905 0.02 78)", "oklch(0.9 0.03 75 / 12%)"),
		"sidebar-ring": pair("oklch(0.55 0.12 45)", "oklch(0.66 0.11 50)"),
			},
		},
	},
}
