/**
 * Turning an edited theme into text, and back into a style.
 *
 * Values become CSS, so names must look like custom properties and values may contain no
 * `;`, `}` or control characters (CSS injection). Serialising throws on a bad entry, so an
 * export never silently drops one; the live preview skips it, since half-typed values are normal.
 */
import { DEFAULT_UI_CONFIG, mergeUIConfig, type UIConfig } from "@/lib/ui-provider"

import type {
	CreateThemeExportArtifactOptions, SerializeThemeOptions, ThemeDefinition,
	ThemeExportArtifact, ThemeMode, ThemeOverrides, ThemeSelectors, ThemeStyle,
	ThemeVariableName,
} from "./theme-tweaker.types"

/*
 * The kit's own theme selectors (scripts/gen-theme.mjs): semantic and type tokens are
 * re-derived at every scope boundary, so a value set on `:root` alone stops at the first
 * provider. Each mode excludes the other, so a light-only edit never reaches a dark scope.
 */
const BOUNDARY = ":is(:root, [data-ui-scope], [data-density], [data-theme])"
export const defaultThemeSelectors: ThemeSelectors = {
	shared: ":root,\n[data-ui-scope],\n[data-density],\n[data-theme],\n.light,\n.dark",
	light: [
		".light",
		'[data-theme="light"]',
		':is(.light, [data-theme="light"]) :is([data-ui-scope], [data-density]):not(.dark, [data-theme="dark"])',
	].join(",\n"),
	dark: [
		".dark",
		'[data-theme="dark"]',
		':is(.dark, [data-theme="dark"]) :is([data-ui-scope], [data-density]):not(.light, [data-theme="light"])',
	].join(",\n"),
	systemLight: `${BOUNDARY}:not(.dark, [data-theme="dark"], :is(.dark, [data-theme="dark"]) *)`,
	systemDark: `${BOUNDARY}:not(.light, [data-theme="light"], :is(.light, [data-theme="light"]) *)`,
}

const VARIABLE_NAME_PATTERN = /^--[a-z][a-z0-9-]*$/i
const UNSAFE_CSS = /[;{}]/

export function createTheme(value: Partial<ThemeDefinition> = {}): ThemeDefinition {
	return {
		mode: value.mode ?? "light",
		shared: { ...(value.shared ?? {}) },
		light: { ...(value.light ?? {}) },
		dark: { ...(value.dark ?? {}) },
	}
}

export function isThemeVariableName(value: string): value is ThemeVariableName {
	return VARIABLE_NAME_PATTERN.test(value)
}

function validatedEntries(
	overrides: ThemeOverrides,
	strict = true,
): [ThemeVariableName, string][] {
	return Object.entries(overrides)
		.filter(
			(entry): entry is [string, string] =>
				typeof entry[1] === "string" && entry[1].trim().length > 0,
		)
		.flatMap(([name, raw]) => {
			if (!isThemeVariableName(name)) {
				if (!strict) return []
				throw new TypeError(`Invalid CSS variable name: ${name}`)
			}

			const value = raw.trim()
			const hasControlCharacter = [...value].some((character) => {
				const code = character.charCodeAt(0)
				return code < 32 || code === 127
			})

			if (UNSAFE_CSS.test(value) || hasControlCharacter) {
				if (!strict) return []
				throw new TypeError(`Unsafe CSS value for ${name}.`)
			}

			return [[name, value] as [ThemeVariableName, string]]
		})
		// Sorted, so a theme always serialises byte-identically and exports diff cleanly.
		.sort(([left], [right]) => left.localeCompare(right))
}

function validateSelector(selector: string, scope: keyof ThemeSelectors): string {
	const value = selector.trim()
	if (value.length === 0 || UNSAFE_CSS.test(value)) {
		throw new TypeError(`Invalid ${scope} theme selector.`)
	}
	return value
}

function serializeBlock(selector: string, overrides: ThemeOverrides, media?: string): string | null {
	const entries = validatedEntries(overrides)
	if (entries.length === 0) return null
	const block = [selector + " {", ...entries.map(([name, value]) => `\t${name}: ${value};`), "}"]
	if (!media) return block.join("\n")
	return [`@media ${media} {`, ...block.map((line) => `\t${line}`), "}"].join("\n")
}

