import { Button, ButtonGroup } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"

export default function Group() {
	return (
		<Stack direction="horizontal" wrap align="center">
			<ButtonGroup>
				<Button tone="neutral" appearance="outline">Day</Button>
				<Button tone="neutral" appearance="outline">Week</Button>
				<Button tone="neutral" appearance="outline">Month</Button>
			</ButtonGroup>
			<ButtonGroup orientation="vertical">
				<Button tone="neutral" appearance="outline">Top</Button>
				<Button tone="neutral" appearance="outline">Bottom</Button>
			</ButtonGroup>
		</Stack>
	)
}
