/**
 * Recipes: one decision that produces many coherent values. Derived colours stay CSS
 * (`color-mix(… var(--primary) …)`), not computed literals, so they keep following the
 * tokens they derive from.
 */
import { readableForeground } from "./contrast"
import type { ThemeMode, ThemeOverrides } from "./types"

export interface ThemePaletteRecipe {
	primary: string
	mode?: ThemeMode
}

export interface ThemeTypeScaleRecipe {
	/** The body anchor, in pixels. The kit's own is 16. */
	baseSize: number
	/** The modular ratio headings step by. */
	ratio?: number
}

export interface ThemeElevationRecipe {
	/** 0 is flat, 1 is pronounced; 0.8 reproduces the default theme. */
	intensity: number
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value))
}

/** The more readable of ink and paper on `color`, measured (lib/theming/contrast.ts). */
function contrastForeground(color: string, mode: ThemeMode): string {
	return readableForeground(color, mode).color
}

/** A coherent brand from one primary colour. */
export function deriveThemePalette({ primary, mode = "light" }: ThemePaletteRecipe): ThemeOverrides {
	return {
		"--primary": primary,
		"--primary-foreground": contrastForeground(primary, mode),
		"--secondary": "color-mix(in oklch, var(--primary) 10%, var(--background))",
		"--secondary-foreground": "var(--foreground)",
		"--muted": "color-mix(in oklch, var(--primary) 7%, var(--background))",
		"--muted-foreground": "color-mix(in oklch, var(--foreground) 62%, var(--background))",
		"--accent": "color-mix(in oklch, var(--primary) 14%, var(--background))",
		"--accent-foreground": "var(--foreground)",
		"--border": "color-mix(in oklch, var(--primary) 14%, var(--background))",
		"--input": "color-mix(in oklch, var(--primary) 18%, var(--background))",
		"--ring": "var(--primary)",
		"--link-color": "var(--primary)",
		/* Each series walks the primary toward a semantic without landing on a status colour. */
		"--chart-1": "var(--primary)",
		"--chart-2": "color-mix(in oklch, var(--primary) 68%, var(--info))",
		"--chart-3": "color-mix(in oklch, var(--primary) 60%, var(--success))",
		"--chart-4": "color-mix(in oklch, var(--primary) 58%, var(--warning))",
		"--chart-5": "color-mix(in oklch, var(--primary) 52%, var(--destructive))",
		"--sidebar-primary": "var(--primary)",
		"--sidebar-primary-foreground": "var(--primary-foreground)",
		"--sidebar-accent": "var(--accent)",
		"--sidebar-accent-foreground": "var(--accent-foreground)",
		"--sidebar-border": "var(--border)",
		"--sidebar-ring": "var(--ring)",
	}
}

/*
 * Only the ladder styles/tokens/foundation.css declares; a step nothing reads is noise.
 * Body steps are fixed ratios of the base; only headings follow the modular ratio.
 */
const BODY_STEPS = { xs: 0.75, pxs: 0.8125, sm: 0.875, base: 1 } as const

const HEADING_STEPS = ["lg", "xl", "2xl"] as const

export function deriveThemeTypeScale({
	baseSize,
	ratio = 1.2,
}: ThemeTypeScaleRecipe): ThemeOverrides {
	const base = clamp(baseSize, 14, 20)
	const step = clamp(ratio, 1.125, 1.333)
	const overrides: ThemeOverrides = {}

	for (const [name, factor] of Object.entries(BODY_STEPS)) {
		// 12px floor: below it the smallest step stops being readable at any base.
		const pixels = Math.max(12, base * factor)
		overrides[`--text-${name}`] = `${Number((pixels / 16).toFixed(4))}rem`
		// The looser of 6px of leading or 1.45×.
		overrides[`--text-${name}--line-height`] =
			`${Number((Math.max(pixels + 6, pixels * 1.45) / pixels).toFixed(4))}`
	}

	HEADING_STEPS.forEach((name, index) => {
		const pixels = base * step ** (index + 1)
		overrides[`--text-${name}`] = `${Number((pixels / 16).toFixed(4))}rem`
		// Tighter as the type grows: display sizes need less leading, not more.
		overrides[`--text-${name}--line-height`] =
			`${Number(clamp(1.55 - index * 0.065, 1, 1.5).toFixed(4))}`
	})

	return overrides
}

/**
 * The whole shadow ladder from one intensity: the default theme's geometry and
 * `--shadow-ink`, with every layer's ink scaled so 0.8 reproduces it exactly.
 */
export function deriveThemeElevation({ intensity }: ThemeElevationRecipe): ThemeOverrides {
	const value = clamp(intensity, 0, 1)
	const ink = (percent: number) =>
		`color-mix(in oklab, var(--shadow-ink) ${Number(((value / 0.8) * percent).toFixed(2))}%, transparent)`

	return {
		"--shadow-2xs": `0 1px 2px 0px ${ink(4)}`,
		"--shadow-xs": `0 1px 2px 0px ${ink(6)}, 0 1px 1px -1px ${ink(6)}`,
		"--shadow-sm": `0 1px 2px 0px ${ink(6)}, 0 2px 4px -2px ${ink(10)}`,
		"--shadow": `0 1px 3px 0px ${ink(8)}, 0 4px 8px -4px ${ink(12)}`,
		"--shadow-md": `0 2px 4px -1px ${ink(8)}, 0 8px 16px -8px ${ink(16)}`,
		"--shadow-lg": `0 4px 8px -2px ${ink(10)}, 0 12px 24px -12px ${ink(18)}`,
		"--shadow-xl": `0 8px 16px -4px ${ink(12)}, 0 20px 40px -20px ${ink(22)}`,
		"--shadow-2xl": `0 16px 32px -8px ${ink(18)}, 0 32px 64px -28px ${ink(28)}`,
	}
}
