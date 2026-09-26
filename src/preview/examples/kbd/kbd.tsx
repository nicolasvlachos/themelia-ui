import { Kbd, KbdGroup } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function KbdExample() {
	return (
		<Stack gap="sm">
			<Stack direction="horizontal" gap="md" align="center">
				<Text size="sm" type="secondary">Open the palette with</Text>
				<Kbd>⌘K</Kbd>
				<Text size="sm" type="secondary">or</Text>
				<Kbd>Ctrl K</Kbd>
				<Text size="sm" type="secondary">· close with</Text>
				<Kbd>Esc</Kbd>
			</Stack>
			<Stack direction="horizontal" gap="md" align="center">
				<Text size="sm" type="secondary">Go to the inbox with</Text>
				{/* A sequence: G, then I. The wider gap between caps says "in turn". */}
				<KbdGroup>
					<Kbd>G</Kbd>
					<Kbd>I</Kbd>
				</KbdGroup>
			</Stack>
		</Stack>
	)
}
