/**
 * Turning an edited theme into text, and back into a style.
 *
 * Values become CSS, so names must look like custom properties and values may contain no
 * `;`, `}` or control characters (CSS injection). Serialising throws on a bad entry, so an
 * export never silently drops one; the live preview skips it, since half-typed values are normal.
 */
import { DEFAULT_UI_CONFIG, mergeUIConfig, type UIConfig } from "@/lib/ui-provider"
import { THEME_DEFAULTS } from "@/lib/ui-provider/tokens.generated"

import type {
	CreateThemeExportArtifactOptions, SerializeThemeOptions, ThemeDefinition,
	ThemeExportArtifact, ThemeMode, ThemeOverrides, ThemeSelectors, ThemeStyle,
	ThemeVariableName,
} from "./theme-tweaker.types"

/* The whole application: every colour carries both modes, so one selector is enough. */
export const defaultThemeSelectors: ThemeSelectors = { shared: ":root" }

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

/**
 * The two halves of a `light-dark(light, dark)` value, split at its top-level comma so a
 * `color-mix(…)` half stays whole; `null` for any other value.
 */
export function splitLightDark(value: string): [string, string] | null {
	const text = value.trim()
	if (!text.startsWith("light-dark(") || !text.endsWith(")")) return null
	const inner = text.slice("light-dark(".length, -1)
	let depth = 0
	for (let index = 0; index < inner.length; index++) {
		const character = inner[index]
		if (character === "(") depth++
		else if (character === ")") depth--
		else if (character === "," && depth === 0) {
			return [inner.slice(0, index).trim(), inner.slice(index + 1).trim()]
		}
	}
	return null
}

/** The kit's own value for one mode, when the theme declares the variable as a pair. */
function defaultHalf(name: ThemeVariableName, mode: ThemeMode): string | undefined {
	const declared = (THEME_DEFAULTS as Record<string, string | undefined>)[name]
	const halves = declared ? splitLightDark(declared) : null
	return halves ? halves[mode === "light" ? 0 : 1] : undefined
}

/**
 * The mode-scoped edits as declarations: each colour one `light-dark()` pair, the half left
 * unedited taken from the kit's theme, so a light-only edit leaves dark as the kit draws it.
 */
function pairedOverrides(theme: ThemeDefinition): ThemeOverrides {
	const names = new Set([...Object.keys(theme.light), ...Object.keys(theme.dark)] as ThemeVariableName[])
	const paired: ThemeOverrides = {}
	for (const name of names) {
		const lightEdit = theme.light[name]?.trim() || undefined
		const darkEdit = theme.dark[name]?.trim() || undefined
		const light = lightEdit ?? defaultHalf(name, "light") ?? darkEdit
		const dark = darkEdit ?? defaultHalf(name, "dark") ?? lightEdit
		if (!light || !dark) continue
		paired[name] = light === dark ? light : `light-dark(${light}, ${dark})`
	}
	return paired
}

/** Every declaration the theme makes: its shared values and its colour pairs. */
function themeDeclarations(theme: ThemeDefinition): ThemeOverrides {
	return { ...theme.shared, ...pairedOverrides(theme) }
}

export function serializeTheme(
	theme: ThemeDefinition,
	options: SerializeThemeOptions = {},
): string {
	const selector = validateSelector((options.selectors ?? defaultThemeSelectors).shared, "shared")
	const entries = validatedEntries(themeDeclarations(theme))
	const banner =
		options.banner === false ? null : `/* ${options.banner ?? "Themelia UI theme overrides"} */`
	const block = entries.length
		? [`${selector} {`, ...entries.map(([name, value]) => `\t${name}: ${value};`), "}"].join("\n")
		: "/* No explicit overrides. */"

	return `${[...(banner ? [banner] : []), block].join("\n\n")}\n`
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

/**
 * The values the theme gives in one mode: shared first, then that mode's colour halves. For
 * showing a value; the element's `color-scheme` is what picks the half on the page.
 */
export function getActiveThemeOverrides(
	theme: ThemeDefinition,
	mode: ThemeMode = theme.mode,
): ThemeOverrides {
	return { ...theme.shared, ...theme[mode] }
}

/**
 * The theme as an inline style: shared values and each colour's `light-dark()` pair. The
 * element's `color-scheme` (set by `.light`, `.dark` or `data-theme`) picks the half.
 */
export function themeToStyle(theme: ThemeDefinition): ThemeStyle {
	// Non-strict: runs on every keystroke, so a half-typed value is skipped rather than thrown.
	return Object.fromEntries(validatedEntries(themeDeclarations(theme), false)) as ThemeStyle
}

/** How many variables the theme changes; a colour edited in both modes counts once. */
export function countThemeOverrides(theme: ThemeDefinition): number {
	return validatedEntries(themeDeclarations(theme), false).length
}

/** The selector that scopes a theme to one subtree instead of the document. */
export function createScopedThemeSelectors(scopeSelector: string): ThemeSelectors {
	return { shared: validateSelector(scopeSelector, "shared") }
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
