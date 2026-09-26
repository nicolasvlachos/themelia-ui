import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TimePickerPage() {
	return (
		<ComponentPage
			title="Time picker"
			summary="A time of day, and the combined date-and-time field built from it."
			importPath="@/components/base/date-pickers"
			exports={["TimePicker", "DateTimeInput"]}
		>
			<Example
				example="time-picker/time"
				title="TimePicker and DateTimeInput"
				description="Segments rather than input type=time: the native control's appearance is not addressable, it differs on every platform, and its 12/24-hour presentation follows the OS rather than the product."
			/>

			<Example id="time-picker-api" title="API">
				<PropTable owner="TimePicker"
					rows={[
						{ name: "value / onValueChange", type: "TimeValue", description: "{ hours, minutes } — not a Date, because a time of day has no date." },
						{ name: "minuteStep", type: "number", description: "Minute increment." },
						{ name: "DateTimeInput", type: "component", description: "A date and a time in one field, storing an ISO string." },
						{ name: "withSeconds", type: "boolean", default: "false", description: "Adds a third segment. Most times of day do not have one, and an empty seconds box invites a value nobody wanted." },
						{ name: "invalid", type: "boolean", description: "The error surface. The message stays on the FormField." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
