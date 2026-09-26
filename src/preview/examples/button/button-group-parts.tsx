import {
	Button, ButtonGroup, ButtonGroupSeparator, ButtonGroupText,
} from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"

export default function ButtonGroupParts() {
	return (
		<Stack direction="horizontal" gap="xl" wrap align="center">
			<ButtonGroup>
				<Button tone="neutral" buttonStyle="outline">Day</Button>
				<ButtonGroupSeparator />
				<Button tone="neutral" buttonStyle="outline">Week</Button>
				<ButtonGroupSeparator />
				<Button tone="neutral" buttonStyle="outline">Month</Button>
			</ButtonGroup>
			<ButtonGroup>
				<ButtonGroupText>Show</ButtonGroupText>
				<Button tone="neutral" buttonStyle="outline">All</Button>
				<Button tone="neutral" buttonStyle="outline">Open</Button>
			</ButtonGroup>
		</Stack>
	)
}
