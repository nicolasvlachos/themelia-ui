import { ShipmentTracking } from "themelia-ui/blocks/admin/commerce"
import { Stack } from "themelia-ui/base/structure"

export default function ShipmentTrackingExample() {
	return (
		<Stack maxWidth="40rem" gap="none">
			<ShipmentTracking
				trackingNumber="1Z999AA10123456784"
				carrier="UPS"
				status="inTransit"
				steps={[
					{ label: "Label created", done: true, timestamp: "14 Aug, 09:40" },
					{ label: "Collected", done: true, timestamp: "14 Aug, 17:05" },
					{ label: "In transit", done: true, timestamp: "15 Aug, 03:22" },
					{ label: "Out for delivery", done: false },
					{ label: "Delivered", done: false },
				]}
				details={[{ label: "Service", value: "Express" }]}
			/>
		</Stack>
	)
}
