import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TextareaPage() {
	return (
		<ComponentPage>
			<Example
				example="textarea/textarea"
				title="Textarea"
				description="The same surface as Input, so a form that mixes the two does not step between two field treatments."
			/>

			<Example id="textarea-api" title="API">
				<PropTable owner="Textarea" />
			</Example>
		</ComponentPage>
	)
}
