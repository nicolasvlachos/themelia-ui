import { AddressCard } from "themelia-ui/admin/patterns/commerce"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"

const ADDRESS = {
	name: "Alice Mercer",
	line1: "14 Kingsway",
	line2: "Flat 3",
	city: "London",
	postalCode: "WC2B 6UF",
	country: "United Kingdom",
	phone: "+44 20 7946 0102",
}

export default function AddressCardExample() {
	return (
		<Stack maxWidth="28rem" gap="none">
			<AddressCard kind="shipping" {...ADDRESS} isDefault onEdit={() => toast("Edit address requested", { description: "Preview callback — connect this action to your application." })} onRemove={() => toast("Remove address requested", { description: "Preview callback — connect this action to your application." })} />
		</Stack>
	)
}
