import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PercentageInputPage() {
	return (
		<ComponentPage>
			<Example
				example="percentage-input/percentage"
				title="PercentageInput"
				description="Bounded to 0–100 with a trailing sign. The suffix is a field affordance, not part of the value — nothing downstream has to strip a symbol before parsing."
			/>

			<Example id="percentage-input-api" title="API">
				<PropTable owners={["PercentageInput"]} />
			</Example>
		</ComponentPage>
	)
}
