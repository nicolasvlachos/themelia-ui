import { FormField } from "themelia-ui/base/forms"
import { DecimalInput } from "themelia-ui/base/forms-numeric"
import { Stack } from "themelia-ui/base/structure"


export default function Decimal() {
	return (
		<Stack gap="xl" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Plain" helperText="Commas become dots; extra decimals are refused.">
				<DecimalInput defaultValue="12.5" decimalPlaces={2} />
			</FormField>
			<FormField label="With steppers" helperText="Steps snap relative to min, not to zero.">
				<DecimalInput defaultValue="10" min={5} max={50} step={10} decimalPlaces={0} />
			</FormField>
			<FormField label="Bankers' rounding" helperText="half-even, so halves do not accumulate a bias across many rows.">
				<DecimalInput defaultValue="2.345" decimalPlaces={2} roundingMode="half-even" />
			</FormField>
			<FormField label="Invalid" error="Enter an amount.">
				<DecimalInput aria-invalid defaultValue="" />
			</FormField>
		</Stack>
	)
}
