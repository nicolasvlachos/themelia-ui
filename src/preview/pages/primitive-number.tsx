import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PrimitiveNumberPage() {
	return (
		<ComponentPage>
			<Example
				example="primitive-number/number"
				title="Number and percent"
				description="Tabular figures throughout, so a column of numbers aligns on the decimal point without a monospace face. Percent takes a FRACTION — 0.214 renders as 21.4% — because that is what a rate is stored as."
			/>

			<Example
				example="primitive-number/range"
				title="Range"
				description="Intl.NumberFormat.formatRange owns the separator and the spacing around it — English writes 10–50 with an en dash and no spaces, and puts spaces around it once a currency is involved. Equal ends are formatted as a single value here rather than through formatRange, which returns ~£10.00: ICU reads a collapsed range as an approximation, and a product costing exactly £10 is not approximately £10."
			/>

			<Example
				example="primitive-number/ratio"
				title="Ratio"
				description="A count against its total, kept together. A bare 3 beside a progress bar is a number nobody can size. The fraction form exists for columns, where 'of' repeated down the page is mostly noise."
			/>

			<Example
				example="primitive-number/rating"
				title="Rating"
				description="The scale stays visible by default: 4.5 on its own could be out of five or out of ten. A whole score reads as 4, not 4.0 — the instrument does not have that precision."
			/>

			<Example id="number-api" title="Number and Percent API">
				<PropTable owners={["Number", "Percent"]} />
			</Example>

			<Example id="range-api" title="Range API">
				<PropTable owner="Range" />
			</Example>

			<Example id="ratio-api" title="Ratio and Rating API">
				<PropTable owners={["Ratio", "Rating"]} />
			</Example>
		</ComponentPage>
	)
}
