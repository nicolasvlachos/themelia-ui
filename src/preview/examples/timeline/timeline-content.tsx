import { UndoIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { Stack } from "themelia-ui/base/structure"
import { Timeline, type TimelineItem } from "themelia-ui/base/timeline"

const WITH_CONTENT: TimelineItem[] = [
	{
		id: "refund",
		title: "Refund issued",
		timestamp: "17 Aug, 14:20",
		icon: UndoIcon,
		status: "warning",
		children: (
			<Stack direction="horizontal" gap="sm">
				<Badge tone="warning">Partial</Badge>
				<Badge tone="neutral">€ 42.00</Badge>
			</Stack>
		),
	},
	{
		id: "note",
		title: "Note added",
		timestamp: "17 Aug, 14:26",
		status: "neutral",
		// A sentence is a description; `children` is for blocks, and pays a block's gap.
		description: "Customer reported one damaged item on arrival.",
	},
]

export default function TimelineContent() {
	return (
		<Timeline items={WITH_CONTENT} />
	)
}
