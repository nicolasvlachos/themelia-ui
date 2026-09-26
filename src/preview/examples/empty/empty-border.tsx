import { InboxIcon } from "lucide-react"

import { Empty } from "themelia-ui/base/feedback"
import { Stack } from "themelia-ui/base/structure"

export default function EmptyBorder() {
	return (
		<Stack gap="xl">
			<Empty padding="sm" border media={<InboxIcon />} mediaVariant="icon" title="padding=&quot;sm&quot;" description="A side panel, a table cell, a card body." />
			<Empty padding="lg" media={<InboxIcon />} mediaVariant="icon" title="padding=&quot;lg&quot;" description="A whole page, with no border." />
		</Stack>
	)
}
