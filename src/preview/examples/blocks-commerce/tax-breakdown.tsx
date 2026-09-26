import { TaxBreakdown } from "themelia-ui/admin/patterns/commerce"
import { Stack } from "themelia-ui/base/structure"

export default function TaxBreakdownExample() {
	return (
		<Stack maxWidth="32rem" gap="none">
			<TaxBreakdown
				subtotal="258.00 EUR"
				taxes={[
					{ id: "vat", label: "VAT", rate: "20%", amount: "51.60 EUR" },
					{ id: "eco", label: "Eco levy", rate: "0.5%", amount: "1.29 EUR" },
				]}
				totalTax="52.89 EUR"
				total="310.89 EUR"
			/>
		</Stack>
	)
}
