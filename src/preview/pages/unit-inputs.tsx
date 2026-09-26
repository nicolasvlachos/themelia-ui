import { useState } from "react"

import { FormField } from "@/components/base/forms"
import {
	CoordinatesInput,
	DimensionsInput,
	WeightInput,
	type CoordinatesValue,
	type DimensionsValue,
} from "@/components/base/forms-numeric"
import { Stack } from "@/components/base/structure"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function UnitInputsPage() {
	const [weight, setWeight] = useState("2.4")
	const [dimensions, setDimensions] = useState<DimensionsValue>({ length: "30", width: "20", height: "12" })
	const [coordinates, setCoordinates] = useState<CoordinatesValue>({ latitude: "52.370216", longitude: "4.895168" })

	return (
		<ComponentPage
			title="Unit inputs"
			summary="Weight, dimensions, and coordinates: three fields whose value is a number plus a unit or a second number. Each keeps its parts in separate channels."
			importPath="@/components/base/forms-numeric"
			exports={["WeightInput", "DimensionsInput", "CoordinatesInput"]}
		>
			<Example
				id="units"
				title="Weight, dimensions, coordinates"
				description="Same idea, other units. The dimension boxes carry captions because three identical boxes say nothing, and the separator sits on the field row so it lines up with the boxes rather than the captions."
				stacked
				code={`<WeightInput value={weight} onChange={(e) => setWeight(e.target.value)} />
<DimensionsInput value={dimensions} onValueChange={setDimensions} />
<CoordinatesInput value={coordinates} onValueChange={setCoordinates} />`}
			>
				<Stack gap="xl" style={MEASURE.wide}>
					<FormField label="Shipping weight">
						<WeightInput
							value={weight}
							onChange={(event) => setWeight(event.target.value)}
							defaultUnit="kg"
						/>
					</FormField>
					<FormField label="Package">
						<DimensionsInput value={dimensions} onValueChange={setDimensions} defaultUnit="cm" />
					</FormField>
					<FormField label="Warehouse" helperText="Latitude is ±90, longitude ±180 — bounded separately.">
						<CoordinatesInput value={coordinates} onValueChange={setCoordinates} />
					</FormField>
				</Stack>
			</Example>

			<Example id="unit-inputs-api" title="API">
				<PropTable owner="WeightInput"
					rows={[
						{ name: "WeightInput value / unit", type: "string / WeightUnit", description: "The number and the unit, separately. Switching unit does not convert — it relabels." },
						{ name: "DimensionsInput value", type: "{ length, width, height }", description: "Three strings, one field. Each part is independently editable." },
						{ name: "CoordinatesInput value", type: "{ latitude, longitude }", description: "Two strings. Kept apart so a half-typed latitude cannot corrupt the longitude." },
						{ name: "units / defaultUnit / onUnitChange", type: "UnitOption[] / string", description: "Which units the selector offers and which one starts. Switching relabels rather than converting — the number is the caller's." },
						{ name: "showUnitSelector / disableUnitSelector", type: "boolean", description: "Hide the selector for a field with one fixed unit, or show it read-only for a value whose unit is decided elsewhere." },
						{ name: "showHeight", api: "DimensionsInput.showHeight", type: "boolean", default: "true", description: "Drops the third dimension box, for a value that is a plane rather than a solid." },
						{ name: "min / max / step / decimalPlaces", type: "number", description: "Bounds and precision, applied to every part of the field." },
						{ name: "invalid", type: "boolean", description: "The error surface. The message stays on the FormField." },
						{ name: "strings", type: "Partial<UnitInputStrings> | Partial<DimensionsInputStrings> | Partial<CoordinatesInputStrings>", description: "Overrides each field's own copy — the unit selector, and the axis names that used to be a `labels` prop. They are strings like every other piece of copy, and partially overridable now." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
