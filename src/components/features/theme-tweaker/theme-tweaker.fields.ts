/**
 * The catalog of editable variables: every variable of the theme (styles/theme/*.css), grouped
 * by what it does. Every one of them is read by the kit, so every control changes something.
 * A colour is edited per mode: the edit lands in that mode's half of its `light-dark()` pair.
 */
import type {
	ThemeTweakerField, ThemeTweakerFieldKind, ThemeTweakerFieldScope, ThemeTweakerGroup,
	ThemeTweakerRangeControl, ThemeTweakerSection, ThemeVariableName,
} from "./theme-tweaker.types"

const SURFACE_COLORS = [
	"--background", "--foreground", "--card", "--card-foreground", "--popover",
	"--popover-foreground", "--muted", "--muted-foreground", "--accent", "--accent-foreground",
	"--border", "--input", "--ring",
] as const satisfies readonly ThemeVariableName[]

const BRAND_COLORS = [
	"--primary", "--primary-foreground", "--secondary", "--secondary-foreground",
	"--destructive", "--destructive-foreground",
] as const satisfies readonly ThemeVariableName[]

const CHART_COLORS = [
	"--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5",
] as const satisfies readonly ThemeVariableName[]

const SIDEBAR_COLORS = [
	"--sidebar", "--sidebar-foreground", "--sidebar-accent", "--sidebar-accent-foreground",
	"--sidebar-border", "--sidebar-ring",
] as const satisfies readonly ThemeVariableName[]

const STATE_COLORS = [
	"--success", "--success-foreground", "--info", "--info-foreground",
	"--warning", "--warning-foreground", "--link",
] as const satisfies readonly ThemeVariableName[]

/* One colour for both modes: the scrim is dark either way. */
const SHARED_COLORS = ["--overlay-backdrop"] as const satisfies readonly ThemeVariableName[]

const TINTS = ["--tint", "--tint-strong"] as const satisfies readonly ThemeVariableName[]

const FONT_VARIABLES = [
	"--font-sans", "--font-heading", "--font-mono",
] as const satisfies readonly ThemeVariableName[]

const TYPE_SCALE = [
	"--text-scale", "--text-xs", "--text-pxs", "--text-sm", "--text-base", "--text-lg",
	"--text-xl", "--text-2xl",
] as const satisfies readonly ThemeVariableName[]

const SHAPE = ["--radius", "--radius-sm", "--radius-pill", "--border-width"] as const satisfies readonly ThemeVariableName[]

const ELEVATION = ["--shadow", "--shadow-lg"] as const satisfies readonly ThemeVariableName[]

const SPACING = ["--padding", "--padding-sm", "--gap", "--gap-sm"] as const satisfies readonly ThemeVariableName[]

const CONTROLS = [
	"--control-height", "--control-height-sm", "--icon-size", "--icon-size-sm",
] as const satisfies readonly ThemeVariableName[]

const MOTION = ["--duration-fast", "--duration", "--ease", "--disabled-opacity"] as const satisfies readonly ThemeVariableName[]

const SHELL = ["--sidebar-width", "--header-height", "--content-width"] as const satisfies readonly ThemeVariableName[]

const DESCRIPTIONS: Partial<Record<ThemeVariableName, string>> = {
	"--background": "The page's canvas.",
	"--foreground": "Text and icons on the canvas.",
	"--card": "Framed regions: cards, table frames, panels.",
	"--popover": "Anchored popups, menus, palettes and toasts.",
	"--muted": "Wells and placeholders.",
	"--muted-foreground": "Supporting text: descriptions, metadata, hints.",
	"--accent": "The one hover and current-item fill.",
	"--border": "Every divider and frame.",
	"--input": "The frame of a control.",
	"--ring": "The focus outline.",
	"--primary": "Brand and primary-action colour.",
	"--primary-foreground": "Text and icons on a solid primary fill.",
	"--secondary": "The quiet solid fill.",
	"--destructive": "Destructive actions and errors.",
	"--link": "Inline links.",
	"--overlay-backdrop": "The scrim behind dialogs, sheets and drawers.",
	"--tint": "The soft fill a tone paints: a selected row, a soft badge, an alert's wash.",
	"--tint-strong": "The line a tone paints: a tinted edge or rule.",
	"--font-sans": "The interface font.",
	"--font-heading": "Headings; the interface font when unset.",
	"--font-mono": "Codes, identifiers and keys.",
	"--text-scale": "Multiplies every type size, control labels included; geometry stays put.",
	"--radius": "The container corner: cards, dialogs, popovers, menus.",
	"--radius-sm": "The item corner: controls, rows, chips, badges, tooltips.",
	"--radius-pill": "The round end of pills, switches and tracks.",
	"--border-width": "Every hairline; marks and focus draw at twice it.",
	"--shadow": "Raised: a framed card, a raised chip, a thumb.",
	"--shadow-lg": "Floating: popovers, menus, dialogs, toasts.",
	"--padding": "Container insets: cards, dialogs, sheets, popovers.",
	"--padding-sm": "Item insets: rows, cells, chips, fields.",
	"--gap": "Between groups: fields, cards, sections.",
	"--gap-sm": "Inside a group: icon and label, title and description.",
	"--control-height": "Buttons, fields, selects and triggers.",
	"--control-height-sm": "The smaller control.",
	"--icon-size": "Icons beside text and inside controls.",
	"--icon-size-sm": "Icons in dense rows and chips.",
	"--duration-fast": "State changes: hover, press, colour.",
	"--duration": "Entrances: popups, dialogs, panels.",
	"--ease": "The easing every transition shares.",
	"--disabled-opacity": "How far a disabled control fades.",
	"--sidebar-width": "The expanded sidebar, for Sidebar and every shell.",
	"--header-height": "Every shell's top bar.",
	"--content-width": "The readable page measure Container uses.",
}

