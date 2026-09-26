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
				<PropTable owner="Toggle"
					rows={[
						{ name: "pressed / defaultPressed", type: "boolean", description: "Controlled and uncontrolled state." },
						{ name: "onPressedChange", type: "(pressed: boolean) => void", description: "Fires with the next state." },
						{ name: "variant", type: '"ghost" | "outline"', default: '"ghost"', description: "Match whatever sits beside it in the row — outline for a lone control, ghost inside a group." },
						{ name: "ToggleGroup multiple", type: "boolean", default: "false", description: "Several at once, or one. A view switch is one; text styles are several." },
						{ name: "ToggleGroup value / onValueChange", type: "string[]", description: "Always an array, even when only one may be pressed — so switching multiple does not change the value's shape." },
						{ name: "Toggle value", type: "string", description: "Names the toggle inside a ToggleGroup, which reads it into the group's value. Outside a group it is unused." },
						{ name: "ToggleGroup attached", type: "boolean", default: "true", description: "Joins the buttons into one control with internal rules. Off leaves them as separate buttons in a row." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
