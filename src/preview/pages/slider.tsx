import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SliderPage() {
	return (
		<ComponentPage>
			<Example
				example="slider/slider"
				title="SliderField"
				description="One number in a range. Emits both a bare value and a native-shaped change event, because a form library registers a field by handing it an onChange and reading event.target.value. A slider is dragged, so under a finger (a coarse pointer) its track and thumb grow into a larger target; there is no size prop."
			/>

			<Example
				example="slider/slider-orientation"
				title="Vertical, and a range"
				description="A vertical track is at least 10rem long, because a slider has no content to size it; give its container a height for a longer one. Two values make it a range: the same field, one more number in the array."
			/>

			<Example
				example="slider/slider-bare"
				title="Slider"
				description="The control without SliderField&rsquo;s label, value read-out and help text — for a slider in a toolbar or a popover, where the surface around it already says what it adjusts. Everything else is the same component, so the two cannot drift apart."
			/>

			<Example id="slider-api" title="API">
				<PropTable owner="SliderField" />
				<PropTable symbols={["Slider"]} />
			</Example>
		</ComponentPage>
	)
}
