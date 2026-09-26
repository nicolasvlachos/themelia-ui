import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CheckboxPage() {
	return (
		<ComponentPage>
			<Example
				example="checkbox/checkbox"
				title="Checkbox"
				description="The label is part of the target, and a label that wraps keeps the box on the first line instead of floating into the middle of the paragraph."
			/>

			<Example id="checkbox-api" title="API">
				<PropTable owners={["Checkbox"]} />
			</Example>
		</ComponentPage>
	)
}
