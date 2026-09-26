import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function LabelPage() {
	return (
		<ComponentPage
			title="Label"
			summary="The text that names a control. Usually reached through FormField rather than directly — but it is here for a control the kit does not ship."
			importPath="@/components/base/label"
			exports={["Label"]}
		>
			<Example
				example="label/label"
				title="Label"
				description="A real <label>, wired by htmlFor. Clicking it focuses the control, which is the behaviour a styled <span> silently loses."
				stacked
			/>

			<Example id="label-rule" title="Prefer FormField" stacked>
				<Callout label="Rule">
					Reach for <code>FormField</code> first. It supplies the label, the single
					supporting line, the error, and the wiring between them — which is four things
					to get right by hand, and the reason a form ends up with three fields labelled
					slightly differently.
				</Callout>
			</Example>

			<Example id="label-api" title="API">
				<PropTable owner="Label"
					rows={[
						{ name: "htmlFor", type: "string", description: "The control's id. Without it the label is decoration — clicking does nothing and nothing is announced." },
						{ name: "Native label props", api: "Label", type: 'ComponentProps<"label">', description: "Everything a native label takes." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
