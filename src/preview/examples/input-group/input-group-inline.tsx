import { ArrowRightIcon, MailIcon, SearchIcon } from "lucide-react"

import {
	InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText,
} from "themelia-ui/base/input-group"
import { Stack } from "themelia-ui/base/structure"

export default function InputGroupInline() {
	return (
		<Stack style={{ maxWidth: "26rem" }}>
			<InputGroup>
				<InputGroupAddon>
					<SearchIcon aria-hidden="true" />
				</InputGroupAddon>
				<InputGroupInput placeholder="Search orders" aria-label="Search orders" />
			</InputGroup>

			<InputGroup>
				<InputGroupAddon>
					<MailIcon aria-hidden="true" />
				</InputGroupAddon>
				<InputGroupInput placeholder="name@example.com" aria-label="Email" />
				<InputGroupAddon align="inline-end">
					<InputGroupText>@acme.test</InputGroupText>
				</InputGroupAddon>
			</InputGroup>

			<InputGroup>
				<InputGroupInput placeholder="Add a label" aria-label="Label" />
				<InputGroupAddon align="inline-end">
					<InputGroupButton iconOnly aria-label="Add">
						<ArrowRightIcon aria-hidden="true" />
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
		</Stack>
	)
}
