import {
	Button, ButtonGroup, ButtonGroupSeparator, ButtonGroupText,
} from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"

export default function ButtonGroupParts() {
	return (
		<Stack direction="horizontal" wrap align="center">
			<ButtonGroup>
				<Button tone="neutral" appearance="outline">Day</Button>
				<ButtonGroupSeparator />
				<Button tone="neutral" appearance="outline">Week</Button>
				<ButtonGroupSeparator />
				<Button tone="neutral" appearance="outline">Month</Button>
			</ButtonGroup>
			<ButtonGroup>
				<ButtonGroupText>Show</ButtonGroupText>
				<Button tone="neutral" appearance="outline">All</Button>
				<Button tone="neutral" appearance="outline">Open</Button>
			</ButtonGroup>
		</Stack>
	)
}
