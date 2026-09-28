import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import {
	Overlay, OverlayClose, OverlayContent, OverlayDescription, OverlayFooter, OverlayHeader,
	OverlayTitle,
} from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function OverlayControlled() {
	const [open, setOpen] = useState(false)

	return (
		<Stack direction="horizontal" gap="sm" align="center">
			<Button tone="neutral" appearance="outline" onClick={() => setOpen(true)}>
				Open from outside
			</Button>
			<Text size="xs" type="secondary">
				open: {String(open)}
			</Text>
			<Overlay open={open} onOpenChange={setOpen}>
				<OverlayContent>
					<OverlayHeader>
						<OverlayTitle>Controlled</OverlayTitle>
						<OverlayDescription>The caller owns the open state.</OverlayDescription>
					</OverlayHeader>
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
