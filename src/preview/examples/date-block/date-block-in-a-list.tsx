import { Badge } from "themelia-ui/base/badge"
import { DateBlock } from "themelia-ui/base/display"
import {
	Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle,
} from "themelia-ui/base/item"
import { Stack } from "themelia-ui/base/structure"

const EVENTS = [
	{ id: "kickoff", date: "2026-09-28", title: "Quarterly kickoff", meta: "09:00 – 10:30 · Main hall", tone: "info" as const, badge: "All hands" },
	{ id: "review", date: "2026-10-02", title: "Design review", meta: "14:00 – 15:00 · Room 4", tone: "neutral" as const, badge: "Team" },
	{ id: "release", date: "2026-10-09", title: "2.0 release", meta: "All day", tone: "success" as const, badge: "Milestone" },
]

export default function DateBlockInAList() {
	return (
		<Stack maxWidth="36rem" gap="none">
			<ItemGroup ruled>
				{EVENTS.map((event) => (
					<Item key={event.id}>
						<ItemMedia>
							<DateBlock date={event.date} />
						</ItemMedia>
						<ItemContent>
							<ItemTitle>{event.title}</ItemTitle>
							<ItemDescription>{event.meta}</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Badge tone={event.tone}>{event.badge}</Badge>
						</ItemActions>
					</Item>
				))}
			</ItemGroup>
		</Stack>
	)
}
