import { FileTextIcon } from "lucide-react"

import { PageHeading } from "themelia-ui/base/navigation"
import { Text } from "themelia-ui/base/typography"

export default function PageHeadingSlots() {
	return (
		<div style={{ width: "100%" }}>
			<PageHeading
				level={2}
				titlePrefix={<FileTextIcon aria-hidden />}
				title="Invoice #4417"
				titleSuffix={
					<Text size="xs" type="secondary">
						v3
					</Text>
				}
				badges={[{ label: "Paid", tone: "success" }]}
				description="Northwind Traders — the description starts at the title's edge, not the glyph's."
				afterDescription={
					<Text size="xs" type="secondary">
						Updated 3 days ago by Jane McDonald
					</Text>
				}
			/>
		</div>
	)
}
