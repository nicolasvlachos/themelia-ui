import { useState } from "react"

import { Text } from "themelia-ui/base/typography"
import { EventCalendar } from "themelia-ui/features/event-calendar"

import { CATEGORIES } from "./_shared"
import { EVENTS, MONTH } from "./data"

export default function Agenda() {
	const [picked, setPicked] = useState<string | null>(null)

	return (
		<>
			<EventCalendar
				events={EVENTS}
				categories={CATEGORIES}
				defaultDate={MONTH}
				viewMode="agenda"
				showLegend={false}
				onEventClick={(event) => setPicked(event.title)}
			/>
			{!!picked && <Text size="sm" type="secondary">picked: {picked}</Text>}
		</>
	)
}
