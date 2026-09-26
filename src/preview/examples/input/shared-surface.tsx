import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input, NativeSelect, Textarea } from "themelia-ui/base/text-inputs"


export default function SharedSurface() {
	return (
		<Stack gap="lg" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Input">
				<Input placeholder="Northwind Traders" />
			</FormField>
			<FormField label="Native select">
				<NativeSelect defaultValue="">
					<option value="" disabled>
						Select an option
					</option>
					<option value="a">First option</option>
					<option value="b">Second option</option>
				</NativeSelect>
			</FormField>
			<FormField label="Textarea">
				<Textarea placeholder="Anything worth recording." />
			</FormField>
		</Stack>
	)
}
