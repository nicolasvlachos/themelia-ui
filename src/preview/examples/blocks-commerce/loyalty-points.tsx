import { LoyaltyPoints } from "themelia-ui/admin/patterns/commerce"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"

export default function LoyaltyPointsExample() {
	return (
		<Stack maxWidth="32rem" gap="none">
			<LoyaltyPoints
				balance={4830}
				tier="Platinum"
				tierTone="secondary"
				movements={[
					{ id: "1", label: "Order #1041", date: "16 Aug", points: "310", earned: true },
					{ id: "2", label: "Redeemed for shipping", date: "12 Aug", points: "500", earned: false },
					{ id: "3", label: "Birthday bonus", date: "01 Aug", points: "250", earned: true },
				]}
				onRedeem={() => toast("Redeem points requested", { description: "Preview callback — connect this action to your application." })}
			/>
		</Stack>
	)
}
