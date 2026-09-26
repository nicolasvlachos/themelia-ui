import { TruckIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { ContentBlock, Separator } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function ContentBlockHeader() {
	return (
		<Stack gap="lg">
			<ContentBlock
				surface="card"
				icon={<TruckIcon aria-hidden="true" />}
				title="Shipment"
				titleSuffix={<Badge tone="info">In transit</Badge>}
				headerEnd={
					<Button tone="neutral" buttonStyle="ghost">
						Track
					</Button>
				}
				description="A description is its own row, so a long one wraps under the whole header rather than squeezing the title."
			>
				<Separator />
				<Text size="xs" type="secondary">
					Children follow, spaced by the block's own gap.
				</Text>
			</ContentBlock>
		</Stack>
	)
}
