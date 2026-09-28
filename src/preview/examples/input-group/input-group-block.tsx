import { StarIcon } from "lucide-react"

import {
	InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea,
} from "themelia-ui/base/input-group"
import { Stack } from "themelia-ui/base/structure"

export default function InputGroupBlock() {
	return (
		<Stack style={{ maxWidth: "26rem" }}>
			<InputGroup>
				<InputGroupAddon align="block-start">
					<InputGroupButton iconOnly aria-label="Favourite">
						<StarIcon aria-hidden="true" />
					</InputGroupButton>
					<InputGroupText>Internal note</InputGroupText>
				</InputGroupAddon>
				<InputGroupTextarea placeholder="Write a note" aria-label="Note" rows={3} />
				<InputGroupAddon align="block-end">
					<InputGroupText>Markdown supported</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</Stack>
	)
}
