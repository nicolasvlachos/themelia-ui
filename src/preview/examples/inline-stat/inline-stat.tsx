import { Card, CardContent } from "themelia-ui/base/cards"
import { InlineStat } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"

export default function InlineStatExample() {
	return (
		<Stack gap="xl">
			<Card style={{ maxWidth: "24rem" }}>
				<CardContent>
					<Stack gap="md">
						<InlineStat label="Subtotal" value="€ 1,240.00" mono />
						<InlineStat label="Shipping" value="€ 18.50" mono />
						<InlineStat label="Discount" value={null} mono />
					</Stack>
				</CardContent>
			</Card>
			<Stack direction="horizontal" gap="2xl" wrap>
				<InlineStat layout="inline" label="Region" value="eu-west-1" mono />
				<InlineStat layout="inline" label="Plan" value="Team" />
				<InlineStat layout="inline" label="Seats" value="12" mono />
			</Stack>
			<Stack direction="horizontal" gap="2xl" wrap>
				<InlineStat layout="stacked" label="Open invoices" value="14" mono />
				<InlineStat layout="stacked" label="Overdue" value="3" mono />
				<InlineStat layout="stacked" label="Collected" value="€ 48,200.00" mono />
			</Stack>
		</Stack>
	)
}
