import { Badge, type BadgeTone } from "themelia-ui/base/badge"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

const TONES: BadgeTone[] = ["neutral", "primary", "secondary", "success", "info", "warning", "destructive"]

export default function BadgeTones() {
	return (
		<Stack style={{ width: "100%" }}>
			{(["soft", "solid", "outline"] as const).map((appearance) => (
				<Stack key={appearance} gap="sm">
					<Text size="xs" type="secondary">{appearance}</Text>
					<Stack direction="horizontal" gap="sm" wrap>
						{TONES.map((tone) => (
							<Badge key={tone} tone={tone} appearance={appearance}>{tone}</Badge>
						))}
					</Stack>
				</Stack>
			))}
		</Stack>
	)
}
