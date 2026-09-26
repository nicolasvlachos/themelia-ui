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
				<PropTable
					rows={[
						{ name: "Toolbar", type: "Root", description: "role=toolbar, orientation, disabled state, loopFocus, and one roving tab stop." },
						{ name: "ToolbarGroup", type: "Group", description: "Groups related items and can disable the group as one unit." },
						{ name: "ToolbarButton", type: "Button", description: "Base UI navigation behavior rendered through the kit Button. Supports tone, buttonStyle, iconOnly, loading, and render." },
						{ name: "ToolbarLink / ToolbarInput", type: "item", description: "Anchor and native input items that participate in the same roving-focus order." },
						{ name: "ToolbarSeparator", type: "Separator", description: "Defaults to the opposite orientation of the toolbar." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
