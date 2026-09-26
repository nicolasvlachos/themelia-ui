import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TogglePage() {
	return (
		<ComponentPage>
			<Example
				example="toggle/toggle"
				title="Toggle"
				description="One control that stays engaged. The pressed state is a filled surface rather than a tint, because a toggle sits in a row of its siblings and a 10% wash is not enough to pick the engaged one out of five."
			/>

			<Example
				example="toggle/toggle-group"
				title="ToggleGroup"
				description="A set sharing one value. Its items are the same Toggle, each given a value the group reads — there is no second item component. multiple decides whether it behaves as a radio group — one at a time, a view mode — or a checkbox set, several at once, like text styles. Both are common enough that neither is a sensible default to hide."
			/>

			<Example id="toggle-rule" title="Toggle, Switch, or Checkbox">
				<Callout label="Rule">
					A <code>Switch</code> applies a setting the moment it moves. A{" "}
					<code>Checkbox</code> is a value in a form, submitted with the rest. A{" "}
					<code>Toggle</code> is a CONTROL that stays engaged — bold in an editor, a view
					mode, a filter currently on. Picking by which one is announced correctly is
					easier than picking by which one looks right: they report{" "}
					<code>aria-checked</code>, <code>aria-checked</code>, and{" "}
					<code>aria-pressed</code> respectively.
				</Callout>
			</Example>

			<Example id="toggle-api" title="API">
				<PropTable owners={["Toggle", "ToggleGroup"]} />
			</Example>
		</ComponentPage>
	)
}
