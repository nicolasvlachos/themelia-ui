import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { Grid } from "themelia-ui/base/structure"
import { ThemeScope, createTheme } from "themelia-ui/features/theme-tweaker"

/*
 * Both radii: a container reads --radius and the controls inside it read --radius-sm, so a
 * scope that set only one would leave half the corners as they were.
 */
const SQUARE_CORNERS = createTheme({ shared: { "--radius": "0.25rem", "--radius-sm": "0.125rem" } })

export default function IsolatedThemeScope() {
	return (
		<Grid>
			<Card
				title="App theme"
				description="The corners every other region uses."
				footerSlot={<Button>Unscoped</Button>}
			/>
			<ThemeScope theme={SQUARE_CORNERS}>
				<Card
					title="Scoped theme"
					description="Squarer corners, in this region only."
					footerSlot={<Button>Scoped radius</Button>}
				/>
			</ThemeScope>
		</Grid>
	)
}
