import { DiscountStack } from "themelia-ui/admin/patterns/commerce"
import { Stack } from "themelia-ui/base/structure"

export default function DiscountStackExample() {
	return (
		<Stack maxWidth="32rem" gap="none">
			<DiscountStack
				discounts={[
					{ id: "1", label: "Summer sale", kind: "Automatic", amount: "30.00 EUR" },
					{ id: "2", label: "WELCOME10", kind: "Code", amount: "20.00 EUR" },
				]}
				totalSavings="50.00 EUR"
			/>
		</Stack>
	)
}
