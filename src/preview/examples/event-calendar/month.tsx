import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Text } from "themelia-ui/base/typography"
import { EventCalendar, type CalendarViewMode } from "themelia-ui/features/event-calendar"

import { CATEGORIES } from "./_shared"
import { EVENTS, MONTH } from "./data"

export default function Month() {
	const [view, setView] = useState<CalendarViewMode>("month")
	const [picked, setPicked] = useState<string | null>(null)
	const [visible, setVisible] = useState<string[]>([])

	return (
		<>
			<EventCalendar
				events={EVENTS}
				categories={CATEGORIES}
				defaultDate={MONTH}
				viewMode={view}
				onViewModeChange={setView}
				enableCategoryFilter
				visibleCategories={visible}
				onVisibleCategoriesChange={setVisible}
				maxEventsPerDay={2}
				actions={[{ id: "new", label: "New booking", icon: PlusIcon, onClick: () => setPicked("new booking") }]}
				onEventClick={(event) => setPicked(event.title)}
				onDayClick={(date, events) =>
					setPicked(`${date.toDateString()} — ${events.length} event${events.length === 1 ? "" : "s"}`)
				}
			/>
			{!!picked && <Text size="sm" type="secondary">picked: {picked}</Text>}
		</>
	)
}
