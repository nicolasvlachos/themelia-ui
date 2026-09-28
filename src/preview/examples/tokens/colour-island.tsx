import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { Grid } from "themelia-ui/base/structure"
import { UIProvider } from "themelia-ui/ui-provider"

export default function ColourIsland() {
	return (
		<Grid columns={{ base: 1, sm: 2 }}>
			{(["light", "dark"] as const).map((colorScheme) => (
				<UIProvider key={colorScheme} config={{ colorScheme }}>
					<Card title={`A ${colorScheme} region`} description="Every colour inside resolves to this half.">
						<Button>Continue</Button>
					</Card>
				</UIProvider>
			))}
		</Grid>
	)
}
