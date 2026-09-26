import { useState } from "react"

import { TimePicker, type TimeValue } from "themelia-ui/base/date-pickers"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { DateTimeInput } from "themelia-ui/base/value-inputs"


export default function Time() {
	const [time, setTime] = useState<TimeValue>({ hours: 9, minutes: 30 })
	/* A fixed instant, not `new Date()`, for stable visual baselines. */
	const [instant, setInstant] = useState<string | undefined>("2026-03-12T09:30:00.000Z")

	return (
		<Stack gap="xl" style={{ maxWidth: "34rem", width: "100%" }}>
			<FormField label="Start time">
				<TimePicker value={time} onValueChange={setTime} minuteStep={15} />
			</FormField>
			<FormField label="Publish at" helperText="One ISO value; paging the calendar keeps the hour already set.">
				<DateTimeInput value={instant} onValueChange={setInstant} />
			</FormField>
		</Stack>
	)
}
