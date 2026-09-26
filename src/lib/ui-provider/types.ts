import type { Locale } from "date-fns"

import type { ComponentScale } from "@/lib/component-vocabulary"

import type { PaletteToken, SemanticToken } from "./tokens.generated"

export type { ComponentScale }
export type { PaletteToken, SemanticToken }

/** Spacing and control-geometry preset. Sets `--density-scale` through `data-density`. */
export type Density = "compact" | "default" | "comfortable"

/**
 * Step on the type scale. `inherit` lets the surrounding size flow through.
 * `xxs` is deprecated: it renders as `xs`, so write `xs`.
 */
export type TextSize = "inherit" | "xxs" | "xs" | "pxs" | "sm" | "base" | "lg" | "xl"

export type ColorScheme = "light" | "dark" | "system"

/** Theme overrides. Token names are generated from the stylesheet, so a typo is a type error. */
export interface ThemeConfig {
	/** The container radius — cards, dialogs, popovers, menus. Writes `--radius`. */
	radius?: string
	/**
	 * The inner radius — controls, rows, chips, badges, tooltips. Writes `--radius-sm`.
	 * Not derived from `radius`: set both.
	 */
	radiusSm?: string
	/** Semantic colour overrides. Prefer these to `palette`. */
	colors?: Partial<Record<SemanticToken, string>>
	/** Primitive ramp overrides: moves every semantic resolving through the step. */
	palette?: Partial<Record<PaletteToken, string>>
	/** Escape hatch for custom properties the kit does not define. Keys omit `--`. */
	vars?: Record<string, string>
}

export interface TypographyConfig {
	/**
	 * Type factor (`--text-scale`): multiplies every type role, control labels included, and
	 * leaves geometry alone. Unset, type follows `scale`.
	 */
	scale?: number
	/** Size components fall back to when they set none. Defaults to `sm` (14px). */
	defaultTextSize?: TextSize
	/** Font stack overrides. */
	fonts?: Partial<Record<"sans" | "serif" | "mono" | "heading", string>>
	/** Per-step size overrides, keyed without the `--text-` prefix. */
	sizes?: Partial<Record<Exclude<TextSize, "inherit">, string>>
}

export interface MotionConfig {
	/** Duration overrides, keyed without the `--duration-` prefix. */
	durations?: Partial<Record<"instant" | "fast" | "normal", string>>
	/** `true` forces motion off; unset respects `prefers-reduced-motion`. */
	reduced?: boolean
}

export interface OverlayConfig {
	/**
	 * Blur behind a modal's scrim, in px (a number) or any CSS length. Off by default: a
	 * backdrop filter repaints everything behind the surface each frame.
	 */
	backdropBlur?: number | string
	/**
	 * Dropdown and context menus render in the dark scheme whatever the page is. Default
	 * `true`; `false` lets them follow the scheme they are portalled into, like other popups.
	 * A config value, not a CSS switch: Firefox lacks CSS `if()`.
	 */
	darkMenus?: boolean
}

export interface FormsConfig {
	/** Opt in to a 16px minimum for native text fields on detected iPhones only. Default false. */
	preventIPhoneZoom?: boolean
}

/** The locale shared by every formatter. Money and dates have their own slices. */
export interface FormattingConfig {
	/** BCP-47 tag used by every Intl formatter in the kit. */
	locale?: string
}

/** How an amount is written. Separate from WHICH currency it is in. */
export type MoneyFormatMode = "decimal" | "with-code" | "with-symbol"

/** Whether a second currency shows. `dynamic` shows it only when the two codes differ. */
export type MoneyDisplayMode = "primary-only" | "dual" | "dynamic"

/** Where the second value sits. */
export type MoneyLayout = "inline" | "stacked"

/** How loud the second value is against the first. */
export type MoneySecondaryEmphasis = "discrete" | "muted" | "match" | "hidden"

export interface MoneyConfig {
	/** Used when a `<Money>` is given no currency. */
	defaultCurrency?: string
	/** A converted currency shown beside the primary one. */
	displayCurrency?: string
	/** The master switch. Off, a `secondary` passed at a call site still renders. */
	dualPricingEnabled?: boolean
	displayMode?: MoneyDisplayMode
	layout?: MoneyLayout
	formatMode?: MoneyFormatMode
}

export interface DatesConfig {
	/** First day of the week in calendars and pickers. 0 = Sunday. */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	/** date-fns pattern the date primitives fall back to. */
	format?: string
	/** date-fns pattern for a time of day. `"p"` uses the locale's own convention. */
	timeFormat?: string
	/**
	 * The date-fns locale object that translates month and weekday names. Not derived from
	 * `formatting.locale`, so the bundle carries only the locale the consumer imports.
	 */
	locale?: Locale
	/** Replaces the relative-time wording ("7 days ago", "in 2 hours"). */
	formatRelativeTime?: (date: Date, now: Date) => string
}

/**
 * Per-component prop defaults. Empty here; each family augments it from its own directory:
 *
 * ```ts
 * declare module "@/lib/ui-provider" {
 *   interface ComponentDefaults {
 *     button: { tone: ButtonTone; buttonStyle: ButtonStyle }
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComponentDefaults {}

export interface UIConfig {
	/** Colour scheme. `system` follows `prefers-color-scheme`. */
	colorScheme?: ColorScheme
	theme?: ThemeConfig
	/** Named spacing/control-density preset. Readable typography is unchanged. */
	density?: Density
	/**
	 * Whole-UI factor (`--scale`). Default 1. Multiplies geometry, spacing, icons and type; use
	 * `density` or `typography.scale` to move only one of them.
	 */
	scale?: number
	typography?: TypographyConfig
	motion?: MotionConfig
	overlay?: OverlayConfig
	forms?: FormsConfig
	formatting?: FormattingConfig
	money?: MoneyConfig
	dates?: DatesConfig
	defaults?: { [K in keyof ComponentDefaults]?: Partial<ComponentDefaults[K]> }
}

/** A config with every JS-side decision resolved. Token slices stay partial by design. */
export interface ResolvedUIConfig extends UIConfig {
	colorScheme: ColorScheme
	overlay: OverlayConfig & { darkMenus: boolean }
	density: Density
	scale: number
	typography: TypographyConfig & { defaultTextSize: TextSize }
	formatting: Required<FormattingConfig>
	/** `displayCurrency` stays optional: having none is the ordinary case, not a gap. */
	money: Required<Omit<MoneyConfig, "displayCurrency">> & Pick<MoneyConfig, "displayCurrency">
	/** `locale` and `formatRelativeTime` stay optional: English is built in. */
	dates: Required<Omit<DatesConfig, "locale" | "formatRelativeTime">> &
		Pick<DatesConfig, "locale" | "formatRelativeTime">
}