/* Ranges within which the kit still looks like itself; other values go in the raw text box. */
const RANGE_CONTROLS: Partial<Record<ThemeVariableName, ThemeTweakerRangeControl>> = {
	"--radius": { type: "range", min: 0, max: 1.5, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--radius-sm": { type: "range", min: 0, max: 1, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--text-scale": { type: "range", min: 0.85, max: 1.3, step: 0.025, decimalPlaces: 3, fallback: 1 },
	"--padding": { type: "range", min: 0.5, max: 2, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--padding-sm": { type: "range", min: 0.25, max: 1, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--gap": { type: "range", min: 0.5, max: 2, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--gap-sm": { type: "range", min: 0.25, max: 1, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--control-height": { type: "range", min: 1.75, max: 3, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--control-height-sm": { type: "range", min: 1.5, max: 2.5, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--icon-size": { type: "range", min: 0.75, max: 1.5, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--icon-size-sm": { type: "range", min: 0.5, max: 1, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--disabled-opacity": { type: "range", min: 0.3, max: 0.7, step: 0.05, decimalPlaces: 2, fallback: 0.5 },
	"--sidebar-width": { type: "range", min: 12, max: 24, step: 0.25, unit: "rem", decimalPlaces: 2 },
	"--header-height": { type: "range", min: 3, max: 5, step: 0.125, unit: "rem", decimalPlaces: 3 },
	"--content-width": { type: "range", min: 40, max: 96, step: 1, unit: "rem", decimalPlaces: 0 },
}

/** `--sidebar-accent-foreground` → "Sidebar Accent Foreground". */
function labelFromName(name: ThemeVariableName): string {
	return name
		.replace(/^--/, "")
		.split("-")
		.map((part) =>
			// Three letters or fewer is an abbreviation (XS, 2XL, PXS).
			part.length <= 3 ? part.toUpperCase() : `${part[0]?.toUpperCase()}${part.slice(1)}`,
		)
		.join(" ")
}

function genericDescription(name: ThemeVariableName): string {
	if (name.startsWith("--chart-")) return "A categorical series colour. Keep status meaning out of it."
	if (name.startsWith("--sidebar")) return "A sidebar colour."
	if (name.endsWith("-foreground")) return "Text and icons on the matching fill."
	if (name.startsWith("--text-")) return "Font size for the matching type step."
	return "A theme variable the kit reads."
}

function fields(
	names: readonly ThemeVariableName[],
	group: ThemeTweakerGroup,
	section: ThemeTweakerSection,
	scope: ThemeTweakerFieldScope,
	kind: ThemeTweakerFieldKind,
): ThemeTweakerField[] {
	return names.map((name) => ({
		name,
		label: labelFromName(name),
		description: DESCRIPTIONS[name] ?? genericDescription(name),
		group,
		section,
		scope,
		kind,
		control: RANGE_CONTROLS[name],
	}))
}

export const defaultThemeTweakerFields: readonly ThemeTweakerField[] = [
	...fields(SURFACE_COLORS, "colors", "surfaces-content", "mode", "color"),
	...fields(SHARED_COLORS, "colors", "surfaces-content", "shared", "color"),
	...fields(BRAND_COLORS, "colors", "brand-actions", "mode", "color"),
	...fields(CHART_COLORS, "colors", "charts", "mode", "color"),
	...fields(SIDEBAR_COLORS, "colors", "sidebar", "mode", "color"),
	...fields(STATE_COLORS, "states", "semantic-feedback", "mode", "color"),
	...fields(TINTS, "states", "tints", "shared", "length"),
	...fields(FONT_VARIABLES, "typography", "font-families", "shared", "font"),
	...fields(TYPE_SCALE.slice(0, 1), "typography", "type-scale", "shared", "number"),
	...fields(TYPE_SCALE.slice(1), "typography", "type-scale", "shared", "length"),
	...fields(SHAPE, "shape", "radius", "shared", "length"),
	...fields(ELEVATION, "shape", "elevation", "shared", "shadow"),
	...fields(SPACING, "structure", "spacing", "shared", "length"),
	...fields(CONTROLS, "structure", "controls", "shared", "length"),
	...fields(MOTION.slice(0, 3), "structure", "motion", "shared", "length"),
	...fields(MOTION.slice(3), "structure", "motion", "shared", "number"),
	...fields(SHELL, "structure", "application-shell", "shared", "length"),
]
