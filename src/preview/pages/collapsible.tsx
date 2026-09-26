import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CollapsiblePage() {
	return (
		<ComponentPage>
			<Example
				example="collapsible/collapsible"
				title="Collapsible"
				description="Animates to the content's own height using grid-template-rows 0fr to 1fr — height: auto is not an animatable value, and this reaches the same result without measuring anything in JavaScript."
			/>

			<Example id="collapsible-api" title="API">
				<PropTable owner="Collapsible" />
				<PropTable symbols={["CollapsibleTrigger", "CollapsibleContent"]} />
			</Example>
		</ComponentPage>
	)
}
