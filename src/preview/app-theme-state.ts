import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"

import { type UIConfig } from "@/lib/ui-provider"
import { createTheme, useAppliedTheme, type ThemeDefinition } from "@/components/features/theme-tweaker"

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
