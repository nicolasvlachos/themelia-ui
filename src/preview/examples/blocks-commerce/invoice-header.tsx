import { InvoiceHeader } from "themelia-ui/blocks/admin/commerce"
import { Stack } from "themelia-ui/base/structure"

export default function InvoiceHeaderExample() {
	return (
		<Stack maxWidth="40rem" gap="none">
			<InvoiceHeader
				invoiceNumber="INV-2026-0114"
				status="overdue"
				from={{ name: "Northwind Traders", location: "Rotterdam, NL" }}
				to={{ name: "Adventure Park Bansko", location: "Bansko, BG" }}
				issuedAt="14 Aug 2026"
				dueAt="28 Aug 2026"
				amountDue="3,120.00 EUR"
			/>
		</Stack>
	)
}
