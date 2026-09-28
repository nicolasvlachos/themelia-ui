import { AspectRatio } from "themelia-ui/base/aspect-ratio"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function AspectRatioExample() {
	return (
		<Stack direction="horizontal" style={{ width: "100%" }}>
			{[
				{ ratio: 16 / 9, label: "16 / 9" },
				{ ratio: 1, label: "1 / 1" },
				{ ratio: 3 / 4, label: "3 / 4" },
			].map((entry) => (
				<Stack key={entry.label} gap="sm" style={{ flex: 1 }}>
					<AspectRatio ratio={entry.ratio}>
						<div style={{ display: "grid", placeItems: "center", background: "var(--muted)", borderRadius: "var(--radius)" }}>
							<Text size="xs" type="secondary">{entry.label}</Text>
						</div>
					</AspectRatio>
				</Stack>
			))}
		</Stack>
	)
}
