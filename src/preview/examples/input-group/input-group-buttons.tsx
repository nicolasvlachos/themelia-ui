import { ArrowRightIcon } from "lucide-react"

import {
	InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput,
} from "themelia-ui/base/input-group"
import { Stack } from "themelia-ui/base/structure"

export default function InputGroupButtons() {
	return (
		<Stack gap="lg" style={{ maxWidth: "26rem" }}>
			{(["xs", "sm"] as const).map((size) => (
				<InputGroup key={size}>
					<InputGroupInput placeholder={`size="${size}"`} aria-label={size} />
					<InputGroupAddon align="inline-end">
						<InputGroupButton size={size}>Apply</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			))}
			{(["icon-xs", "icon-sm"] as const).map((size) => (
				<InputGroup key={size}>
					<InputGroupInput placeholder={`size="${size}"`} aria-label={size} />
					<InputGroupAddon align="inline-end">
						<InputGroupButton size={size} aria-label="Go">
							<ArrowRightIcon aria-hidden="true" />
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			))}
		</Stack>
	)
}
