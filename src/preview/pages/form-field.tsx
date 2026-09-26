import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function FormFieldPage() {
	return (
		<ComponentPage
			title="Form field"
			summary="The label, the supporting line, and the error, wired to whatever control sits inside. One supporting line, not three stacked hints."
			importPath="@/components/base/forms"
			exports={["FormField", "FieldGroup"]}
		>
			<Example
				example="form-field/form-field"
				title="FormField"
				description="Exactly one supporting line, resolved as error || helperText || hint. They replace each other rather than stacking, so a field never grows or shifts as validation state changes."
			/>

			<Example
				example="form-field/form-field-composition"
				title="Custom control composition"
				description="The render-function path hands the label, validation, support, and required wiring to a control even when consumer wrappers hide its actual input. FieldShell exposes the same adapter one level deeper."
			/>

			<Example
				example="form-field/horizontal-fields"
				title="Horizontal fields"
				description="Label beside the control for settings rows, where a column of stacked labels wastes the width and separates each label from its value."
			/>

			<Example
				example="form-field/forms-scale"
				title="Scale"
				description="No control takes a size prop. Density is scoped instead, so a form can run denser than the page around it."
			/>

			<Example
				example="form-field/field-group"
				title="FieldGroup"
				description="Several controls that are ONE field — a date range, a name split in two, a card number and its expiry. A real fieldset with a legend, so the group is announced as a group and the supporting line belongs to all of it rather than being repeated under each box."
			/>

			<Example id="forms-accessibility" title="Accessibility">
				<Callout>
					FormField owns the wiring: it associates the label, points{" "}
					<code>aria-describedby</code> at the supporting line, and sets{" "}
					<code>aria-invalid</code> on the control when there is an error. A caller who sets
					any of those explicitly keeps their value — the field fills gaps rather than
					overriding decisions. Errors are announced with <code>aria-live="polite"</code>{" "}
					so validation firing on each keystroke does not interrupt typing.
				</Callout>
			</Example>

			<Example id="form-field-api" title="API">
				<PropTable owner="FormField"
					rows={[
						{ name: "label", type: "ReactNode", description: "Wired to the control by a generated id unless the control has one." },
						{ name: "helperText", type: "ReactNode", description: "Middle priority: replaces hint, and is itself replaced by error." },
						{ name: "error", type: "ReactNode", description: "Highest priority of the three supporting lines. Announced politely and switches the control to its invalid state." },
						{ name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Label above the control, or beside it." },
						{ name: "required", type: "boolean", description: "Marks the label and the control." },
						{ name: "FieldGroup", type: "component", description: "Several fields sharing one label and one supporting line — a date range, a name split in two." },
						{ name: "htmlFor", type: "string", description: "Associates the label with a control that already has an id, instead of the generated one." },
						{ name: "children", type: "ReactNode | (controlProps) => ReactNode", description: "Use the function form when a consumer wrapper hides the actual control; spread the supplied id and aria props onto it." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
