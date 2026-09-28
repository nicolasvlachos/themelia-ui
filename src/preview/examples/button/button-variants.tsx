import { LoaderButton, TextButton, TooltipButton } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function ButtonVariants() {
	return (
		<Stack direction="horizontal" wrap align="center">
			<Text size="xs" type="secondary">
				Changed your mind? <TextButton>Undo the import</TextButton>
			</Text>
			<LoaderButton
				tone="neutral"
				appearance="outline"
				onClick={() => new Promise((resolve) => setTimeout(resolve, 1200))}
			>
				Save and wait
			</LoaderButton>
			<TooltipButton tooltip="Archive this order" tone="neutral" appearance="outline">
				Archive
			</TooltipButton>
		</Stack>
	)
}
