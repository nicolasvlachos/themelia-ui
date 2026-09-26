import { BanknoteIcon, CreditCardIcon } from "lucide-react"

import { PaymentTimeline } from "themelia-ui/admin/patterns/commerce"
import { Stack } from "themelia-ui/base/structure"

export default function PaymentTimelineExample() {
	return (
		<Stack maxWidth="32rem" gap="none">
			<PaymentTimeline
				events={[
					{ id: "1", label: "Authorised", date: "14 Aug", amount: "3,120.00 EUR", icon: CreditCardIcon, settled: true },
					{ id: "2", label: "Captured", date: "15 Aug", amount: "3,120.00 EUR", icon: BanknoteIcon, settled: true },
					{ id: "3", label: "Payout", date: "Expected 22 Aug", icon: BanknoteIcon, settled: false },
				]}
			/>
		</Stack>
	)
}
