import { BooleanIndicator } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"

export default function BooleanIndicatorExample() {
	return (
		<Stack direction="horizontal" gap="xl">
			<BooleanIndicator value strings={{ true: "Active", false: "Paused" }} />
			<BooleanIndicator value={false} strings={{ true: "Active", false: "Paused" }} />
		</Stack>
	)
}
