import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TagsInputPage() {
	return (
		<ComponentPage>
			<Example
				example="tags-input/tags"
				title="TagsInput"
				description="Chips and the entry field share one surface, so it reads as a field with things in it. Enter commits, Backspace on an empty field removes the last chip, and pasting a comma-separated list splits it."
			/>

			<Example id="tags-input-api" title="API">
				<PropTable owner="TagsInput" />
			</Example>
		</ComponentPage>
	)
}
