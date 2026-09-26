import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function DatePickerPage() {
	return (
		<ComponentPage>
			<Example
				example="date-picker/date-picker"
				title="DatePicker"
				description="A Popover, not a modal: a date field sits inside a form, and trapping focus to pick a day makes tabbing through the rest of it impossible."
			/>

			<Example
				example="date-picker/date-picker-modes"
				title="One picker, four fixed modes"
				description="Each preset is DatePicker with its mode pinned, and the point is the TYPE: a single picker hands back a Date, a range hands back { from, to }, a multiple hands back an array. The generic component has to widen its callback to cover all three, which pushes a cast into every call site — the presets take it back."
			/>

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
