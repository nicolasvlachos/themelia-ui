/**
 * The catalog of editable variables: every public raw token the stylesheet declares at
 * `:root`, and nothing derived from one (a derived token would stop following its source).
 * Grouped by what a variable does, not by the file that declares it.
 */
import type {
	ThemeTweakerField, ThemeTweakerFieldKind, ThemeTweakerFieldScope, ThemeTweakerGroup,
	ThemeTweakerRangeControl, ThemeTweakerSection, ThemeVariableName,
} from "./theme-tweaker.types"

const THEME_COLORS = [
	"--background", "--foreground", "--card", "--card-foreground", "--popover",
	"--popover-foreground",
	"--primary", "--primary-foreground", "--secondary", "--secondary-foreground",
	"--muted", "--muted-foreground", "--accent", "--accent-foreground",
	"--destructive", "--destructive-foreground", "--border", "--input", "--ring",
	"--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5",
	"--sidebar", "--sidebar-foreground", "--sidebar-primary", "--sidebar-primary-foreground",
	"--sidebar-accent", "--sidebar-accent-foreground", "--sidebar-border", "--sidebar-ring",
] as const satisfies readonly ThemeVariableName[]

const STATE_COLORS = [
	"--success", "--success-foreground", "--info", "--info-foreground",
	"--warning", "--warning-foreground", "--warning-accent",
	"--link-color", "--primary-accent",
	"--inverse-background", "--inverse-foreground", "--inverse-muted", "--inverse-subtle",
	"--inverse-disabled", "--inverse-surface", "--inverse-surface-strong",
	"--inverse-border", "--inverse-decoration",
] as const satisfies readonly ThemeVariableName[]

/* Kept apart from THEME_COLORS, which is consumed by index-based slices below. */
const SURFACE_COLORS = ["--overlay-backdrop"] as const satisfies readonly ThemeVariableName[]

const FONT_VARIABLES = [
	"--font-heading", "--font-sans", "--font-serif", "--font-mono",
] as const satisfies readonly ThemeVariableName[]

/* The ramp in styles/tokens/foundation.css, which stops at 2xl. */
const TEXT_STEPS = ["xs", "pxs", "sm", "base", "lg", "xl", "2xl"] as const

/* Each step's size and line height are edited together. */
const TYPOGRAPHY_VARIABLES = TEXT_STEPS.flatMap((step) => [
	`--text-${step}` as ThemeVariableName,
	`--text-${step}--line-height` as ThemeVariableName,
])

/* --shadow-2xs, --shadow and --shadow-2xl are shadcn compatibility names nothing reads, so they are not offered. */
const SHADOW_VARIABLES = [
	"--shadow-xs", "--shadow-sm", "--shadow-md", "--shadow-lg", "--shadow-xl",
] as const satisfies readonly ThemeVariableName[]

const STRUCTURAL_VARIABLES = [
	"--density-scale",
	"--height-control", "--control-x",
	"--row-x", "--row-y", "--surface-x", "--surface-y",
	"--icon", "--avatar",
	"--shell-header-height", "--sidebar-width",
] as const satisfies readonly ThemeVariableName[]

const LAYOUT_VARIABLES = [
	"--content-width-sm", "--content-width-md", "--content-width-lg",
	"--content-width-xl", "--content-width-2xl",
	"--adaptive-grid-min-sm", "--adaptive-grid-min-md", "--adaptive-grid-min-lg",
] as const satisfies readonly ThemeVariableName[]

