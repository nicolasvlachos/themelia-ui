import { CreditCardIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"


export default function CardHeaderSlots() {
	return (
		<Stack style={{ maxWidth: "34rem", width: "100%" }}>
			<Card
				icon={<CreditCardIcon />}
				title="Payment method"
				titleSuffix={<Badge tone="success">Verified</Badge>}
				tooltip="We store only the last four digits. The full number never reaches our servers."
				headerAction={
					<Button appearance="ghost" tone="neutral">
						Change
					</Button>
				}
				description="Charged on the first of the month."
				headerDivider
				footerText="Next charge 1 April"
				footerSlot={<Button appearance="outline" tone="neutral">Invoices</Button>}
				footerDivider
			>
				<Text size="sm" type="secondary">
					Visa ending 4417.
				</Text>
			</Card>
		</Stack>
	)
}
