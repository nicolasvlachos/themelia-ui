import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { DecimalInput, RoundingModeSelect, type RoundingMode } from "@/components/base/forms-numeric"
import { Stack } from "@/components/base/structure"

import { MEASURE } from "../partials/measures"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function DecimalInputPage() {
	const [mode, setMode] = useState<RoundingMode>("half-even")

	return (
		<ComponentPage
			title="Decimal input"
			summary="A number with a fixed number of decimal places. A text input, not type=number — see the note below."
			importPath="@/components/base/forms-numeric"
			exports={["DecimalInput", "RoundingModeSelect", "applyRounding", "formatDecimal"]}
		>
			<Example
				id="decimal"
				title="DecimalInput"
				description="A text input, not type=number: the native spinner is unstyleable, its scroll-wheel behaviour changes values a reader is only scrolling past, and it reports an empty string for anything it considers invalid — losing what was actually typed."
				stacked
				code={`<DecimalInput decimalPlaces={2} min={0} max={100} step={0.5} />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="Plain" helperText="Commas become dots; extra decimals are refused.">
						<DecimalInput defaultValue="12.5" decimalPlaces={2} />
					</FormField>
					<FormField label="With steppers" helperText="Steps snap relative to min, not to zero.">
						<DecimalInput defaultValue="10" min={5} max={50} step={10} decimalPlaces={0} />
					</FormField>
					<FormField label="Bankers' rounding" helperText="half-even, so halves do not accumulate a bias across many rows.">
						<DecimalInput defaultValue="2.345" decimalPlaces={2} roundingMode="half-even" />
					</FormField>
					<FormField label="Invalid" error="Enter an amount.">
						<DecimalInput aria-invalid defaultValue="" />
					</FormField>
				</Stack>
			</Example>

			<Example
				id="rounding-mode"
				title="RoundingModeSelect"
				description="The policies as a control, so a product that lets the reader choose does not hand-write the list. The modes are the ones DecimalInput accepts, which is the point — a select offering a mode the input cannot apply is worse than no select. Change it and the field below rounds by the new rule."
				stacked
				code={`<RoundingModeSelect value={mode} onValueChange={setMode} />
<DecimalInput decimalPlaces={2} roundingMode={mode} />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="Rounding" helperText="Applies to the field below.">
						<RoundingModeSelect
							value={mode}
							modes={["floor", "round", "ceil", "half-even"]}
							onValueChange={(next) => next && setMode(next)}
						/>
					</FormField>
					<FormField label="Amount" helperText="Type 2.345 and blur.">
						<DecimalInput defaultValue="2.345" decimalPlaces={2} roundingMode={mode} />
					</FormField>
				</Stack>
			</Example>

			<Example id="numeric-rule" title="Never one string" stacked>
				<Callout label="Rule">
					A number and its unit stay in separate channels — amount and currency, value and
					unit, latitude and longitude. Packing them into one string means every consumer
					re-parses it, and the parse is ambiguous the moment a locale is involved.
				</Callout>
			</Example>

			<Example id="decimal-input-api" title="API">
				<PropTable owner="DecimalInput"
					rows={[
						{ name: "decimalPlaces", type: "number", description: "How many digits after the separator are accepted." },
						{ name: "min / max / step", type: "number", description: "Bounds and increment." },
						{ name: "allowEmpty / allowNegative", type: "boolean", description: "Whether a blank is a valid value, and whether a minus sign is accepted." },
						{ name: "normalizeOnBlur", type: "boolean", description: "Rounds and reformats when focus leaves. Doing it per keystroke fights the reader mid-number." },
						{ name: "strings", type: "Partial<DecimalInputStrings>", description: "Overrides this field's own copy — the two icon-only steppers, plus everything Input contributes." },
						{ name: "value / onChange", type: "string / ChangeEventHandler<HTMLInputElement>", description: "Read event.target.value in onChange. A string, never a number — see the rule above." },
						{ name: "roundingMode", type: "RoundingMode", default: '"round"', description: "How halves resolve. half-even keeps a long column of rows from accumulating a bias." },
						{ name: "RoundingModeSelect", type: "component", description: "The policies as a control, offering exactly the modes DecimalInput accepts. strings replaces the labels." },
						{ name: "applyRounding / formatDecimal", type: "function", description: "The rounding and formatting used internally, exported so a caller can match it." },
						{ name: "endAdornment", type: "ReactNode", description: "A unit rendered after the field, INSIDE the stepper group. A stepper field is already a shell, so a caller cannot wrap a second one around it to add a suffix without doubling the border." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
