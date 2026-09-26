import { FormField } from "@/components/base/forms"
import { PercentageInput } from "@/components/base/forms-numeric"
import { Stack } from "@/components/base/structure"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PercentageInputPage() {
	return (
		<ComponentPage
			title="Percentage input"
			summary="A percentage, with the sign as a suffix on the field rather than a character in the value."
			importPath="@/components/base/forms-numeric"
			exports={["PercentageInput"]}
		>
			<Example
				id="percentage"
				title="PercentageInput"
				description="Bounded to 0–100 with a trailing sign. The suffix is a field affordance, not part of the value — nothing downstream has to strip a symbol before parsing."
				stacked
				code={`<PercentageInput defaultValue="21" />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="VAT rate">
						<PercentageInput defaultValue="21" />
					</FormField>
					<FormField label="With steppers">
						<PercentageInput defaultValue="50" step={5} decimalPlaces={0} />
					</FormField>
				</Stack>
			</Example>

			<Example id="percentage-input-api" title="API">
				<PropTable owner="PercentageInput"
					rows={[
						{ name: "value / onChange", type: "string / ChangeEventHandler<HTMLInputElement>", description: "Read event.target.value in onChange. The number only. The % is chrome, not data." },
						{ name: "min / max", type: "number", description: "Bounds. Defaults to 0–100." },
						{ name: "decimalPlaces", type: "number", default: "2", description: "Digits after the separator." },
						{ name: "step", type: "number", description: "Renders − / + controls that snap to multiples of it. The sign moves inside the group there — a stepper field is already a shell, and a second one around it would double the border." },
						{ name: "allowNegative", type: "boolean", default: "false", description: "Lets the value go below zero — a CHANGE in percent rather than a proportion." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