export function serializeTheme(
	theme: ThemeDefinition,
	options: SerializeThemeOptions = {},
): string {
	const selectors = options.selectors ?? defaultThemeSelectors
	const blocks = [
		serializeBlock(validateSelector(selectors.shared, "shared"), theme.shared),
		/* OS preference first, so an explicit theme below wins at equal specificity. */
		selectors.systemLight
			? serializeBlock(validateSelector(selectors.systemLight, "systemLight"), theme.light, "(prefers-color-scheme: light)")
			: null,
		selectors.systemDark
			? serializeBlock(validateSelector(selectors.systemDark, "systemDark"), theme.dark, "(prefers-color-scheme: dark)")
			: null,
		serializeBlock(validateSelector(selectors.light, "light"), theme.light),
		serializeBlock(validateSelector(selectors.dark, "dark"), theme.dark),
	].filter((block): block is string => block !== null)

	const banner =
		options.banner === false ? null : `/* ${options.banner ?? "Themelia UI theme overrides"} */`

	return `${[
		...(banner ? [banner] : []),
		...(blocks.length > 0 ? blocks : ["/* No explicit overrides. */"]),
	].join("\n\n")}\n`
}

/**
 * The provider config minus what cannot survive `JSON.stringify`: `dates.locale` (a
 * date-fns module) and `dates.formatRelativeTime` (a function) are dropped.
 */
export function createSerializableUIConfig(config: UIConfig = {}): UIConfig {
	// Merged onto the kit defaults, so the export is a complete config.
	const resolved = mergeUIConfig(DEFAULT_UI_CONFIG, config)
	const { locale: _locale, formatRelativeTime: _format, ...dates } = resolved.dates
	return { ...resolved, dates }
}

export function serializeUIConfig(config: UIConfig = {}): string {
	const serializable = createSerializableUIConfig(config)
	return `import type { UIConfig } from "themelia-ui/ui-provider"\n\nexport const uiConfig = ${JSON.stringify(
		serializable,
		null,
		"\t",
	)} satisfies UIConfig\n`
}

/** Shared first, then the mode's, so a mode-scoped edit wins. */
export function getActiveThemeOverrides(
	theme: ThemeDefinition,
	mode: ThemeMode = theme.mode,
): ThemeOverrides {
	return { ...theme.shared, ...theme[mode] }
}

export function themeToStyle(theme: ThemeDefinition, mode: ThemeMode = theme.mode): ThemeStyle {
	// Non-strict: runs on every keystroke, so a half-typed value is skipped rather than thrown.
	return Object.fromEntries(validatedEntries(getActiveThemeOverrides(theme, mode), false)) as ThemeStyle
}

export function countThemeOverrides(theme: ThemeDefinition): number {
	return (
		validatedEntries(theme.shared, false).length +
		validatedEntries(theme.light, false).length +
		validatedEntries(theme.dark, false).length
	)
}

/**
 * Selectors that scope a theme to one subtree. Each mode gets two forms (the scope carrying
 * the class, and the scope inside an element that carries it).
 */
export function createScopedThemeSelectors(scopeSelector: string): ThemeSelectors {
	const scope = validateSelector(scopeSelector, "shared")
	return {
		shared: scope,
		light: `${scope},\n${scope}.light,\n.light ${scope}`,
		dark: `${scope}.dark,\n.dark ${scope}`,
	}
}

export function createThemeExportArtifact(
	theme: ThemeDefinition,
	fileName = "theme.css",
	options: SerializeThemeOptions = {},
	artifactOptions: CreateThemeExportArtifactOptions = {},
): ThemeExportArtifact {
	const resolvedTheme = createTheme(artifactOptions.resolvedTheme ?? theme)
	const providerConfig = createSerializableUIConfig(artifactOptions.providerConfig)

	return {
		fileName,
		cssText: serializeTheme(resolvedTheme, {
			...options,
			banner: options.banner ?? "Themelia UI complete theme",
		}),
		overrideCssText: serializeTheme(theme, options),
		theme: createTheme(theme),
		resolvedTheme,
		overrideCount: countThemeOverrides(theme),
		providerFileName: artifactOptions.providerFileName ?? "ui.config.ts",
		providerConfig,
		providerConfigText: serializeUIConfig(providerConfig),
	}
}

export function downloadTextFile({
	fileName,
	text,
	mimeType = "text/plain;charset=utf-8",
}: {
	fileName: string
	text: string
	mimeType?: string
}): void {
	if (typeof document === "undefined" || typeof URL === "undefined") {
		throw new Error(
			"Downloading needs a browser document. Pass onExport for other environments.",
		)
	}

	const url = URL.createObjectURL(new Blob([text], { type: mimeType }))
	const anchor = document.createElement("a")
	anchor.href = url
	anchor.download = fileName
	anchor.hidden = true
	document.body.append(anchor)
	anchor.click()
	anchor.remove()
	URL.revokeObjectURL(url)
}

export function downloadTheme(
	artifact: Pick<ThemeExportArtifact, "cssText" | "fileName">,
): void {
	downloadTextFile({
		fileName: artifact.fileName,
		text: artifact.cssText,
		mimeType: "text/css;charset=utf-8",
	})
}
