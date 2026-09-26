import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { Text } from "themelia-ui/base/typography"
import { Page } from "themelia-ui/layout/page"

/* Dashed on the inline edges only: Container's gutter is inline padding. */
const FRAME = {
	width: "100%",
	borderInline: "1px dashed var(--border)",
} as const

export default function PageExample() {
	return (
		<div style={FRAME}>
			<Page
				maxWidth="md"
				gutter="sm"
				header={{
					title: "Invoices",
					description: "The dashed edges are the container's gutter. It is inline only — vertical rhythm belongs to the shell around the page, not to the container.",
					actions: <Button>New</Button>,
				}}
			>
				<Card surface="bordered" title="September" description="24 invoices, 3 overdue.">
					<Text size="sm" type="secondary">The body region.</Text>
				</Card>
			</Page>
		</div>
	)
}
