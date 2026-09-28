import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function CollapsibleExample() {
	return (
		<Collapsible>
			<CollapsibleTrigger>
				<Text tag="span" size="sm" weight="medium">
					Advanced options
				</Text>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Stack gap="sm" style={{ paddingTop: "var(--gap-sm)" }}>
					<Text type="secondary" size="sm">
						Content that expands to its natural height.
					</Text>
					<Text type="secondary" size="sm">
						However many lines it happens to be.
					</Text>
				</Stack>
			</CollapsibleContent>
		</Collapsible>
	)
}
