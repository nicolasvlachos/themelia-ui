import { Badge, type BadgeTone } from "themelia-ui/base/badge"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

const TONES: BadgeTone[] = ["neutral", "primary", "secondary", "success", "info", "warning", "destructive"]

export default function BadgeTones() {
	return (
		<Stack gap="lg" style={{ width: "100%" }}>
			{(["soft", "solid", "outline"] as const).map((variant) => (
				<Stack key={variant} gap="xs">
					<Text size="xs" type="secondary">{variant}</Text>
					<Stack direction="horizontal" gap="sm" wrap>
						{TONES.map((tone) => (
							<Badge key={tone} tone={tone} variant={variant}>{tone}</Badge>
						))}
					</Stack>
				</Stack>
			))}
		</Stack>
	)
}
