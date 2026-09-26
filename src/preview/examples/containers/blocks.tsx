import { Card } from "themelia-ui/base/cards"
import { Text } from "themelia-ui/base/typography"
import { Container, Section } from "themelia-ui/layout/containers"

export default function Blocks() {
	return (
		// Dashed on the inline edges only: the gutter is inline padding.
		<Container maxWidth="md" gutter="sm" style={{ borderInline: "1px dashed var(--border)" }}>
			<Section>
				<Card surface="bordered" title="Section" description="A group, with the rhythm between its children.">
					<Text size="sm" type="secondary">
						Container centres this at the reading measure and owns the gutter you can
						see as the dashed edge.
					</Text>
				</Card>
				<Card surface="bordered" title="Second group" />
			</Section>
		</Container>
	)
}
