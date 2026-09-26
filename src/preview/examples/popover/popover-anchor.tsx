import { CalendarIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "themelia-ui/base/popover"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function PopoverAnchorExample() {
	return (
		<Popover>
			<Stack direction="horizontal" gap="2xl" align="center">
				<PopoverAnchor>
					<Text size="xs" type="secondary">
						<CalendarIcon aria-hidden="true" /> 14–28 August
					</Text>
				</PopoverAnchor>
				<PopoverTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					Change the range
				</PopoverTrigger>
			</Stack>
			<PopoverContent>
				<Text size="xs">Anchored to the date, opened by the button.</Text>
			</PopoverContent>
		</Popover>
	)
}
