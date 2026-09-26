import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SelectPage() {
	return (
		<ComponentPage>
			<Example
				example="select/select"
				title="Select"
				description="The canonical finite-option control, on Base UI. An option carries an icon and a second line, both of which show once the list is open. The trigger wears the shared field surface — the same height, border, focus ring and chevron as Input, Combobox and NativeSelect, so a form built from all four reads as one set of controls."
			/>

			<Example id="select-api" title="API">
				<PropTable owner="Select" />
				<PropTable
					symbols={[
						"NativeSelect",
						"SelectRoot",
						"SelectTriggerPrimitive",
						"SelectValuePrimitive",
						"SelectIconPrimitive",
						"SelectPopupContent",
						"SelectPopupGroup",
						"SelectPopupLabel",
						"SelectPopupItem",
						"SelectPopupSeparator",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
