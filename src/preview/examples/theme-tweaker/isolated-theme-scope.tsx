import { Button } from "themelia-ui/base/buttons"
import { ThemeScope, createTheme } from "themelia-ui/features/theme-tweaker"

export default function IsolatedThemeScope() {
	return (
		<ThemeScope theme={createTheme({ shared: { "--radius": "0.875rem" } })}>
			<Button>Scoped radius</Button>
		</ThemeScope>
	)
}
