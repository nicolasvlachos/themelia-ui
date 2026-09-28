import { OrderSummary } from "themelia-ui/blocks/admin/commerce"

export default function OrderSummaryExample() {
	return (
		<OrderSummary
			paymentStatus="refunded"
			goods={[
				{ id: "sub", label: "Subtotal", note: "3 items", amount: "€239.95" },
				{ id: "ship", label: "Shipping", note: "Standard", amount: "€0.00" },
				{ id: "tax", label: "Tax", note: "20%", amount: "€0.00" },
			]}
			total={{ label: "Total", amount: "€239.95" }}
			payments={[
				{ id: "paid", label: "Paid", amount: "€0.00" },
				{ id: "balance", label: "Balance", amount: "€239.95" },
			]}
			alert="€239.95 of the balance is currently unauthorized"
		/>
	)
}
