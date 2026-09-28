import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import {
	Overlay, OverlayBody, OverlayClose, OverlayContent, OverlayDescription, OverlayFooter,
	OverlayHeader, OverlayTitle,
} from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function Modality() {
	const [nonModal, setNonModal] = useState(false)

	return (
		<Stack direction="horizontal" wrap align="center">
			<Button tone="neutral" appearance="outline" onClick={() => setNonModal(true)}>
				Open non-modal
			</Button>
			<Text type="secondary" size="sm">
				The page stays scrollable and interactive while it is open.
			</Text>
			<Overlay open={nonModal} onOpenChange={setNonModal}>
				<OverlayContent placement="inline-end" modality="non-modal">
					<OverlayHeader>
						<OverlayTitle>Inspector</OverlayTitle>
						<OverlayDescription>No scrim, no scroll lock.</OverlayDescription>
					</OverlayHeader>
					<OverlayBody>
						<Text type="secondary">Scroll the page behind; this stays where it is.</Text>
					</OverlayBody>
					<OverlayFooter>
						<OverlayClose render={<Button tone="neutral" appearance="outline" />}>
							Close
						</OverlayClose>
					</OverlayFooter>
				</OverlayContent>
			</Overlay>
		</Stack>
	)
}
