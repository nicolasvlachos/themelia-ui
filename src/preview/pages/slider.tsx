import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { Stack } from "@/components/base/structure"
import {
	Slider,
	SliderField,
} from "@/components/base/value-inputs"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SliderPage() {
	const [range, setRange] = useState<number[]>([20, 70])
	const [volume, setVolume] = useState(40)

	return (
		<ComponentPage
			title="Slider"
			summary="A value picked along a track, for a quantity the reader adjusts by feel rather than types."
			importPath="@/components/base/value-inputs"
			exports={["SliderField", "Slider"
			]}
		>
			<Example
				id="slider"
				title="SliderField"
				description="One number in a range. Emits both a bare value and a native-shaped change event, because a form library registers a field by handing it an onChange and reading event.target.value."
				stacked
				code={`<SliderField value={volume} onValueChange={setVolume} showValue unit="%" />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="Volume">
						<SliderField value={volume} onValueChange={setVolume} showValue unit="%" />
					</FormField>
					<FormField label="Steps of 10" helperText="onValueCommitted fires once on release, not on every step.">
						<SliderField defaultValue={50} step={10} showValue />
					</FormField>
					<FormField label="Invalid" error="Pick a value above 60.">
						<SliderField defaultValue={20} invalid showValue />
					</FormField>
					<FormField label="Disabled">
						<SliderField defaultValue={30} disabled showValue />
					</FormField>
				</Stack>
			</Example>

			<Example
				id="slider-sizes"
				title="Sizes"
				description="One of the few surviving size props in the kit, and it survives for a reason: a slider is dragged. A thumb sized for a settings row is a poor target on a touch screen or in a media control, and one sized for those dominates a form."
				stacked
				code={`<SliderField size="sm" />   {/* the default — a row in a form */}
<SliderField size="md" />   {/* touch, media controls */}`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="sm — the default">
						<SliderField value={volume} onValueChange={setVolume} showValue unit="%" />
					</FormField>
					<FormField label="md — a larger target">
						<SliderField size="md" value={volume} onValueChange={setVolume} showValue unit="%" />
					</FormField>
				</Stack>
			</Example>

			<Example
				id="slider-orientation"
				title="Vertical, and a range"
				description="A vertical track takes its height from `--slider-vertical-min-h` rather than from its content, because a slider has none. Two values make it a range: the same field, one more number in the array."
				stacked
				code={`<SliderField orientation="vertical" value={level} onValueChange={setLevel} />
<SliderField value={[20, 70]} onValueChange={setRange} />`}
			>
				<Stack direction="horizontal" gap="2xl" align="start">
					<FormField label="Level">
						<SliderField
							orientation="vertical"
							value={volume}
							onValueChange={setVolume}
							showValue
							unit="%"
						/>
					</FormField>
					<div style={MEASURE.field}>
						<FormField label="Budget band" helperText="Two handles, one field.">
							<SliderField value={range} onValueChange={setRange} showValue />
						</FormField>
					</div>
				</Stack>
			</Example>

			<Example
				id="slider-bare"
				title="Slider"
				description="The control without SliderField&rsquo;s label, value read-out and help text — for a slider in a toolbar or a popover, where the surface around it already says what it adjusts. Everything else is the same component, so the two cannot drift apart."
				stacked
				code={`<Slider defaultValue={40} aria-label="Zoom" />`}
			>
				<div style={{ maxWidth: "20rem" }}>
					<Slider defaultValue={40} aria-label="Zoom" />
				</div>
			</Example>

			<Example id="slider-api" title="API">
				<PropTable owner="SliderField"
					rows={[
						{ name: "value / onValueChange", type: "number | number[]", description: "A single value, or two for a range." },
						{ name: "min / max / step", type: "number", description: "Bounds and increment." },
						{ name: "formatValue / unit", type: "(value: number) => string / string", description: "How the readout beside the track renders. unit is the suffix when formatValue is absent." },
						{ name: "size", type: '"sm" | "md"', default: '"sm"', description: "Track and thumb size. A slider is dragged, which is why this one keeps a size prop." },
						{ name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "A vertical slider takes its height from `--slider-vertical-min-h`." },
						{ name: "onChange / onValueChange / onValueCommitted", type: "function", description: "A native-shaped event for form libraries, the bare value for everything else, and a commit that fires once on release rather than on every step." },
						{ name: "showValue / formatValue", type: "boolean / (value) => string", description: "The readout beside the track, and how it is written. A range joins both ends with an en dash." },
						{ name: "strings", type: "Partial<SliderStrings>", description: "Overrides this slider's own copy. `thumb` is a FUNCTION of the handle index, defaulting to \"Minimum\" and \"Maximum\" — two handles called the same thing are two handles a screen reader cannot tell apart, and a range may have more than two." },
						{ name: "invalid", type: "boolean", description: "The error surface. The message stays on the FormField." },
						{ name: "Slider", type: "component", description: "The bare control, without SliderField\u2019s label, value read-out and help text. For a slider inside a toolbar or a popover, where the surrounding surface already says what it adjusts." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
