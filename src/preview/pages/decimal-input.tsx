import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function DecimalInputPage() {
	return (
		<ComponentPage>
			<Example
				example="decimal-input/decimal"
				title="DecimalInput"
				description="A text input, not type=number: the native spinner is unstyleable, its scroll-wheel behaviour changes values a reader is only scrolling past, and it reports an empty string for anything it considers invalid — losing what was actually typed."
			/>

			<Example
				example="decimal-input/rounding-mode"
				title="RoundingModeSelect"
				description="The policies as a control, so a product that lets the reader choose does not hand-write the list. The modes are the ones DecimalInput accepts, which is the point — a select offering a mode the input cannot apply is worse than no select. Change it and the field below rounds by the new rule."
			/>

			<Example id="numeric-rule" title="Never one string">
				<Callout label="Rule">
					A number and its unit stay in separate channels — amount and currency, value and
					unit, latitude and longitude. Packing them into one string means every consumer
					re-parses it, and the parse is ambiguous the moment a locale is involved.
				</Callout>
			</Example>

			<Example id="decimal-input-api" title="API">
				<PropTable owners={["DecimalInput"]} />
				<PropTable symbols={["RoundingModeSelect", "applyRounding", "formatDecimal"]} />
			</Example>
		</ComponentPage>
	)
}
