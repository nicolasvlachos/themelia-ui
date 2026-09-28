import { Button } from "themelia-ui/base/buttons"
import {
	Overlay, OverlayBody, OverlayDescription, OverlayHeader, OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { SheetContent } from "themelia-ui/base/sheet"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { UIProvider } from "themelia-ui/ui-provider"

export default function SheetProvider() {
	return (
		<Stack direction="horizontal" wrap align="center">
			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" appearance="outline" />}>
					Kit default
				</OverlayTrigger>
				<SheetContent>
					<OverlayHeader>
						<OverlayTitle>Kit default</OverlayTitle>
						<OverlayDescription>Flush, three-quarters wide.</OverlayDescription>
					</OverlayHeader>
					<OverlayBody>
						<Text type="secondary">No shape props at the call site.</Text>
					</OverlayBody>
				</SheetContent>
			</Overlay>

			<UIProvider config={{ defaults: { sheet: { size: "26rem", inset: true } } }}>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" appearance="outline" />}>
						Under a provider
					</OverlayTrigger>
					<SheetContent>
						<OverlayHeader>
							<OverlayTitle>Under a provider</OverlayTitle>
							<OverlayDescription>The same JSX, a different shape — one offset, spent equally on all three sides.</OverlayDescription>
						</OverlayHeader>
						<OverlayBody>
							<Text type="secondary">Decided once for the whole product.</Text>
						</OverlayBody>
					</SheetContent>
				</Overlay>
			</UIProvider>
		</Stack>
	)
}
