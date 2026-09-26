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

/** `UIConfig`'s `typography` slice: the type factor, the default size, fonts and sizes. */
export interface TypographyConfig {
	/**
	 * Type-only override (`--text-scale`): multiplies every `--text-*` role, control labels
	 * included, without changing geometry. Unset, type follows `scale`.
	 * @default 1
	 */
	scale?: number
	/**
	 * Size components fall back to when they set none. 14px, not 16px: `base` is a deliberate
	 * step up for a dense surface.
	 * @default "sm"
	 */
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
	 * @default true
	 */
	darkMenus?: boolean
}

export interface FormsConfig {
	/**
	 * Opt in to a 16px minimum for native text fields on detected iPhones only.
	 * @default false
	 */
	preventIPhoneZoom?: boolean
}

/** The locale shared by every formatter. Money and dates have their own slices. */
export interface FormattingConfig {
	/**
	 * BCP-47 tag used by every Intl formatter in the kit.
	 * @default "en-US"
	 */
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

/**
 * `UIConfig`'s `money` slice: the store's currency policy, decided once, so a call site
 * passes an amount and a conversion, never a policy.
 */
export interface MoneyConfig {
	/**
	 * Used when a `<Money>` is given no currency.
	 * @default "USD"
	 */
	defaultCurrency?: string
	/** A converted currency shown beside the primary one. */
	displayCurrency?: string
	/**
	 * The master switch. Off, a `secondary` passed at a call site still renders.
	 * @default false
	 */
	dualPricingEnabled?: boolean
	/**
	 * Whether a second currency shows. `dynamic` shows it only when the two codes differ;
	 * `dual` would print a price twice when they match.
	 * @default "dynamic"
	 */
	displayMode?: MoneyDisplayMode
	/**
	 * Where the second value sits: beside the first, or under it.
	 * @default "inline"
	 */
	layout?: MoneyLayout
	/**
	 * How an amount is written. `with-symbol` is Intl's own placement, which varies by locale
	 * and currency.
	 * @default "with-symbol"
	 */
	formatMode?: MoneyFormatMode
}

/**
 * `UIConfig`'s `dates` slice: the week start, the fallback patterns, the date-fns locale and
 * the relative-time wording.
 */
export interface DatesConfig {
	/**
	 * First day of the week in calendars and pickers. 0 = Sunday.
	 * @default 1
	 */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	/**
	 * date-fns pattern the date primitives fall back to.
	 * @default "dd MMM yyyy"
	 */
	format?: string
	/**
	 * date-fns pattern for a time of day. `"p"` uses the locale's own convention.
	 * @default "HH:mm"
	 */
	timeFormat?: string
	/**
	 * The date-fns Locale OBJECT — what actually translates month and weekday names, and the
	 * built-in relative-time wording. It cannot be derived from a BCP-47 tag such as
	 * `formatting.locale`: the locales are modules, and importing all of them to look one up
	 * would put every language in every bundle, so the consumer imports the one it needs.
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

/**
 * The configuration `UIProvider`, `UIRoot` and `UIScope` take. A scope names only what it
 * changes; everything else inherits from the scope around it.
 */
export interface UIConfig {
	/**
	 * Colour scheme. `system` follows `prefers-color-scheme`.
	 * @default "system"
	 */
	colorScheme?: ColorScheme
	/** Radius, colour, palette and custom-property overrides. */
	theme?: ThemeConfig
	/**
	 * Named spacing and control-geometry preset: `compact`, `default` and `comfortable` scale
	 * by 0.941176 (32px actions), 1 and 1.075. Readable typography is unchanged.
	 * @default "default"
	 */
	density?: Density
	/**
	 * Master factor (`--scale`). Geometry, spacing, icons and the type ramp follow it by
	 * default; use `density` or `typography.scale` to move only one of them.
	 * @default 1
	 */
	scale?: number
	/** The type factor, the default text size, font stacks and per-step sizes. */
	typography?: TypographyConfig
	/** Duration overrides, and motion forced off. */
	motion?: MotionConfig
	/** The modal scrim's blur, and whether menus render dark. */
	overlay?: OverlayConfig
	/** Form-control behaviour: the iPhone zoom guard. */
	forms?: FormsConfig
	/** The locale every formatter uses. */
	formatting?: FormattingConfig
	/** The store's currency policy: the default and display currencies, and how a pair shows. */
	money?: MoneyConfig
	/** The week start, date patterns, the date-fns locale and relative-time wording. */
	dates?: DatesConfig
	/** Per-component prop defaults, keyed by family and merged over each component's own. */
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
