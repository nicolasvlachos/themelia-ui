import { Checkbox } from "themelia-ui/base/choice-inputs"
import { Label } from "themelia-ui/base/label"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"


export default function LabelExample() {
	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<Stack gap="sm">
				<Label htmlFor="demo-email">Email</Label>
				<Input id="demo-email" placeholder="name@example.com" />
			</Stack>
			<Stack direction="horizontal" gap="sm" align="center">
				<Checkbox id="demo-terms" />
				<Label htmlFor="demo-terms">I accept the terms</Label>
			</Stack>
		</Stack>
	)
}
