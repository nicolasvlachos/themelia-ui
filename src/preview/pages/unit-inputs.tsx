import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function UnitInputsPage() {
	return (
		<ComponentPage
			title="Unit inputs"
			summary="Weight, dimensions, and coordinates: three fields whose value is a number plus a unit or a second number. Each keeps its parts in separate channels."
			importPath="@/components/base/forms-numeric"
			exports={["WeightInput", "DimensionsInput", "CoordinatesInput"]}
		>
			<Example
				example="unit-inputs/units"
				title="Weight, dimensions, coordinates"
				description="Same idea, other units. The dimension boxes carry captions because three identical boxes say nothing, and the separator sits on the field row so it lines up with the boxes rather than the captions."
			/>

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
						{ name: "strings", type: "Partial<UnitInputStrings> | Partial<DimensionsInputStrings> | Partial<CoordinatesInputStrings>", description: "Overrides each field's own copy — the unit selector and the axis names. They are strings like every other piece of copy, so each one can be overridden on its own." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
