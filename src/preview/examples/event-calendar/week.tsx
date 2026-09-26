import { useState } from "react"

import { Text } from "themelia-ui/base/typography"
import { EventCalendar } from "themelia-ui/features/event-calendar"

import { CATEGORIES } from "./_shared"
import { EVENTS } from "./data"

export default function Week() {
	const [picked, setPicked] = useState<string | null>(null)

	return (
		<>
			<EventCalendar
				events={EVENTS}
				categories={CATEGORIES}
				defaultDate={new Date(2026, 8, 14)}
				viewMode="week"
				showLegend={false}
				minDate={new Date(2026, 8, 1)}
				maxDate={new Date(2026, 8, 30)}
				disabledDates={(date) => date.getDay() === 0}
				onEventClick={(event) => setPicked(event.title)}
			/>
			{!!picked && <Text size="sm" type="secondary">picked: {picked}</Text>}
		</>
	)
}
