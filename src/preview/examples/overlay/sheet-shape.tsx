import { Button } from "themelia-ui/base/buttons"
import {
	Overlay, OverlayBody, OverlayDescription, OverlayHeader, OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { SheetContent } from "themelia-ui/base/sheet"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function SheetShape() {
	return (
		<Stack direction="horizontal" gap="lg" wrap align="center">
			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					Flush, size=&quot;sm&quot;
				</OverlayTrigger>
				<SheetContent side="inline-end" size="sm">
					<OverlayHeader>
						<OverlayTitle>Flush</OverlayTitle>
						<OverlayDescription>Welded to the edge, square outer corners.</OverlayDescription>
					</OverlayHeader>
					<OverlayBody>
						<Text type="secondary">What a sheet has always been.</Text>
					</OverlayBody>
				</SheetContent>
			</Overlay>

			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					Inset
				</OverlayTrigger>
				<SheetContent side="inline-end" size="28rem" inset>
					<OverlayHeader>
						<OverlayTitle>Corner-anchored</OverlayTitle>
						<OverlayDescription>
							Detached by one offset on all three sides, so the page shows past it.
						</OverlayDescription>
					</OverlayHeader>
					<OverlayBody>
						<Text type="secondary">
							The main view is still there — that is the point of the shape.
						</Text>
					</OverlayBody>
				</SheetContent>
			</Overlay>

			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					Inset from block-end
				</OverlayTrigger>
				<SheetContent side="block-end" size="60%" length="70%" inset="1.5rem">
					<OverlayHeader>
						<OverlayTitle>From the bottom</OverlayTitle>
						<OverlayDescription>
							size caps the height here and length sets the width — the two swap axes
							with the side.
						</OverlayDescription>
					</OverlayHeader>
					<OverlayBody>
						<Text type="secondary">
							A bottom sheet sizes to its content, so <code>size</code> is a ceiling rather
							than a height — that is what keeps a short one from being a tall empty box.
						</Text>
					</OverlayBody>
				</SheetContent>
			</Overlay>
		</Stack>
	)
}
