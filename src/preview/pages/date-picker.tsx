import { useMemo, useState } from "react"

import {
	DatePicker,
	MonthYearPicker,
	MultipleDatePicker,
	RangeDatePicker,
	SingleDatePicker,
	createRangePresets,
	type DateRangeValue,
} from "@/components/base/date-pickers"
import { FormField } from "@/components/base/forms"
import { useDatesConfig } from "@/lib/ui-provider"
import type { MonthYearValue } from "@/components/base/date-pickers"
import { Stack } from "@/components/base/structure"
import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function DatePickerPage() {
	/* A fixed day, so the example reads the same on every visit. See time-picker.tsx. */
	const [day, setDay] = useState<Date | undefined>(new Date("2026-03-12T00:00:00"))
	const [range, setRange] = useState<DateRangeValue>({})
	const [days, setDays] = useState<Date[]>([])
	const [month, setMonth] = useState<MonthYearValue | undefined>(undefined)
	/* The presets agree with the calendar's week because both read the provider's. */
	const { weekStartsOn } = useDatesConfig()
	const presets = useMemo(() => createRangePresets({ weekStartsOn }), [weekStartsOn])

	return (
		<ComponentPage
			title="Date picker"
			summary="A day, a range, or several days, behind a field that wears the same surface as every other control."
			importPath="@/components/base/date-pickers"
			exports={["DatePicker", "createRangePresets", "SingleDatePicker", "RangeDatePicker", "MultipleDatePicker", "MonthYearPicker", "DatePickerHeader", "DatePickerFooter"
			]}
		>
			<Example
				id="date-picker"
				title="DatePicker"
				description="A Popover, not a modal: a date field sits inside a form, and trapping focus to pick a day makes tabbing through the rest of it impossible."
				stacked
				code={`<DatePicker value={day} onValueChange={setDay} clearable />
const { weekStartsOn } = useDatesConfig()
const presets = useMemo(() => createRangePresets({ weekStartsOn }), [weekStartsOn])
<DatePicker mode="range" value={range} onValueChange={setRange} presets={presets} />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
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
			</Example>

			<Example
				id="date-picker-modes"
				title="One picker, four fixed modes"
				description="Each preset is DatePicker with its mode pinned, and the point is the TYPE: a single picker hands back a Date, a range hands back { from, to }, a multiple hands back an array. The generic component has to widen its callback to cover all three, which pushes a cast into every call site — the presets take it back."
				stacked
				code={`<SingleDatePicker value={day} onValueChange={setDay} />
<RangeDatePicker value={range} onValueChange={setRange} />
<MonthYearPicker value={month} onValueChange={setMonth} />`}
			>
				<Stack direction="horizontal" gap="lg" wrap align="start">
					<SingleDatePicker value={day} onValueChange={setDay} />
					<RangeDatePicker value={range} onValueChange={setRange} />
					<MultipleDatePicker value={days} onValueChange={setDays} />
					<MonthYearPicker value={month} onValueChange={setMonth} />
				</Stack>
			</Example>

			<Example id="date-picker-api" title="API">
				<PropTable owner="DatePicker"
					rows={[
						{ name: "mode", type: '"single" | "range" | "multiple"', default: '"single"', description: "What a click selects." },
						{ name: "value / onValueChange", type: "Date | DateRangeValue | Date[]", description: "Shape follows mode." },
						{ name: "presets", type: "RangePreset[]", description: "The rail beside a range calendar. createRangePresets({ strings, weekStartsOn }) builds the built-in set in your language and week." },
						{ name: "numberOfMonths", type: "number", default: "1", description: "How many months are shown side by side. The header becomes a range when more than one." },
						{ name: "clearable / strings", type: "boolean / Partial<DatePickerStrings>", description: "A real clear button beside the calendar glyph, named through the strings — not an icon with a click handler. The same object reaches the calendar inside the popup, so one override names the month controls too." },
						{ name: "displayFormat", type: "string", default: '"d MMM yyyy"', description: "A date-fns pattern for the trigger. The popup is unaffected." },
						{ name: "closeOnSelect", type: "boolean", description: "Defaults to true for a single date and false for a range, because a range is not chosen until both ends are." },
						{ name: "invalid", type: "boolean", description: "The error surface. The message stays on the FormField." },
						{ name: "contentClassName", type: "string", description: "Styles the popup surface. The trigger's own className stays on the trigger." },
						{ name: "SingleDatePicker / RangeDatePicker / MultipleDatePicker", type: "component", description: "DatePicker with its mode fixed, so the value type is fixed with it: a Date, a { from, to }, or an array. The generic picker has to widen its callback to cover all three, which pushes a cast into every call site." },
						{ name: "MonthYearPicker", type: "component", description: "Month and year without a day grid, for a period rather than a date — a billing month, a report window." },
						{ name: "DatePickerHeader / DatePickerFooter", type: "component", description: "The regions inside the popup: the month navigation, and the row that holds presets or a clear. Exported so a caller can supply their own without rebuilding the calendar." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
