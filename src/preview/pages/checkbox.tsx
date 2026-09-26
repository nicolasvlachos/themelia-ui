import { Checkbox } from "@/components/base/choice-inputs"
import { Stack } from "@/components/base/structure"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CheckboxPage() {
	return (
		<ComponentPage
			title="Checkbox"
			summary="A box that is checked, unchecked, or indeterminate. The check and the dash are Lucide icons, not hand-drawn paths — a bespoke polyline is a second icon vocabulary in a kit that already has one."
			importPath="@/components/base/choice-inputs"
			exports={["Checkbox"]}
		>
			<Example
				id="checkbox"
				title="Checkbox"
				description="The label is part of the target, and a label that wraps keeps the box on the first line instead of floating into the middle of the paragraph."
				stacked
				code={`<Checkbox label="Checked" defaultChecked />
<Checkbox label="Indeterminate" indeterminate />`}
			>
				<Stack gap="sm">
					<Checkbox label="Unchecked" />
					<Checkbox label="Checked" defaultChecked />
					<Checkbox label="Indeterminate" indeterminate />
					<Checkbox label="Disabled" disabled />
					<Checkbox label="A long label that wraps onto a second line, so the box stays on the first line instead of floating into the middle of the paragraph." />
				</Stack>
			</Example>

			<Example id="checkbox-api" title="API">
				<PropTable owner="Checkbox"
					rows={[
						{ name: "label", type: "ReactNode", description: "Rendered beside the box and wired to it, so the text is part of the target." },
						{ name: "indeterminate", type: "boolean", default: "false", description: "The dash state, for a parent whose children are partly checked. Independent of checked." },
						{ name: "checked / defaultChecked", type: "boolean", description: "Controlled and uncontrolled state." },
						{ name: "onChange", type: "ChangeEventHandler<HTMLInputElement>", description: "Receives the native change event. Read event.target.checked for the next state." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
