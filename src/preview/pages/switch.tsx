import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SwitchPage() {
	return (
		<ComponentPage>
			<Example
				example="switch/switch"
				title="Switch"
				description="Use it for something that applies the moment it moves. A switch that needs a Save button beside it is telling the reader the wrong thing — that is a checkbox in a form."
			/>

			<Example
				example="switch/toggle-rows"
				title="Settings rows and feature cards"
				description="The same toggle at two weights. A SwitchCard is the top-of-list feature switch; a ToggleField is the settings row underneath it. Both make the whole row the target, and SwitchCard is ToggleField with surface=&quot;card&quot;."
			/>

			<Example id="switch-api" title="Switch API">
				<PropTable owners={["Switch"]} />
			</Example>

			<Example id="toggle-field-api" title="ToggleField and SwitchCard API">
				<PropTable owners={["ToggleField", "SwitchCard"]} />
			</Example>
		</ComponentPage>
	)
}
