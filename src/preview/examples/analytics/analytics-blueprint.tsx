import { ArrowUpIcon, CreditCardIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { Card } from "themelia-ui/base/cards"
import { Sparkline } from "themelia-ui/base/chart"
import { IconBadge } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { DisplayLabel, Text } from "themelia-ui/base/typography"
import { Money } from "themelia-ui/primitives"

export default function AnalyticsBlueprint() {
	return (
		<Card style={{ maxWidth: "20rem" }}>
			<Stack gap="sm">
				<Stack direction="horizontal" align="center" gap="sm">
					<IconBadge icon={CreditCardIcon} tone="primary" />
					<DisplayLabel>Revenue</DisplayLabel>
				</Stack>
				<Stack direction="horizontal" align="center" justify="between" gap="sm">
					<Money amount={48200} currency="EUR" size="xl" weight="semibold" />
					<Badge tone="success">
						<ArrowUpIcon />
						12.4%
					</Badge>
				</Stack>
				<Sparkline data={[18, 22, 19, 27, 24, 31, 29, 38]} tone="success" label="Revenue rising over eight weeks" />
				<Text size="xs" type="secondary">
					Net of refunds, this quarter
				</Text>
			</Stack>
		</Card>
	)
}
