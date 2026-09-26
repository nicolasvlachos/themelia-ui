import type { ReactNode } from "react"
import { UIProvider } from "@/lib/ui-provider"
import { themeToStyle } from "@/components/features/theme-tweaker"
import { AppThemeContext, useAppThemeState } from "./app-theme-state"

export function AppThemeProvider({ children }: { children: ReactNode }) {
	const state = useAppThemeState()
	return (
		<AppThemeContext.Provider value={state}>
			<UIProvider config={state.appliedConfig} style={themeToStyle(state.theme)} transparent={false}>
				{children}
			</UIProvider>
		</AppThemeContext.Provider>
	)
}
