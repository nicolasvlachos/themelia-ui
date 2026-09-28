import { InfoIcon, SlidersHorizontalIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Checkbox } from "themelia-ui/base/choice-inputs"
import {
	Popover, PopoverContent, PopoverDescription, PopoverFooter, PopoverHeader, PopoverTitle,
	PopoverTrigger,
} from "themelia-ui/base/popover"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function PopoverExample() {
	return (
		<Stack direction="horizontal" wrap>
			<Popover>
				<PopoverTrigger render={<Button tone="neutral" appearance="outline" />}>
					<SlidersHorizontalIcon aria-hidden="true" />
					Filters
				</PopoverTrigger>
				<PopoverContent>
					<PopoverHeader>
						<PopoverTitle>Filters</PopoverTitle>
						<PopoverDescription>Narrow the list to what you are looking for.</PopoverDescription>
					</PopoverHeader>
					<Stack gap="sm">
						<Checkbox label="Unfulfilled" defaultChecked />
						<Checkbox label="Refunded" />
						<Checkbox label="On hold" />
					</Stack>
					<PopoverFooter>
						<Button tone="neutral" appearance="ghost">
							Reset
						</Button>
						<Button>Apply</Button>
					</PopoverFooter>
				</PopoverContent>
			</Popover>

			<Popover>
				<PopoverTrigger render={<Button tone="neutral" appearance="ghost" iconOnly aria-label="About this figure" />}>
					<InfoIcon aria-hidden="true" />
				</PopoverTrigger>
				<PopoverContent width="18rem">
					<Text size="xs" type="secondary">
						Blended margin is computed after carrier surcharges and before tax. A panel is
						the right home for a sentence like this — a tooltip would vanish before it
						could be read.
					</Text>
				</PopoverContent>
			</Popover>
		</Stack>
	)
}
