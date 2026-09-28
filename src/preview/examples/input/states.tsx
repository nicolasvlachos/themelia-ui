import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input, NativeSelect } from "themelia-ui/base/text-inputs"


export default function States() {
	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Default" helperText="The supporting line.">
				<Input placeholder="name@example.com" />
			</FormField>
			<FormField label="Invalid" error="Enter a valid email address.">
				<Input defaultValue="not-an-email" aria-invalid="true" />
			</FormField>
			<FormField label="Disabled">
				<Input placeholder="Not editable" disabled />
			</FormField>
			<FormField label="Disabled select">
				<NativeSelect disabled defaultValue="a">
					<option value="a">Not editable</option>
				</NativeSelect>
			</FormField>
		</Stack>
	)
}
