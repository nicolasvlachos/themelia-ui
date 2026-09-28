import { useState } from "react"

import {
	MonthYearPicker,
	MultipleDatePicker,
	RangeDatePicker,
	SingleDatePicker,
	type DateRangeValue,
	type MonthYearValue,
} from "themelia-ui/base/date-pickers"
import { Stack } from "themelia-ui/base/structure"

export default function DatePickerModes() {
	/* A fixed day, so the example reads the same on every visit. */
	const [day, setDay] = useState<Date | undefined>(new Date("2026-03-12T00:00:00"))
	const [range, setRange] = useState<DateRangeValue>({})
	const [days, setDays] = useState<Date[]>([])
	const [month, setMonth] = useState<MonthYearValue | undefined>(undefined)

	return (
		<Stack direction="horizontal" wrap align="start">
			<SingleDatePicker value={day} onValueChange={setDay} />
			<RangeDatePicker value={range} onValueChange={setRange} />
			<MultipleDatePicker value={days} onValueChange={setDays} />
			<MonthYearPicker value={month} onValueChange={setMonth} />
		</Stack>
	)
}
