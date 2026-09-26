import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function UnitInputsPage() {
	return (
		<ComponentPage>
			<Example
				example="unit-inputs/units"
				title="Weight, dimensions, coordinates"
				description="Same idea, other units. The dimension boxes carry captions because three identical boxes say nothing, and the separator sits on the field row so it lines up with the boxes rather than the captions."
			/>

			<Example id="unit-inputs-api" title="API">
				<PropTable owners={["WeightInput", "DimensionsInput", "CoordinatesInput"]} />
			</Example>
		</ComponentPage>
	)
}
