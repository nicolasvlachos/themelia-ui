import { Accordion } from "themelia-ui/base/accordion"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"


export default function AccordionSurfaces() {
	return (
		<Stack style={{ maxWidth: "34rem", width: "100%" }}>
			{(["bordered", "card", "flat"] as const).map((surface) => (
				<Stack key={surface} gap="sm">
					<Text size="xs" type="secondary">
						{surface}
					</Text>
					<Accordion
						surface={surface}
						items={[
							{ value: "a", title: "First section", content: "Body copy." },
							{ value: "b", title: "Second section", content: "Body copy." },
						]}
					/>
				</Stack>
			))}
		</Stack>
	)
}
