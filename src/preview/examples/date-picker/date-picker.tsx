import { useMemo, useState } from "react"

import { DatePicker, createRangePresets, type DateRangeValue } from "themelia-ui/base/date-pickers"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { useDatesConfig } from "themelia-ui/ui-provider"


export default function DatePickerExample() {
	/* A fixed day, so the example reads the same on every visit. */
	const [day, setDay] = useState<Date | undefined>(new Date("2026-03-12T00:00:00"))
	const [range, setRange] = useState<DateRangeValue>({})
	const [days, setDays] = useState<Date[]>([])
	/* The presets agree with the calendar's week because both read the provider's. */
	const { weekStartsOn } = useDatesConfig()
	const presets = useMemo(() => createRangePresets({ weekStartsOn }), [weekStartsOn])

	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Due date">
				<DatePicker value={day} onValueChange={(next) => setDay(next as Date)} clearable />
			</FormField>
			<FormField label="Reporting period" helperText="Two months side by side, with shortcuts down the side.">
				<DatePicker
					mode="range"
					value={range}
					onValueChange={(next) => setRange(next as DateRangeValue)}
					presets={presets}
					placeholder="Choose a range"
				/>
			</FormField>
			<FormField label="Blackout dates" helperText="Multiple: beyond two, the trigger shows a count.">
				<DatePicker
					mode="multiple"
					value={days}
					onValueChange={(next) => setDays(next as Date[])}
					placeholder="Choose dates"
				/>
			</FormField>
			<FormField label="Invalid" error="Choose a date.">
				<DatePicker invalid placeholder="Choose a date" />
			</FormField>
		</Stack>
	)
}
