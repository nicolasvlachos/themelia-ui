import { Button } from "themelia-ui/base/buttons"
import { Popover, PopoverContent, PopoverTrigger } from "themelia-ui/base/popover"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function PopoverPlacement() {
	return (
		<Stack direction="horizontal" gap="lg" wrap>
			{(["top", "right", "bottom", "left"] as const).map((side) => (
				<Popover key={side}>
					<PopoverTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
						{side}
					</PopoverTrigger>
					<PopoverContent side={side}>
						<Text size="xs">side=&quot;{side}&quot;</Text>
					</PopoverContent>
				</Popover>
			))}
			<Popover>
				<PopoverTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
					width=&quot;trigger&quot;
				</PopoverTrigger>
				<PopoverContent width="trigger">
					<Text size="xs">Matches the control it opened from.</Text>
				</PopoverContent>
			</Popover>
		</Stack>
	)
}
