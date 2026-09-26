import { Button } from "themelia-ui/base/buttons"
import { FormField } from "themelia-ui/base/forms"
import {
	Overlay, OverlayBody, OverlayClose, OverlayDescription, OverlayFooter, OverlayHeader,
	OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { SheetContent } from "themelia-ui/base/sheet"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"

export default function Sheet() {
	return (
		<Stack direction="horizontal">
			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					Open sheet
				</OverlayTrigger>
				<SheetContent side="inline-end">
					<OverlayHeader>
						<OverlayTitle>Edit booking</OverlayTitle>
						<OverlayDescription>Native top layer — the list behind stays in view and cannot clip it.</OverlayDescription>
					</OverlayHeader>
					<OverlayBody>
						<Stack gap="md">
							<FormField label="Venue">
								<Input defaultValue="Marlow Hall" />
							</FormField>
							<FormField label="Guests">
								<Input defaultValue="120" inputMode="numeric" />
							</FormField>
						</Stack>
					</OverlayBody>
					<OverlayFooter>
						<OverlayClose render={<Button tone="neutral" buttonStyle="outline" />}>
							Cancel
						</OverlayClose>
						<OverlayClose render={<Button />}>
							Save
						</OverlayClose>
					</OverlayFooter>
				</SheetContent>
			</Overlay>
		</Stack>
	)
}
