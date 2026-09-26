import { Card, type CardSurface } from "themelia-ui/base/cards"
import { Grid } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

const SURFACES: CardSurface[] = ["card", "framed", "flat", "bordered"]

export default function CardSurfaces() {
	return (
		/* Two columns for four surfaces, so none sits alone on a row. */
		<Grid columns={{ base: 1, sm: 2 }} gap="lg" style={{ width: "100%" }}>
			{SURFACES.map((surface) => (
				<Card key={surface} surface={surface} title={surface} description="Supporting sentence.">
					<Text type="secondary" size="sm">
						Card content.
					</Text>
				</Card>
			))}
		</Grid>
	)
}