const DESCRIPTIONS: Partial<Record<ThemeVariableName, string>> = {
	"--background": "The page's canvas.",
	"--foreground": "Text and icons on the canvas.",
	"--primary": "Brand and primary-action colour.",
	"--primary-foreground": "Text and icons on a solid primary fill.",
	"--muted": "Subdued backgrounds — passive regions, skeletons.",
	"--muted-foreground": "Secondary text, metadata, and passive icons.",
	"--border": "Dividers, outlines, and surface borders.",
	"--ring": "The focus-visible ring.",
	"--link-color": "Inline links and copyable values.",
	"--overlay-backdrop": "The scrim behind dialogs, sheets, and drawers.",
	"--primary-accent": "Brand colour as a FOREGROUND — icons, spinners, active marks.",
	"--warning-accent": "Warning colour as a foreground on a tinted warning surface.",
	"--radius": "The container corner — cards, dialogs, popovers, menus.",
	"--radius-sm": "The inner corner — inputs, buttons, rows, chips, badges, tooltips.",
	"--density-scale": "Multiplies spacing, controls, rows and everything density-sensitive; type follows --text-scale.",
	"--height-control": "Base height for every control — buttons, inputs, selects, triggers.",
	"--control-x": "Inline inset for actions and form controls.",
	"--row-x": "Inline inset shared by collection, menu, command, and table rows.",
	"--row-y": "Vertical inset shared by those same rows.",
	"--surface-x": "Inline inset for cards, dialogs, panels, and content surfaces.",
	"--surface-y": "Vertical inset for those same surfaces.",
	"--icon": "Default interface icon size.",
	"--avatar": "Default avatar size in ordinary rows and cards.",
	"--shell-header-height": "Minimum application-header height.",
	"--sidebar-width": "Expanded sidebar width, for Sidebar and every shell.",
	"--content-width-lg": "The default readable measure used by Container.",
	"--adaptive-grid-min-md": "Default minimum column width used by AdaptiveGrid.",
}

const LABELS: Partial<Record<ThemeVariableName, string>> = {
	"--density-scale": "Density scale",
	"--height-control": "Control height",
	"--control-x": "Control horizontal padding",
	"--row-x": "Row horizontal padding",
	"--row-y": "Row vertical padding",
	"--surface-x": "Surface horizontal padding",
	"--surface-y": "Surface vertical padding",
	"--icon": "Interface icon size",
	"--avatar": "Default avatar size",
	"--shell-header-height": "Header height",
	"--sidebar-width": "Sidebar width",
	"--content-width-sm": "Small content width",
	"--content-width-md": "Medium content width",
	"--content-width-lg": "Large content width",
	"--content-width-xl": "Extra-large content width",
	"--content-width-2xl": "Maximum content width",
	"--adaptive-grid-min-sm": "Compact adaptive column",
	"--adaptive-grid-min-md": "Default adaptive column",
	"--adaptive-grid-min-lg": "Spacious adaptive column",
}

