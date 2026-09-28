import { OrderStatusCard, type OrderEvent } from "themelia-ui/blocks/admin/commerce"
import { Stack } from "themelia-ui/base/structure"

const ORDER_EVENTS: OrderEvent[] = [
	{ id: "1", label: "Order placed", timestamp: "14 Aug, 09:12", complete: true },
	{ id: "2", label: "Payment captured", timestamp: "14 Aug, 09:12", complete: true },
	{ id: "3", label: "Packed", timestamp: "15 Aug, 11:40", complete: true },
	{ id: "4", label: "Shipped", timestamp: "16 Aug, 06:02", complete: true },
	{ id: "5", label: "Delivered", complete: false },
]

export default function OrderStatusExample() {
	return (
		<Stack maxWidth="40rem" gap="none">
			<OrderStatusCard orderNumber="#1041" status="shipped" events={ORDER_EVENTS} eta="18 Aug" />
		</Stack>
	)
}
