import { pair } from "./pair"
import type { ThemePreset } from "./types"

/** Soft: violet on rosy neutrals, large corners, diffuse shadows, comfortable spacing and gentler motion. */
export const soft: ThemePreset = {
	label: "Soft",
	description: "Rounded corners, diffuse shadows and room to breathe.",
	config: {
		density: "comfortable",
		motion: { durations: { fast: "180ms", normal: "260ms" } },
		defaults: { card: { surface: "framed" } },
		theme: {
			radius: "1.5rem",
			radiusSm: "0.75rem",
			vars: {
				shadow: "0 1px 2px oklch(0 0 0 / 4%), 0 6px 16px -6px oklch(0 0 0 / 10%)",
				"shadow-lg": "0 10px 24px -8px oklch(0 0 0 / 14%), 0 28px 56px -20px oklch(0 0 0 / 20%)",
			},
			colors: {
		background: pair("oklch(0.99 0.005 320)", "oklch(0.195 0.022 310)"),
		foreground: pair("oklch(0.27 0.035 310)", "oklch(0.965 0.01 320)"),
		card: pair("oklch(1 0 0)", "oklch(0.235 0.026 310)"),
		"card-foreground": pair("oklch(0.27 0.035 310)", "oklch(0.965 0.01 320)"),
		popover: pair("oklch(1 0 0)", "oklch(0.265 0.028 310)"),
		"popover-foreground": pair("oklch(0.27 0.035 310)", "oklch(0.965 0.01 320)"),
		muted: pair("oklch(0.965 0.013 320)", "oklch(0.22 0.024 310)"),
		"muted-foreground": pair("oklch(0.48 0.04 312)", "oklch(0.73 0.035 315)"),
		accent: pair("oklch(0.955 0.022 318)", "oklch(0.31 0.04 310)"),
		"accent-foreground": pair("oklch(0.24 0.045 310)", "oklch(0.975 0.008 320)"),
		border: pair("oklch(0.915 0.018 318)", "oklch(0.85 0.05 315 / 13%)"),
		input: pair("oklch(0.72 0.035 314)", "oklch(0.85 0.05 315 / 30%)"),
		ring: pair("oklch(0.55 0.16 305)", "oklch(0.68 0.14 305)"),
		primary: pair("oklch(0.49 0.19 303)", "oklch(0.74 0.14 305)"),
		"primary-foreground": pair("oklch(0.985 0 0)", "oklch(0.18 0.05 305)"),
		secondary: pair("oklch(0.96 0.016 318)", "oklch(0.25 0.03 310)"),
		"secondary-foreground": pair("oklch(0.24 0.045 310)", "oklch(0.965 0.01 320)"),
		link: pair("oklch(0.48 0.19 300)", "oklch(0.76 0.13 305)"),
		"chart-1": pair("oklch(0.55 0.17 305)", "oklch(0.74 0.14 305)"),
		sidebar: pair("oklch(0.965 0.012 320)", "oklch(0.16 0.022 310)"),
		"sidebar-foreground": pair("oklch(0.27 0.035 310)", "oklch(0.965 0.01 320)"),
		"sidebar-accent": pair("oklch(0.985 0.006 320)", "oklch(0.27 0.035 310)"),
		"sidebar-accent-foreground": pair("oklch(0.24 0.045 310)", "oklch(0.975 0.008 320)"),
		"sidebar-border": pair("oklch(0.915 0.018 318)", "oklch(0.85 0.05 315 / 13%)"),
		"sidebar-ring": pair("oklch(0.55 0.16 305)", "oklch(0.68 0.14 305)"),
			},
		},
	},
}
