import { Button } from "themelia-ui/base/buttons"
import { DialogContent } from "themelia-ui/base/dialog"
import { FormField } from "themelia-ui/base/forms"
import {
	Overlay, OverlayBody, OverlayClose, OverlayDescription, OverlayFooter, OverlayHeader,
	OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { Input } from "themelia-ui/base/text-inputs"

export default function Dialog() {
	return (
		<Overlay>
			<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
				Open dialog
			</OverlayTrigger>
			<DialogContent>
				<OverlayHeader>
					<OverlayTitle>Rename project</OverlayTitle>
					<OverlayDescription>The new name shows everywhere the project is listed.</OverlayDescription>
				</OverlayHeader>
				<OverlayBody>
					<FormField label="Project name">
						<Input defaultValue="Spring launch" />
					</FormField>
				</OverlayBody>
				<OverlayFooter>
					<OverlayClose render={<Button tone="neutral" buttonStyle="outline" />}>
						Cancel
					</OverlayClose>
					<OverlayClose render={<Button />}>
						Save
					</OverlayClose>
				</OverlayFooter>
			</DialogContent>
		</Overlay>
	)
}
