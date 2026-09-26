import { Button } from "themelia-ui/base/buttons"
import {
	Overlay, OverlayContent, OverlayDescription, OverlayDismissArea, OverlayFooter,
	OverlayHeader, OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"

export default function DialogSurface() {
	return (
		<Stack direction="horizontal">
			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					Confirm
				</OverlayTrigger>
				<OverlayContent surface="bare" showCloseButton={false}>
					<OverlayHeader>
						<OverlayTitle>Publish this release?</OverlayTitle>
						<OverlayDescription>It becomes visible to every workspace member.</OverlayDescription>
					</OverlayHeader>
					<OverlayFooter>
						<OverlayDismissArea>
							<Button tone="neutral" buttonStyle="outline">Cancel</Button>
							<Button>Publish</Button>
						</OverlayDismissArea>
					</OverlayFooter>
				</OverlayContent>
			</Overlay>
		</Stack>
	)
}
