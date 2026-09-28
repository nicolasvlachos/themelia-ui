import { useId } from "react"

import { Button } from "themelia-ui/base/buttons"
import {
	Overlay, OverlayBody, OverlayClose, OverlayContent, OverlayDescription, OverlayFooter,
	OverlayHeader, OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { Text } from "themelia-ui/base/typography"

/** One demo surface, so each example differs only by the settings it is showing. */
export function Demo({
	label,
	...content
}: { label: string } & React.ComponentProps<typeof OverlayContent>) {
	const id = useId()
	return (
		<Overlay>
			<OverlayTrigger render={<Button tone="neutral" appearance="outline" />}>
				{label}
			</OverlayTrigger>
			<OverlayContent aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} {...content}>
				<OverlayHeader>
					<OverlayTitle id={`${id}-title`}>{label}</OverlayTitle>
					<OverlayDescription id={`${id}-description`}>
						The same surface every time. Only placement, size, modality and dismissal differ.
					</OverlayDescription>
				</OverlayHeader>
				<OverlayBody>
					<Text size="xs" type="secondary">
						Built on the native &lt;dialog&gt;, so the browser supplies the top layer, the
						backdrop, the focus trap, Escape, the inert background and focus restore. None of
						that is re-implemented here, which is why there is one surface rather than four.
					</Text>
				</OverlayBody>
				<OverlayFooter>
					<OverlayClose render={<Button tone="neutral" appearance="outline" />}>
						Close
					</OverlayClose>
				</OverlayFooter>
			</OverlayContent>
		</Overlay>
	)
}
