import { CircleDotIcon } from "lucide-react"

import { Timeline, type TimelineItem } from "themelia-ui/base/timeline"

const STATUSES: TimelineItem[] = [
	{ id: "completed", title: "completed", description: "It happened, and it went as intended.", status: "completed" },
	{ id: "current", title: "current", description: "Where the thing is right now.", icon: CircleDotIcon, status: "current" },
	{ id: "warning", title: "warning", description: "It happened, but it needs a look.", status: "warning" },
	{ id: "destructive", title: "destructive", description: "It failed. Never \"error\" — the kit has one word for this.", status: "destructive" },
	{ id: "pending", title: "pending", description: "It has not happened yet, so the dot is unfilled.", status: "pending" },
	{ id: "neutral", title: "neutral", description: "It happened and carries no judgement. The default.", status: "neutral" },
]

export default function TimelineStatuses() {
	return (
		<Timeline items={STATUSES} />
	)
}
