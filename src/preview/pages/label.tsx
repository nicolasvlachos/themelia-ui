import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function LabelPage() {
	return (
		<ComponentPage>
			<Example
				example="label/label"
				title="Label"
				description="A real <label>, wired by htmlFor. Clicking it focuses the control, which is the behaviour a styled <span> silently loses."
			/>

			<Example id="label-rule" title="Prefer FormField">
				<Callout label="Rule">
					Reach for <code>FormField</code> first. It supplies the label, the single
					supporting line, the error, and the wiring between them — which is four things
					to get right by hand, and the reason a form ends up with three fields labelled
					slightly differently.
				</Callout>
			</Example>

			<Example id="label-api" title="API">
				<PropTable owner="Label" />
			</Example>
		</ComponentPage>
	)
}
