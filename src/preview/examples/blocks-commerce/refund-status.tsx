import { RefundStatus } from "themelia-ui/blocks/admin/commerce"
import { Stack } from "themelia-ui/base/structure"

export default function RefundStatusExample() {
	return (
		<Stack maxWidth="40rem" gap="none">
			<RefundStatus
				stage="processing"
				amount="124.00 EUR"
				reason="Damaged on arrival"
				method="Visa ending 4417"
				eta="22 Aug"
			/>
		</Stack>
	)
}
