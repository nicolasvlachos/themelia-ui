import { Checkbox } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"

export default function CheckboxExample() {
	return (
		<Stack gap="sm">
			<Checkbox label="Unchecked" />
			<Checkbox label="Checked" defaultChecked />
			<Checkbox label="Indeterminate" indeterminate />
			<Checkbox label="Disabled" disabled />
			<Checkbox label="A long label that wraps onto a second line, so the box stays on the first line instead of floating into the middle of the paragraph." />
		</Stack>
	)
}
