import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"

export default function State() {
	return (
		<Stack direction="horizontal" wrap align="center">
			<Button>Save changes</Button>
			<Button loading>Save changes</Button>
			<Button disabled>Disabled</Button>
			<Button tone="neutral" appearance="outline" loading>
				Loading
			</Button>
		</Stack>
	)
}
