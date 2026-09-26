import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ToolbarPage() {
	return (
		<ComponentPage>
			<Example
				example="toolbar/toolbar"
				title="Formatting controls"
				description="The buttons use the public Button appearance while Base UI owns roving focus, orientation, disabled-item behavior, and arrow navigation."
			/>

			<Example
				example="toolbar/toolbar-orientation"
				title="Vertical orientation"
				description="Orientation changes both layout and keyboard direction. Arrow Down replaces Arrow Right."
			/>

			<Example id="toolbar-api" title="API">
				<PropTable owners={["Toolbar", "ToolbarGroup", "ToolbarButton", "ToolbarLink", "ToolbarInput", "ToolbarSeparator"]} />
			</Example>
		</ComponentPage>
	)
}
