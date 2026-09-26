import { FulfillmentGroup, OrderLineItem, type OrderLine } from "themelia-ui/admin/patterns/commerce"

const PERSONALISED: OrderLine = {
	id: "4",
	title: "ENGRAVED LEATHER TAG",
	variantTitle: "Tan",
	sku: "LT-01-tan",
	unitPrice: "€24.00",
	quantity: 2,
	/* Not 2 × 24: this line carries a bundle discount the unit price does not predict. */
	total: "€38.40",
	properties: [
		{ label: "Engraving", value: "A. MERCER" },
		{ label: "Gift message", value: "Happy birthday, from all of us" },
		{ label: "Bundle", value: "Buy 2, save 20%" },
	],
}

export default function OrderLineItemExample() {
	return (
		// Passed as children rather than items — the seam a caller uses for a bespoke row.
		<FulfillmentGroup status="unfulfilled">
			<OrderLineItem {...PERSONALISED} />
		</FulfillmentGroup>
	)
}
