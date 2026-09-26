import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"

export default function HorizontalFields() {
	return (
		<Stack gap="lg" style={{ width: "100%" }}>
			<FormField orientation="horizontal" label="Display name" hint="Shown on invoices.">
				<Input defaultValue="Acme Corporation" />
			</FormField>
			<FormField orientation="horizontal" label="Billing email" required>
				<Input type="email" defaultValue="billing@acme.com" />
			</FormField>
		</Stack>
	)
}
