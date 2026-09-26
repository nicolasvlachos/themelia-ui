import { Grid, GridCell } from "themelia-ui/base/structure"
import { UIScope } from "themelia-ui/ui-provider"

import { Sample } from "./_shared"

export default function UiScopeDensity() {
	return (
		<Grid columns={3} gap="lg">
			{(["compact", "default", "comfortable"] as const).map((density) => (
				<GridCell key={density}>
					<UIScope config={{ density }}>
						<Sample label={`density="${density}"`} />
					</UIScope>
				</GridCell>
			))}
		</Grid>
	)
}
