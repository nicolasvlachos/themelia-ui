import type { ResolvedUIConfig } from "./types"

/**
 * Library-wide defaults for JS-side decisions only. Anything expressible as a token has
 * its default in the stylesheet, so the two cannot drift.
 */
export const DEFAULT_UI_CONFIG: ResolvedUIConfig = {
	colorScheme: "system",
	density: "default",
	scale: 1,
	typography: { defaultTextSize: "sm" },
	/* Menus render dark on a light page too — see `OverlayConfig.darkMenus`. */
	overlay: { darkMenus: true },
	forms: { preventIPhoneZoom: false },
	formatting: { locale: "en-US" },
	money: {
		defaultCurrency: "USD",
		dualPricingEnabled: false,
		/* `dynamic`, not `dual`: `dual` prints a price twice when both codes match. */
		displayMode: "dynamic",
		layout: "inline",
		/* Intl's own symbol placement, which varies by locale and currency. */
		formatMode: "with-symbol",
	},
	dates: {
		/* Monday (ISO-8601). */
		weekStartsOn: 1,
		format: "dd MMM yyyy",
		/* 24-hour; `"p"` follows the locale instead. */
		timeFormat: "HH:mm",
	},
}
