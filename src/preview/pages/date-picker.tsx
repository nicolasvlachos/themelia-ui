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
				<PropTable owner="DatePicker" />
				<PropTable
					symbols={[
						"SingleDatePicker",
						"RangeDatePicker",
						"MultipleDatePicker",
						"MonthYearPicker",
						"DatePickerHeader",
						"DatePickerFooter",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
