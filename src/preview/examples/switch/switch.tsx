import { Switch } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"

export default function SwitchExample() {
	return (
		<Stack gap="sm">
			<Switch label="Email notifications" defaultChecked />
			<Switch label="Disabled" disabled />
		</Stack>
	)
}
