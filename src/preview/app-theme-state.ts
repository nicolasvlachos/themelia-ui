import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"

import { type UIConfig } from "@/lib/ui-provider"
import { createTheme, useAppliedTheme, type ThemeDefinition } from "@/components/features/theme-tweaker"

const STORAGE_KEY = "themelia-ui:app-theme:v1"
const STORAGE_VERSION = 4
const DEFAULT_CONFIG: UIConfig = { colorScheme: "system", density: "default" }

/* A saved name that 2.0 renamed carries its value over, so a stored theme keeps its look. */
const RENAMED: Record<string, string> = { "--height-action": "--height-control", "--space-scale": "--density-scale" }

function migrateTheme(theme: ThemeDefinition, version: number): ThemeDefinition {
	if (version >= STORAGE_VERSION) return theme
	const shared: Record<string, string | undefined> = { ...theme.shared }
	/* Versions 1–2 saved one radius; the inner one is its own value now (half, as in the defaults). */
	const radius = shared["--radius"]
	if (version < 3 && radius !== undefined && shared["--radius-sm"] === undefined) {
		if (radius === "1rem" || radius === "0.875rem") delete shared["--radius"]
		else shared["--radius-sm"] = radius === "0rem" ? "0rem" : `calc(${radius} / 2)`
	}
	for (const [from, to] of Object.entries(RENAMED)) {
		if (shared[from] === undefined) continue
		shared[to] ??= shared[from]
		delete shared[from]
	}
	return { ...theme, shared: shared as ThemeDefinition["shared"] }
}

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
		if ([1, 2, 3, STORAGE_VERSION].includes(saved?.version) && saved.theme && saved.config && validConfig(saved.config)) {
			return { theme: createTheme(migrateTheme(saved.theme, saved.version)), config: saved.config }
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
	function reset() {
		setOverrides(createTheme())
		setConfig(DEFAULT_CONFIG)
		setAppliedConfig(DEFAULT_CONFIG)
	}

	return { theme, config, appliedConfig, updateConfig, updateTheme, reset, open, setOpen,
		configError: validConfig(config) ? null : "Enter a valid locale and currency. The app keeps the last valid settings." }
}

export const AppThemeContext = createContext<ReturnType<typeof useAppThemeState> | null>(null)

export function useAppTheme() {
	const state = useContext(AppThemeContext)
	if (!state) throw new Error("App theme controls require AppThemeProvider")
	return state
}
