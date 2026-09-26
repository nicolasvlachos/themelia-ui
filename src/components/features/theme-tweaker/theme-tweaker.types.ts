/**
 * ThemeTweaker: live editing of the kit's CSS variables.
 *
 * A theme has three buckets (`shared`, `light`, `dark`); each field's `scope` in the
 * catalog decides where it lands. Values are raw CSS strings, so derived values such as
 * `color-mix(in oklch, var(--primary) 10%, var(--background))` keep following their inputs.
 */
import type { CSSProperties, HTMLAttributes, ReactNode } from "react"

import type { UIConfig } from "@/lib/ui-provider"

import type { ThemeTweakerStrings } from "./theme-tweaker.strings"

/* Declared in `lib/theming`: they describe the token contract, not this panel. */
export type { ThemeMode, ThemeOverrides, ThemeVariableName } from "@/lib/theming"
import type { ThemeMode, ThemeOverrides, ThemeVariableName } from "@/lib/theming"

/** Serializable, and the only state ThemeScope and ThemeTweaker share. */
export interface ThemeDefinition {
	/** Which bucket the mode-scoped edits go to, and which the preview shows. */
	mode: ThemeMode
	/** Typography, density, structure, radius: everything both themes share. */
	shared: ThemeOverrides
	light: ThemeOverrides
	dark: ThemeOverrides
}

export type ThemeTweakerGroup =
	| "colors" | "states" | "typography" | "shape" | "structure" | "defaults"

export type ThemeTweakerSection =
	| "surfaces-content" | "brand-actions" | "charts" | "sidebar" | "semantic-feedback"
	| "inverse-surfaces" | "font-families" | "type-scale" | "radius" | "elevation"
	| "global-scales" | "actions-controls" | "rows-surfaces" | "media"
	| "application-shell" | "content-widths" | "adaptive-layout"

export type ThemeTweakerFieldScope = "shared" | "mode"
export type ThemeTweakerFieldKind = "color" | "font" | "length" | "number" | "shadow"

/** A slider and a numeric box, for a variable with real bounds. */
export interface ThemeTweakerRangeControl {
	type: "range"
	min: number
	max: number
	step: number
	/** Appended to committed values. Omit for a unitless token. */
	unit?: string
	decimalPlaces?: number
	/** Shown while the variable is unset — a factor that falls back to another reads as empty. */
	fallback?: number
}

/** One editable public variable. */
export interface ThemeTweakerField {
	name: ThemeVariableName
	label: string
	description?: string
	group: ThemeTweakerGroup
	section: ThemeTweakerSection
	scope: ThemeTweakerFieldScope
	kind: ThemeTweakerFieldKind
	placeholder?: string
	/** Without one the field is a raw CSS text box, which every variable falls back to. */
	control?: ThemeTweakerRangeControl
}

export interface ThemeSelectors {
	/** Receives the mode-independent variables. */
	shared: string
	/** Explicit light: a `.light` or `data-theme="light"` element and the boundaries inside it. */
	light: string
	/** Explicit dark: a `.dark` or `data-theme="dark"` element and the boundaries inside it. */
	dark: string
	/** Light by OS preference (no explicit theme), emitted under `prefers-color-scheme: light`. */
	systemLight?: string
	/** Dark by OS preference (no explicit theme), emitted under `prefers-color-scheme: dark`. */
	systemDark?: string
}

export interface SerializeThemeOptions {
	selectors?: ThemeSelectors
	/** Header comment. `false` omits it. */
	banner?: string | false
}

export interface ThemeExportArtifact {
	fileName: string
	/** Every public variable, resolved: a standalone theme. */
	cssText: string
	/** Only what was explicitly changed. */
	overrideCssText: string
	theme: ThemeDefinition
	resolvedTheme: ThemeDefinition
	overrideCount: number
	providerFileName: string
	providerConfig: UIConfig
	/** TypeScript source exporting `uiConfig`. */
	providerConfigText: string
}

export interface CreateThemeExportArtifactOptions {
	resolvedTheme?: ThemeDefinition
	providerConfig?: UIConfig
	providerFileName?: string
}

/** Where the live variables land. */
export type ThemeTweakerTarget =
	| "self" | "document" | HTMLElement | (() => HTMLElement | null) | null

export interface ThemeScopeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	theme: ThemeDefinition
	/** Overrides the stored mode without changing the definition. */
	mode?: ThemeMode
	children: ReactNode
}

export interface ThemeTweakerProps
	extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"children" | "defaultValue" | "onChange" | "onCopy" | "onReset"
	> {
	value?: ThemeDefinition
	defaultValue?: Partial<ThemeDefinition>
	onValueChange?: (theme: ThemeDefinition) => void
	onModeChange?: (mode: ThemeMode) => void
	/** The catalog of editable variables. Defaults to the kit's whole public surface. */
	fields?: readonly ThemeTweakerField[]
	/**
	 * `self` themes only the editor and its preview; `document` themes the whole app while
	 * mounted, so portaled menus and dialogs inherit the edit too.
	 */
	target?: ThemeTweakerTarget
	apply?: boolean
	/** Manages `.light` / `.dark` on a non-self target. Off when a theme manager owns it. */
	manageModeClass?: boolean
	/** `false` hides it; a node replaces the built-in one. */
	preview?: ReactNode | false
	fileName?: string
	config?: UIConfig
	defaultConfig?: UIConfig
	onConfigChange?: (config: UIConfig) => void
	providerFileName?: string
	/** Off when an owning drawer supplies the title. */
	showIntro?: boolean
	selectors?: ThemeSelectors
	/** Replaces the browser download with the consumer's own persistence. */
	onExport?: (artifact: ThemeExportArtifact) => void | Promise<void>
	onCopy?: (cssText: string) => void | Promise<void>
	onReset?: (previous: ThemeDefinition) => void
	/** Receives clipboard, export, and serialization failures. */
	onError?: (error: unknown) => void
	actionsSlot?: ReactNode
	strings?: Partial<ThemeTweakerStrings>
}

/** An inline style that may carry custom properties. */
export type ThemeStyle = CSSProperties & Partial<Record<ThemeVariableName, string>>
