import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"


export default function FormFieldExample() {
	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Email" required hint="We only use this for receipts.">
				<Input type="email" placeholder="you@example.com" />
			</FormField>
			<FormField label="Workspace" helperText="Lowercase letters and dashes only.">
				<Input defaultValue="acme-corp" />
			</FormField>
			<FormField label="Card number" error="That card number is not valid.">
				<Input defaultValue="4242 4242" />
			</FormField>
		</Stack>
	)
}
