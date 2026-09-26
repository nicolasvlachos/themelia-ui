import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SlugFieldPage() {
	return (
		<ComponentPage>
			<Example
				example="slug-field/slug-field"
				title="SlugField"
				description="A read-only mirror of another field. Read-only rather than editable-with-sync: a slug that both follows the title and accepts edits has to decide which wins on every keystroke, and every answer to that surprises someone."
			/>

			<Example id="slug-api" title="API">
				<PropTable owner="SlugField" />
			</Example>
		</ComponentPage>
	)
}
