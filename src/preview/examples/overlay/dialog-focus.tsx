import { useRef } from "react"

import { Button } from "themelia-ui/base/buttons"
import { FormField } from "themelia-ui/base/forms"
import {
	Overlay, OverlayBody, OverlayContent, OverlayDismissArea, OverlayFooter, OverlayHeader,
	OverlayTitle, OverlayTrigger,
} from "themelia-ui/base/overlay"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"

export default function DialogFocus() {
	const nameRef = useRef<HTMLInputElement>(null)

	return (
		<Stack direction="horizontal">
			<Overlay>
				<OverlayTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					New workspace
				</OverlayTrigger>
				<OverlayContent initialFocusRef={nameRef}>
					<OverlayHeader>
						<OverlayTitle>New workspace</OverlayTitle>
					</OverlayHeader>
					<OverlayBody>
						<Stack gap="md">
							<FormField label="Name">
								<Input ref={nameRef} placeholder="Acme design" />
							</FormField>
							<FormField label="Slug" hint="Used in URLs.">
								<Input placeholder="acme-design" />
							</FormField>
						</Stack>
					</OverlayBody>
					<OverlayFooter>
						<OverlayDismissArea>
							<Button tone="neutral" buttonStyle="outline">Cancel</Button>
							<Button>Create</Button>
						</OverlayDismissArea>
					</OverlayFooter>
				</OverlayContent>
			</Overlay>
		</Stack>
	)
}
