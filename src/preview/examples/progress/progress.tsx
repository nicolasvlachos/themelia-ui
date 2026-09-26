import { Progress } from "themelia-ui/base/feedback"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function ProgressExample() {
	return (
		// Captioned: `label` is the accessible name and renders nothing.
		<Stack gap="lg" style={{ width: "100%" }}>
			{[
				{ value: 24, tone: undefined, caption: "value={24}" },
				{ value: 64, tone: "info" as const, caption: 'value={64} tone="info"' },
				{ value: 100, tone: "success" as const, caption: 'value={100} tone="success"' },
				{ value: 92, tone: "warning" as const, caption: 'value={92} tone="warning"' },
				{ value: undefined, tone: undefined, caption: "no value — indeterminate" },
			].map((row) => (
				<Stack key={row.caption} gap="2xs">
					<Text size="xs" type="secondary">{row.caption}</Text>
					<Progress value={row.value} tone={row.tone} label={row.caption} />
				</Stack>
			))}
		</Stack>
	)
}
