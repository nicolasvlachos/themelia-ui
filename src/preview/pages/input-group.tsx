import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function InputGroupPage() {
	return (
		<ComponentPage>
			<Example
				example="input-group/input-group-inline"
				title="Attached along the line"
				description="An addon aligned to either inline edge sits inside the shell, on the control's own line. The group draws one border and one ring; the input inside it draws neither, which is what stops a prefix reading as a second field."
			/>

			<Example
				example="input-group/input-group-block"
				title="Attached above or below"
				description="A block-aligned addon takes its own row inside the shell — for a toolbar over a textarea, or a counter under one. The shell still owns the border, so the row and the control read as one field rather than as a field with something stacked on it."
			/>

			<Example
				example="input-group/input-group-buttons"
				title="Button sizes inside the shell"
				description="A control inside a field cannot be a full-height control — it would set the field's height instead of fitting in it. The four sizes here are the ones that fit: two text sizes and their icon-only twins."
			/>

			<Example id="input-group-rule" title="One box, one ring">
				<Callout label="Rule">
					Use a group when the thing attached belongs <em>to the field</em> — a unit, a
					prefix, a submit. When it is a separate control that happens to sit nearby, it is
					two components in a <code>Stack</code>, and each keeps its own border. The tell is
					focus: if tabbing into the field should ring both, it is a group.
				</Callout>
			</Example>

			<Example id="input-group-api" title="API">
				<PropTable
					owners={[
						"InputGroup",
						"InputGroupAddon",
						"InputGroupButton",
						"InputGroupText",
						"InputGroupInput",
						"InputGroupTextarea",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
