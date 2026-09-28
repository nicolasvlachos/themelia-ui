import { NO_SHADOW, pair } from "./pair"
import type { ThemePreset } from "./types"

/** Sharp: monochrome ink, square corners, hairlines instead of shadows, and quick motion. Links keep the kit's blue, so a link still reads as one without its underline. */
export const sharp: ThemePreset = {
	label: "Sharp",
	description: "Square corners, hairlines and no shadows: an interface drawn in ink.",
	config: {
		motion: { durations: { fast: "90ms", normal: "120ms" } },
		/* A frame's band needs a corner to follow; square, a card is one hairline. */
		defaults: { card: { surface: "card", headerDivider: true }, accordion: { surface: "flat" } },
		theme: {
			/* `0px`, not `0`: the corners are computed with calc(), which cannot subtract a length from a number. */
			radius: "0px",
			radiusSm: "0px",
			vars: { shadow: NO_SHADOW, "shadow-lg": NO_SHADOW },
			colors: {
		background: pair("oklch(1 0 0)", "oklch(0.17 0 0)"),
		foreground: pair("oklch(0.21 0 0)", "oklch(0.97 0 0)"),
		card: pair("oklch(1 0 0)", "oklch(0.21 0 0)"),
		"card-foreground": pair("oklch(0.21 0 0)", "oklch(0.97 0 0)"),
		popover: pair("oklch(1 0 0)", "oklch(0.24 0 0)"),
		"popover-foreground": pair("oklch(0.21 0 0)", "oklch(0.97 0 0)"),
		muted: pair("oklch(0.965 0 0)", "oklch(0.2 0 0)"),
		"muted-foreground": pair("oklch(0.47 0 0)", "oklch(0.72 0 0)"),
		accent: pair("oklch(0.955 0 0)", "oklch(0.3 0 0)"),
		"accent-foreground": pair("oklch(0.2 0 0)", "oklch(0.98 0 0)"),
		border: pair("oklch(0.905 0 0)", "oklch(1 0 0 / 12%)"),
		input: pair("oklch(0.7 0 0)", "oklch(1 0 0 / 30%)"),
		ring: pair("oklch(0.4 0 0)", "oklch(0.75 0 0)"),
		primary: pair("oklch(0.24 0 0)", "oklch(0.94 0 0)"),
		"primary-foreground": pair("oklch(0.985 0 0)", "oklch(0.2 0 0)"),
		secondary: pair("oklch(0.955 0 0)", "oklch(0.24 0 0)"),
		"secondary-foreground": pair("oklch(0.2 0 0)", "oklch(0.97 0 0)"),
		"chart-1": pair("oklch(0.45 0.02 260)", "oklch(0.78 0.02 260)"),
		sidebar: pair("oklch(0.96 0 0)", "oklch(0.14 0 0)"),
		"sidebar-foreground": pair("oklch(0.21 0 0)", "oklch(0.97 0 0)"),
		"sidebar-accent": pair("oklch(0.985 0 0)", "oklch(0.26 0 0)"),
		"sidebar-accent-foreground": pair("oklch(0.2 0 0)", "oklch(0.98 0 0)"),
		"sidebar-border": pair("oklch(0.905 0 0)", "oklch(1 0 0 / 12%)"),
		"sidebar-ring": pair("oklch(0.4 0 0)", "oklch(0.75 0 0)"),
			},
		},
	},
}
