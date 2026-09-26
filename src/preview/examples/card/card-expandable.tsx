import { Card } from "themelia-ui/base/cards"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"


export default function CardExpandable() {
	return (
		<Card expandable title="Terms of service" style={{ maxWidth: "34rem", width: "100%" }}>
			<Stack gap="md">
				{Array.from({ length: 10 }, (_, i) => (
					<Text key={i} type="secondary" size="sm">
						Clause {i + 1}. Content that runs past the collapsed height, so the fade has
						something to fade.
					</Text>
				))}
			</Stack>
		</Card>
	)
}
