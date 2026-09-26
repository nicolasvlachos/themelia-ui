import {
	DocumentStackIllustration,
	InboxCleanIllustration,
	SearchGlassIllustration,
	StackedCardsIllustration,
	UsersCircleIllustration,
} from "themelia-ui/base/feedback"
import { Grid, Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

const ILLUSTRATIONS = [
	{ name: "StackedCardsIllustration", Component: StackedCardsIllustration, use: "no records" },
	{ name: "DocumentStackIllustration", Component: DocumentStackIllustration, use: "invoices, reports, files" },
	{ name: "UsersCircleIllustration", Component: UsersCircleIllustration, use: "people" },
	{ name: "InboxCleanIllustration", Component: InboxCleanIllustration, use: "all caught up" },
	{ name: "SearchGlassIllustration", Component: SearchGlassIllustration, use: "nothing matches" },
]

export default function EmptyIllustrations() {
	return (
		<Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="2xl">
			{ILLUSTRATIONS.map(({ name, Component, use }) => (
				<Stack key={name} gap="md" align="center">
					<Component />
					<Stack gap="none" align="center">
						<Text size="sm" weight="medium">{name}</Text>
						<Text size="xs" type="secondary">{use}</Text>
					</Stack>
				</Stack>
			))}
		</Grid>
	)
}
