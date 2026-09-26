import { useState } from "react"

import { Calendar, type DateRangeValue } from "themelia-ui/base/date-pickers"

export default function CalendarExample() {
	const [range, setRange] = useState<DateRangeValue>({})

	return (
		<div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", width: "fit-content" }}>
			<Calendar
				mode="range"
				value={range}
				onValueChange={(next) => setRange(next as DateRangeValue)}
				numberOfMonths={2}
			/>
		</div>
	)
}
