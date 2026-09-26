import { PaymentMethodCard } from "themelia-ui/admin/patterns/commerce"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"

export default function PaymentMethod() {
	return (
		<Stack maxWidth="28rem" gap="none">
			<PaymentMethodCard brand="visa" last4="4417" expiry="09/28" holderName="A. Mercer" isDefault onChange={() => toast("Change payment method requested", { description: "Preview callback — connect this action to your application." })} />
		</Stack>
	)
}
