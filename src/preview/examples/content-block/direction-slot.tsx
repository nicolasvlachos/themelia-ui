import { ContentBlock } from "themelia-ui/base/display"
import { DirectionProvider } from "themelia-ui/base/direction"
import { Slot } from "themelia-ui/base/slot"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function DirectionSlot() {
	return (
		<Stack gap="lg">
			<DirectionProvider direction="rtl">
				<ContentBlock surface="card" title="اتجاه من اليمين إلى اليسار">
					<Text size="xs" type="secondary">
						Every inset, gap and border in this block is a logical property, so the whole
						region mirrors from one prop rather than from a stylesheet per direction.
					</Text>
				</ContentBlock>
			</DirectionProvider>
			<Slot className={undefined}>
				<Text size="xs" type="secondary">
					Slot renders its child, merged. There is nothing of its own on the page.
				</Text>
			</Slot>
		</Stack>
	)
}
