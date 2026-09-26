import { Card } from "themelia-ui/base/cards"
import { Text } from "themelia-ui/base/typography"
import { TwoColumnLayout } from "themelia-ui/layout/containers"

export default function TwoColumn() {
	return (
		<TwoColumnLayout
			style={{ width: "100%" }}
			main={
				<Card surface="bordered" title="main" description="Primary detail, form, or index content.">
					<Text size="sm" type="secondary">Takes the wider column.</Text>
				</Card>
			}
			aside={
				<Card surface="bordered" title="aside" description="Summary, support, or an action rail.">
					<Text size="sm" type="secondary">Second in the DOM, always.</Text>
				</Card>
			}
		/>
	)
}
