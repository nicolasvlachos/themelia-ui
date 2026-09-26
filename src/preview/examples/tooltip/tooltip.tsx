import { InfoIcon } from "lucide-react"

import { Button, TooltipButton } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Tooltip, TooltipContent, TooltipTrigger } from "themelia-ui/base/tooltip"

export default function TooltipExample() {
	return (
		<Stack direction="horizontal" gap="lg" align="center" wrap>
			<Tooltip>
				<TooltipTrigger render={<Button buttonStyle="outline" tone="neutral" />}>
					Hover or focus
				</TooltipTrigger>
				<TooltipContent>Charged on the first of the month.</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger render={<Button buttonStyle="ghost" tone="neutral" iconOnly aria-label="About billing" />}>
					<InfoIcon />
				</TooltipTrigger>
				<TooltipContent>An icon-only control still needs a name of its own.</TooltipContent>
			</Tooltip>

			<TooltipButton tooltip="TooltipButton wires the two together" buttonStyle="outline" tone="neutral">
				TooltipButton
			</TooltipButton>
		</Stack>
	)
}
