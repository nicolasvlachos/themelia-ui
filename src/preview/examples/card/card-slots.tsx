import { CreditCardIcon, PencilIcon, StarIcon, TrashIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"


export default function CardSlots() {
	return (
		<Stack gap="lg" style={{ maxWidth: "34rem", width: "100%" }}>
			<Card
				icon={<CreditCardIcon />}
				title="Primary payment method"
				titleSuffix={<Badge tone="neutral">Default</Badge>}
				description="Visa ending 4242, expires 09/28"
				headerDivider
				actions={[
					{ label: "Edit", icon: <PencilIcon />, onClick: () => {} },
					{ label: "Set as default", icon: <StarIcon />, onClick: () => {} },
					{ label: "Remove", icon: <TrashIcon />, onClick: () => {}, tone: "destructive" },
				]}
				footerText="Updated 3 days ago"
				footerSlot={<Button tone="neutral" buttonStyle="outline">Manage</Button>}
				footerDivider
			>
				<Text type="secondary" size="sm">
					Charged on the first of each month.
				</Text>
			</Card>

			<Card
				title="With an alert"
				description="A banner sits between the header and the content."
				alert="Your card expires next month."
				alertTone="warning"
			>
				<Text type="secondary" size="sm">
					Content follows the banner.
				</Text>
			</Card>
		</Stack>
	)
}
