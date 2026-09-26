import { Button } from "themelia-ui/base/buttons"
import { Checkbox } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { UIProvider } from "themelia-ui/ui-provider"

export default function TypeFactor() {
	return (
		<Stack gap="lg">
			<Stack gap="sm">
				<Text type="secondary" size="xs">typography.scale 0.875 — type shrinks, control geometry holds</Text>
				<UIProvider config={{ typography: { scale: 0.875 } }}>
					<Stack direction="horizontal" gap="md" align="center" wrap>
						<Text>Body copy at this factor.</Text>
						<Button>Save</Button>
						<Checkbox label="Check" defaultChecked />
					</Stack>
				</UIProvider>
			</Stack>
			<Stack gap="sm">
				<Text type="secondary" size="xs">scale 0.875 + typography.scale 1 — geometry shrinks, type holds</Text>
				<UIProvider config={{ scale: 0.875, typography: { scale: 1 } }}>
					<Stack direction="horizontal" gap="md" align="center" wrap>
						<Text>Body copy at this factor.</Text>
						<Button>Save</Button>
						<Checkbox label="Check" defaultChecked />
					</Stack>
				</UIProvider>
			</Stack>
		</Stack>
	)
}
