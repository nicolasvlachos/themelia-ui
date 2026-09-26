import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SliderPage() {
	return (
		<ComponentPage>
			<Example
				example="slider/slider"
				title="SliderField"
				description="One number in a range. Emits both a bare value and a native-shaped change event, because a form library registers a field by handing it an onChange and reading event.target.value."
			/>

			<Example
				example="slider/slider-sizes"
				title="Sizes"
				description="One of the few surviving size props in the kit, and it survives for a reason: a slider is dragged. A thumb sized for a settings row is a poor target on a touch screen or in a media control, and one sized for those dominates a form."
			/>

			<Example
				example="slider/slider-orientation"
				title="Vertical, and a range"
				description="A vertical track takes its height from `--slider-vertical-min-h` rather than from its content, because a slider has none. Two values make it a range: the same field, one more number in the array."
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
