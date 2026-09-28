import { ContentBlock } from "themelia-ui/base/display"
import { DirectionProvider } from "themelia-ui/base/direction"
import { Slot } from "themelia-ui/base/slot"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function DirectionSlot() {
	return (
		<Stack>
			<DirectionProvider direction="rtl">
				<div dir="rtl">
					<ContentBlock surface="card" title="اتجاه من اليمين إلى اليسار">
						<Text size="xs" type="secondary">كل هامش وفجوة وحد هنا خاصية منطقية.</Text>
					</ContentBlock>
				</div>
			</DirectionProvider>
			<Text size="xs" type="secondary">
				Every inset, gap and border in the block above is a logical property, so <code>dir</code> on
				the region mirrors it without a stylesheet per direction. The provider tells the menus and
				popovers inside it the same thing.
			</Text>
			<Slot className={undefined}>
				<Text size="xs" type="secondary">
					Slot renders its child, merged. There is nothing of its own on the page.
				</Text>
			</Slot>
		</Stack>
	)
}