/* Ranges within which the kit still looks like itself; other values go in the raw text box. */
const RANGE_CONTROLS: Partial<Record<ThemeVariableName, ThemeTweakerRangeControl>> = {
	"--radius": { type: "range", min: 0, max: 1.5, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--radius-sm": { type: "range", min: 0, max: 1, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--density-scale": { type: "range", min: 0.75, max: 1.35, step: 0.025, decimalPlaces: 3, fallback: 1 },
	"--height-control": { type: "range", min: 1.5, max: 3.5, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--control-x": { type: "range", min: 0.25, max: 1.5, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--row-x": { type: "range", min: 0.25, max: 1.5, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--row-y": { type: "range", min: 0.25, max: 1.25, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--surface-x": { type: "range", min: 0.5, max: 2.5, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--surface-y": { type: "range", min: 0.5, max: 2.5, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--icon": { type: "range", min: 0.75, max: 2, step: 0.0625, unit: "rem", decimalPlaces: 4 },
	"--avatar": { type: "range", min: 1.5, max: 4, step: 0.125, unit: "rem", decimalPlaces: 3 },
	"--shell-header-height": { type: "range", min: 3, max: 7, step: 0.125, unit: "rem", decimalPlaces: 3 },
	"--sidebar-width": { type: "range", min: 12, max: 24, step: 0.25, unit: "rem", decimalPlaces: 2 },
	"--content-width-sm": { type: "range", min: 20, max: 72, step: 1, unit: "rem", decimalPlaces: 0 },
	"--content-width-md": { type: "range", min: 24, max: 80, step: 1, unit: "rem", decimalPlaces: 0 },
	"--content-width-lg": { type: "range", min: 32, max: 96, step: 1, unit: "rem", decimalPlaces: 0 },
	"--content-width-xl": { type: "range", min: 40, max: 108, step: 1, unit: "rem", decimalPlaces: 0 },
	"--content-width-2xl": { type: "range", min: 48, max: 120, step: 1, unit: "rem", decimalPlaces: 0 },
	"--adaptive-grid-min-sm": { type: "range", min: 8, max: 24, step: 0.5, unit: "rem", decimalPlaces: 1 },
	"--adaptive-grid-min-md": { type: "range", min: 8, max: 32, step: 0.5, unit: "rem", decimalPlaces: 1 },
	"--adaptive-grid-min-lg": { type: "range", min: 12, max: 40, step: 0.5, unit: "rem", decimalPlaces: 1 },
}

/** `--sidebar-primary-foreground` → "Sidebar Primary Foreground". */
function labelFromName(name: ThemeVariableName): string {
	return name
		.replace(/^--/, "")
		.replace(/--/g, " · ")
		.split("-")
		.map((part) =>
			// Three letters or fewer is an abbreviation (XS, 2XL, PXS).
			part.length <= 3 ? part.toUpperCase() : `${part[0]?.toUpperCase()}${part.slice(1)}`,
		)
		.join(" ")
}

function genericDescription(name: ThemeVariableName, group: ThemeTweakerGroup): string {
	if (name.startsWith("--chart-")) return "A categorical series colour. Keep status meaning out of it."
	if (name.startsWith("--sidebar-")) return "A sidebar-specific colour."
	if (name.startsWith("--inverse-")) return "An explicitly inverse surface or content colour."
	if (name.endsWith("-foreground")) return "The foreground paired with the matching fill."
	if (name.endsWith("--line-height")) return "Line height for the matching type step."
	if (name.startsWith("--text-")) return "Font size for the matching type step."
	if (name.startsWith("--font-")) return "Font stack for the matching content role."
	if (name.startsWith("--shadow")) return "An elevation step used by surfaces and overlays."
	if (group === "states") return "A semantic state colour shared by every status surface."
	return "A public theme variable used across the kit."
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
		label: LABELS[name] ?? labelFromName(name),
		description: DESCRIPTIONS[name] ?? genericDescription(name, group),
		group,
		section,
		scope,
		kind,
		control: RANGE_CONTROLS[name],
	}))
}

export const defaultThemeTweakerFields: readonly ThemeTweakerField[] = [
	...fields(THEME_COLORS.slice(0, 6), "colors", "surfaces-content", "mode", "color"),
	...fields(SURFACE_COLORS, "colors", "surfaces-content", "shared", "color"),
	...fields(THEME_COLORS.slice(6, 19), "colors", "brand-actions", "mode", "color"),
	...fields(THEME_COLORS.slice(19, 24), "colors", "charts", "mode", "color"),
	...fields(THEME_COLORS.slice(24), "colors", "sidebar", "mode", "color"),
	...fields(STATE_COLORS.slice(0, 9), "states", "semantic-feedback", "mode", "color"),
	...fields(STATE_COLORS.slice(9), "states", "inverse-surfaces", "mode", "color"),
	...fields(FONT_VARIABLES, "typography", "font-families", "shared", "font"),
	...fields(TYPOGRAPHY_VARIABLES, "typography", "type-scale", "shared", "length"),
	...fields(["--radius", "--radius-sm"], "shape", "radius", "shared", "length"),
	/* Elevation is mode-scoped: a shadow tuned for white smudges on near-black. */
	...fields(SHADOW_VARIABLES, "shape", "elevation", "mode", "shadow"),
	...fields(STRUCTURAL_VARIABLES.slice(0, 2), "structure", "global-scales", "shared", "number"),
	...fields(STRUCTURAL_VARIABLES.slice(2, 5), "structure", "actions-controls", "shared", "length"),
	...fields(STRUCTURAL_VARIABLES.slice(5, 9), "structure", "rows-surfaces", "shared", "length"),
	...fields(STRUCTURAL_VARIABLES.slice(9, 11), "structure", "media", "shared", "length"),
	...fields(STRUCTURAL_VARIABLES.slice(11), "structure", "application-shell", "shared", "length"),
	...fields(LAYOUT_VARIABLES.slice(0, 5), "structure", "content-widths", "shared", "length"),
	...fields(LAYOUT_VARIABLES.slice(5), "structure", "adaptive-layout", "shared", "length"),
]
