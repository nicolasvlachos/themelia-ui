import { Button } from "themelia-ui/base/buttons"
import { Checkbox, Switch } from "themelia-ui/base/choice-inputs"
import { Input } from "themelia-ui/base/text-inputs"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export function ControlRow() {
	return (
		<Stack direction="horizontal" gap="md" align="center" wrap>
			<Text size="sm">Label</Text>
			<Button>Save</Button>
			<Button tone="neutral" buttonStyle="outline">
				Cancel
			</Button>
			<Button iconOnly aria-label="Add">
				＋
			</Button>
			<Input aria-label="Field" placeholder="Field" style={{ width: "9rem" }} />
			<Checkbox label="Check" defaultChecked />
			<Switch label="Switch" defaultChecked />
		</Stack>
	)
}
