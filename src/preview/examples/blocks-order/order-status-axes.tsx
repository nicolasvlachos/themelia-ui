import { OrderHeader } from "themelia-ui/blocks/admin/commerce"
import { Stack } from "themelia-ui/base/structure"

export default function OrderStatusAxes() {
	return (
		<Stack>
			<OrderHeader
				orderNumber="1036"
				paymentStatus="refunded"
				fulfillmentStatus="unfulfilled"
				placedAt="December 21, 2025 at 10:10 pm"
				source="Simple Sample Data (via import)"
				actions={[
					{ id: "print", label: "Print packing slip" },
					{ id: "cancel", label: "Cancel order", tone: "destructive" },
				]}
			/>
			<OrderHeader orderNumber="1037" paymentStatus="authorized" fulfillmentStatus="scheduled" placedAt="2 Jan 2026" />
			<OrderHeader orderNumber="1038" paymentStatus="paid" fulfillmentStatus="partiallyFulfilled" placedAt="4 Jan 2026" />
		</Stack>
	)
}
