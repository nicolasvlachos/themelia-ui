import { InvoiceLineItems } from "themelia-ui/admin/patterns/commerce"

export default function InvoiceLineItemsExample() {
	return (
		<InvoiceLineItems
			currency="EUR"
			taxRate={0.2}
			lines={[
				{ id: "1", description: "Design retainer", quantity: 1, unitPrice: 2000 },
				{ id: "2", description: "Implementation", quantity: 12, unitPrice: 45 },
				{ id: "3", description: "Hosting", quantity: 3, unitPrice: 20 },
			]}
		/>
	)
}
