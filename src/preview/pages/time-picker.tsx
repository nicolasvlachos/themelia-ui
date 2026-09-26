import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TimePickerPage() {
	return (
		<ComponentPage>
			<Example
				example="time-picker/time"
				title="TimePicker and DateTimeInput"
				description="Segments rather than input type=time: the native control's appearance is not addressable, it differs on every platform, and its 12/24-hour presentation follows the OS rather than the product."
			/>

			<Example id="time-picker-api" title="API">
				<PropTable owner="TimePicker" />
				<PropTable symbols={["DateTimeInput"]} />
			</Example>
		</ComponentPage>
	)
}
