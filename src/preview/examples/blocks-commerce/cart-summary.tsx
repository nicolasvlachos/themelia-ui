import { CartSummary, type CartLine } from "themelia-ui/blocks/admin/commerce"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"

const CART: CartLine[] = [
	{ id: "1", title: "Merino crew neck", variantTitle: "Medium / Charcoal", quantity: 1, price: "89.00 EUR" },
	{ id: "2", title: "Oxford shirt", variantTitle: "Large / White", quantity: 2, price: "124.00 EUR" },
	{ id: "3", title: "Leather belt", quantity: 1, price: "45.00 EUR" },
]

export default function CartSummaryExample() {
	return (
		<Stack maxWidth="32rem" gap="none">
			<CartSummary
				items={CART}
				subtotal="258.00 EUR"
				tax="51.60 EUR"
				shipping="4.80 EUR"
				discount="50.00 EUR"
				total="264.40 EUR"
				onCheckout={() => toast("Checkout requested", { description: "Preview callback — connect this action to your application." })}
			/>
		</Stack>
	)
}
