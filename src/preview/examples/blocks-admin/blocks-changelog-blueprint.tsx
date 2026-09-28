import { RocketIcon, WrenchIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { Stack } from "themelia-ui/base/structure"
import { Timeline, type TimelineItem } from "themelia-ui/base/timeline"
import { MonoValue } from "themelia-ui/primitives"

const RELEASES: TimelineItem[] = [
	{
		id: "3.1.0",
		title: "Saved views",
		timestamp: <MonoValue size="xs" type="secondary">v3.1.0</MonoValue>,
		icon: RocketIcon,
		status: "success",
		description: "Filters and columns can be saved and shared with the team.",
		children: (
			<Stack direction="horizontal" gap="sm">
				<Badge tone="success">Added</Badge>
				<Badge tone="neutral">Tables</Badge>
			</Stack>
		),
	},
	{
		id: "3.0.2",
		title: "Faster exports",
		timestamp: <MonoValue size="xs" type="secondary">v3.0.2</MonoValue>,
		icon: WrenchIcon,
		status: "neutral",
		description: "Large exports stream instead of waiting for the whole file.",
	},
]

export default function ChangelogBlueprint() {
	return (
		<Timeline items={RELEASES} />
	)
}
