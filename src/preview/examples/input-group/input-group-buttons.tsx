import { ArrowRightIcon } from "lucide-react"

import {
	InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput,
} from "themelia-ui/base/input-group"
import { Stack } from "themelia-ui/base/structure"

export default function InputGroupButtons() {
	return (
		<Stack style={{ maxWidth: "26rem" }}>
			<InputGroup>
				<InputGroupInput placeholder="A labelled button" aria-label="Coupon code" />
				<InputGroupAddon align="inline-end">
					<InputGroupButton>Apply</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
			<InputGroup>
				<InputGroupInput placeholder="An icon-only button" aria-label="Search" />
				<InputGroupAddon align="inline-end">
					<InputGroupButton iconOnly aria-label="Go">
						<ArrowRightIcon aria-hidden="true" />
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
		</Stack>
	)
}
