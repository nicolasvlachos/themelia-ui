import { Button, ButtonGroup } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"

export default function Group() {
	return (
		<Stack direction="horizontal" gap="lg" wrap align="center">
			<ButtonGroup>
				<Button tone="neutral" buttonStyle="outline">Day</Button>
				<Button tone="neutral" buttonStyle="outline">Week</Button>
				<Button tone="neutral" buttonStyle="outline">Month</Button>
			</ButtonGroup>
			<ButtonGroup orientation="vertical">
				<Button tone="neutral" buttonStyle="outline">Top</Button>
				<Button tone="neutral" buttonStyle="outline">Bottom</Button>
			</ButtonGroup>
		</Stack>
	)
}
