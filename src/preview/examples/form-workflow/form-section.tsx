import { Button } from "themelia-ui/base/buttons"
import { FormField, FormSection } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"
import { Text } from "themelia-ui/base/typography"

export default function FormSectionExample() {
	return (
		<Stack style={{ maxWidth: "34rem" }}>
			<FormSection
				title="Billing"
				description="Where invoices go. Changing it does not change the shipping address."
				actions={
					<Button tone="neutral" appearance="ghost">
						Edit
					</Button>
				}
				footer={
					<Text size="xs" type="secondary">
						VAT is added at checkout.
					</Text>
				}
			>
				<FormField label="Company">
					<Input defaultValue="Northwind Traders" />
				</FormField>
			</FormSection>
		</Stack>
	)
}
