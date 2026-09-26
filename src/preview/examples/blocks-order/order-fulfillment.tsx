import { BanIcon } from "lucide-react"

import { FulfillmentGroup, type OrderLine } from "themelia-ui/admin/patterns/commerce"
import { Stack } from "themelia-ui/base/structure"

const LINES: OrderLine[] = [
	{
		id: "1",
		title: "ADIDAS | CLASSIC BACKPACK | LEGEND INK MULTICOLOUR",
		variantTitle: "OS / blue",
		sku: "AD-04-OS-blue",
		unitPrice: "€50.00",
		quantity: 1,
		total: "€50.00",
	},
	{
		id: "2",
		title: "VANS | ERA 59 MOROCCAN | GEO/DRESS BLUES",
		variantTitle: "8 / blue",
		sku: "VN-04-8-blue",
		unitPrice: "€119.95",
		quantity: 1,
		total: "€119.95",
	},
	{
		id: "3",
		title: "NIKE | TODDLER ROSHE ONE",
		variantTitle: "4 / black",
		sku: "NK-02-4-black",
		unitPrice: "€70.00",
		quantity: 1,
		total: "€70.00",
	},
]

export default function OrderFulfillment() {
	return (
		<Stack gap="xl">
			<FulfillmentGroup
				status="unfulfilled"
				location="Bul Bulgaria 111"
				notice="Shipping not required"
				noticeIcon={BanIcon}
				items={LINES}
				actions={[
					{ id: "fulfil", label: "Mark as fulfilled" },
					{ id: "hold", label: "Put on hold" },
					{ id: "cancel", label: "Cancel items", tone: "destructive" },
				]}
			/>
			<FulfillmentGroup
				status="fulfilled"
				location="Amsterdam warehouse"
				items={[LINES[1]!]}
				actions={[{ id: "track", label: "Track shipment" }]}
			/>
		</Stack>
	)
}
