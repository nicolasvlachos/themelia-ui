import { Card } from "themelia-ui/base/cards"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"


export default function CardAlert() {
	return (
		<Stack style={{ maxWidth: "34rem", width: "100%" }}>
			<Card title="Domain" alert="Verification expires in 3 days." alertTone="warning">
				<Text size="sm" type="secondary">
					acme.com
				</Text>
			</Card>
			<Card title="Billing" alert="Payment failed." alertTone="destructive">
				<Text size="sm" type="secondary">
					We will retry in 24 hours.
				</Text>
			</Card>
		</Stack>
	)
}
