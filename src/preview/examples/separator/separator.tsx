import { Separator } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function SeparatorExample() {
	return (
		<Stack style={{ width: "100%" }}>
			<Separator />
			<Separator label="OR" />
			<Stack direction="horizontal" gap="sm" align="center" style={{ height: "1.5rem" }}>
				<Text size="sm">Left</Text>
				<Separator orientation="vertical" />
				<Text size="sm">Right</Text>
			</Stack>
		</Stack>
	)
}
