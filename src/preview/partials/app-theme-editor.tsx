import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { Button } from "@/components/base/buttons"
import { ThemeTweaker } from "@/components/features/theme-tweaker"
import { useState } from "react"

import { useAppTheme } from "../app-theme-state"

/** One editor for both the app inspector and its full-page workspace. */
export function AppThemeEditor({ showIntro = false }: { showIntro?: boolean }) {
	const { theme, config, updateTheme, updateConfig, reset, configError } = useAppTheme()
	const [error, setError] = useState<string | null>(null)
	return (
		<Stack gap="md">
			{(configError || error) && <Text role="alert" type="error">{configError || error}</Text>}
			<ThemeTweaker
				value={theme} onValueChange={updateTheme}
				config={config} onConfigChange={updateConfig}
				target="document" apply={false} manageModeClass={false}
				preview={false} showIntro={showIntro}
				onError={failure => setError(String(failure))}
				strings={{ title: "Theme settings" }}
				actionsSlot={showIntro ? <Button tone="neutral" buttonStyle="outline" aria-label="Reset app theme" onClick={() => { reset(); setError(null) }}>Reset</Button> : undefined}
			/>
		</Stack>
	)
}
