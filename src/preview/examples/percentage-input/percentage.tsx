import { FormField } from "themelia-ui/base/forms"
import { PercentageInput } from "themelia-ui/base/forms-numeric"
import { Stack } from "themelia-ui/base/structure"


export default function Percentage() {
	return (
		<Stack gap="xl" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="VAT rate">
				<PercentageInput defaultValue="21" />
			</FormField>
			<FormField label="With steppers">
				<PercentageInput defaultValue="50" step={5} decimalPlaces={0} />
			</FormField>
		</Stack>
	)
}
