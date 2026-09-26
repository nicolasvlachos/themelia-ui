import { Button } from "themelia-ui/base/buttons"
import {
	Overlay, OverlayBody, OverlayContent, OverlayDescription, OverlayDismissArea, OverlayFooter,
	OverlayHeader, OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function OverlayStructure() {
	return (
		<Stack direction="horizontal">
			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					Open a long surface
				</OverlayTrigger>
				<OverlayContent>
					<OverlayHeader>
						<OverlayTitle>Structured anatomy</OverlayTitle>
						<OverlayDescription>Header and footer are fixed; the body scrolls.</OverlayDescription>
					</OverlayHeader>
					<OverlayBody>
						{Array.from({ length: 30 }, (_, i) => (
							<Text key={i}>Body line {i + 1}.</Text>
						))}
					</OverlayBody>
					<OverlayFooter>
						<OverlayDismissArea>
							<Button tone="neutral" buttonStyle="outline">Cancel</Button>
							<Button>Save</Button>
						</OverlayDismissArea>
					</OverlayFooter>
				</OverlayContent>
			</Overlay>
		</Stack>
	)
}
