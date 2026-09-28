import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { MetadataList } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"
import { Money } from "themelia-ui/primitives"

export default function CartSummaryBlueprint() {
	return (
		<Card title="Order summary" description="3 items" style={{ maxWidth: "24rem" }}>
			<Stack>
				<MetadataList
					layout="rows"
					items={[
						{ label: "Subtotal", value: <Money amount={258} currency="EUR" /> },
						{ label: "Shipping", value: <Money amount={4.8} currency="EUR" /> },
						{ label: "Tax", value: <Money amount={51.6} currency="EUR" /> },
						{ label: "Total", value: <Money amount={314.4} currency="EUR" weight="semibold" /> },
					]}
				/>
				<Button onClick={() => toast("Checkout requested", { description: "Preview callback — connect this action to your application." })}>
					Check out
				</Button>
			</Stack>
		</Card>
	)
}
