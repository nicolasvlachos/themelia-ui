import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"

import { themes, type ThemeName } from "@/lib/theming"
import { type UIConfig } from "@/lib/ui-provider"
import {
	createTheme, themeFromConfig, useAppliedTheme, type ThemeDefinition,
} from "@/components/features/theme-tweaker"

/** A ready-made theme, the kit's own (`default`), or anything edited since (`custom`). */
export type AppThemePreset = "default" | ThemeName | "custom"

/** The config a theme owns. The scheme, locale and currency stay the reader's own. */
const THEME_KEYS = ["density", "scale", "typography", "motion", "overlay", "defaults"] as const

const PRESET_THEMES = Object.fromEntries(
	Object.entries(themes).map(([name, preset]) => [name, themeFromConfig(preset.config.theme ?? {})]),
) as Record<ThemeName, ThemeDefinition>

/** The theme's declarations, order-free, so two definitions compare by what they set. */
function fingerprint(theme: ThemeDefinition) {
	return JSON.stringify((["shared", "light", "dark"] as const).map((bucket) =>
		Object.entries(theme[bucket]).filter(([, value]) => value?.trim()).sort(([a], [b]) => a.localeCompare(b))))
}

/** What a config sets of the theme's keys, with the density's default spelled out. */
function themePart(config: UIConfig) {
	return JSON.stringify(THEME_KEYS.map((key) => (key === "density" ? config.density ?? "default" : config[key] ?? null)))
}

function withoutThemeKeys(config: UIConfig): UIConfig {
	return Object.fromEntries(Object.entries(config).filter(([key]) => !(THEME_KEYS as readonly string[]).includes(key)))
}

const DEFAULT_FINGERPRINT = fingerprint(createTheme())
const DEFAULT_THEME_PART = themePart({})

function presetOf(theme: ThemeDefinition, config: UIConfig): AppThemePreset {
	const print = fingerprint(theme)
	const part = themePart(config)
	if (print === DEFAULT_FINGERPRINT && part === DEFAULT_THEME_PART) return "default"
	const match = (Object.keys(themes) as ThemeName[]).find(
		(name) => fingerprint(PRESET_THEMES[name]) === print && themePart(themes[name].config) === part,
	)
	return match ?? "custom"
}

const STORAGE_KEY = "themelia-ui:app-theme:v1"
const STORAGE_VERSION = 5
const DEFAULT_CONFIG: UIConfig = { colorScheme: "system", density: "default" }

function validConfig(config: UIConfig) {
	try {
		Intl.getCanonicalLocales(config.formatting?.locale)
		new Intl.NumberFormat(config.formatting?.locale, {
			style: "currency", currency: config.money?.defaultCurrency ?? "EUR",
		})
		return true
	} catch { return false }
}

function readSettings(): { theme: ThemeDefinition; config: UIConfig } {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
		if (typeof saved?.version === "number" && saved.version <= STORAGE_VERSION && saved.config && validConfig(saved.config)) {
			/* An older format's theme names variables the theme no longer declares; its config still applies. */
			const theme = saved.version === STORAGE_VERSION && saved.theme ? createTheme(saved.theme) : createTheme()
			return { theme, config: saved.config }
		}
	} catch { /* Storage is optional; a fresh session always works. */ }
	return { theme: createTheme(), config: DEFAULT_CONFIG }
}

export function useAppThemeState() {
	const [initial] = useState(readSettings)
	const [overrides, setOverrides] = useState(initial.theme)
	const [config, setConfig] = useState<UIConfig>(initial.config)
	const [appliedConfig, setAppliedConfig] = useState<UIConfig>(initial.config)
	const [systemDark, setSystemDark] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches)
	const [open, setOpen] = useState(false)
	const selfRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const media = matchMedia("(prefers-color-scheme: dark)")
		const update = () => setSystemDark(media.matches)
		media.addEventListener("change", update)
		return () => media.removeEventListener("change", update)
	}, [])

	const scheme = appliedConfig.colorScheme ?? "system"
	const mode = scheme === "system" ? (systemDark ? "dark" : "light") : scheme
	const theme = useMemo(() => ({ ...overrides, mode }), [overrides, mode])

	// This owner remains mounted when the editor closes or a route changes.
	useAppliedTheme({ theme, target: "document", selfRef, apply: true, manageModeClass: false })

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, theme: overrides, config: appliedConfig }))
		} catch { /* The live edit still works if browser storage is unavailable. */ }
	}, [overrides, appliedConfig])

	function updateConfig(next: UIConfig) {
		setConfig(next)
		if (validConfig(next)) setAppliedConfig(next)
	}
	function updateTheme(next: ThemeDefinition) {
		setOverrides(next)
		if (next.mode !== mode) updateConfig({ ...config, colorScheme: next.mode })
	}
	/**
	 * Applies a ready-made theme, or the kit's own: its colours and variables into the editor,
	 * its density, type, motion and component defaults into the site's config.
	 */
	function applyPreset(name: Exclude<AppThemePreset, "custom">) {
		const preset = name === "default" ? undefined : themes[name]
		setOverrides(preset ? createTheme(PRESET_THEMES[name as ThemeName]) : createTheme())
		const owned = Object.fromEntries(
			THEME_KEYS.flatMap((key) => (preset?.config[key] === undefined ? [] : [[key, preset.config[key]]])),
		) as UIConfig
		updateConfig({ ...withoutThemeKeys(appliedConfig), density: "default", ...owned })
	}
	function reset() {
		setOverrides(createTheme())
		setConfig(DEFAULT_CONFIG)
		setAppliedConfig(DEFAULT_CONFIG)
	}

	return { theme, config, appliedConfig, updateConfig, updateTheme, reset, open, setOpen,
		preset: presetOf(overrides, appliedConfig), applyPreset,
		configError: validConfig(config) ? null : "Enter a valid locale and currency. The app keeps the last valid settings." }
}

export const AppThemeContext = createContext<ReturnType<typeof useAppThemeState> | null>(null)

export function useAppTheme() {
	const state = useContext(AppThemeContext)
	if (!state) throw new Error("App theme controls require AppThemeProvider")
	return state
}
