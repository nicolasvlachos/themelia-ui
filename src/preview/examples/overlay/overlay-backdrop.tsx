import { Button } from "themelia-ui/base/buttons"
import { DialogContent } from "themelia-ui/base/dialog"
import {
	Overlay, OverlayDescription, OverlayHeader, OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"
import { UIProvider } from "themelia-ui/ui-provider"

export default function OverlayBackdrop() {
	return (
		<Stack direction="horizontal" wrap align="center">
			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" appearance="outline" />}>
					Default scrim
				</OverlayTrigger>
				<DialogContent>
					<OverlayHeader>
						<OverlayTitle>Default scrim</OverlayTitle>
						<OverlayDescription>A tint only — the page behind stays sharp.</OverlayDescription>
					</OverlayHeader>
				</DialogContent>
			</Overlay>

			<UIProvider config={{ overlay: { backdropBlur: 4 } }}>
				<Overlay>
					<OverlayTrigger render={<Button tone="neutral" appearance="outline" />}>
						Blurred scrim
					</OverlayTrigger>
					<DialogContent>
						<OverlayHeader>
							<OverlayTitle>Blurred scrim</OverlayTitle>
							<OverlayDescription>The same dialog under a provider that asks for a 4px blur.</OverlayDescription>
						</OverlayHeader>
					</DialogContent>
				</Overlay>
			</UIProvider>
		</Stack>
	)
}
