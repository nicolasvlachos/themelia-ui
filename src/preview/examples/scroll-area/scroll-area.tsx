import { ScrollArea } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

// A card's edge and inset, so the demo frames the region the way a real surface would.
const SCROLL_FRAME = {
	maxHeight: "9rem",
	border: "var(--border-width) solid var(--border)",
	borderRadius: "var(--radius)",
	padding: "var(--surface-y) var(--surface-x)",
} as const

export default function ScrollAreaExample() {
	return (
		<ScrollArea style={SCROLL_FRAME}>
			<Stack gap="xs">
				{Array.from({ length: 12 }, (_, index) => (
					<Text key={index} size="sm" type="secondary">
						Scrollable line {index + 1}
					</Text>
				))}
			</Stack>
		</ScrollArea>
	)
}
