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
				<PropTable owner="Percent"
					rows={[
						{ name: "Number value", type: "number | null", description: "Locale grouping and tabular figures." },
						{ name: "Percent value", type: "number | null", description: "A fraction, not a percentage — 0.214 renders as 21.4%." },
						{ name: "Percent scaled", type: "boolean", default: "false", description: "For a value already on 0–100. Needed because both conventions are in the wild and neither is guessable from the number." },
						{ name: "locale", type: "string", description: "Overrides the document locale for this value." },
					]}
				/>
			</Example>

			<Example id="range-api" title="Range API">
				<PropTable owner="Range"
					rows={[
						{ name: "from / to", type: "number | null", description: "The ends. One alone still renders — \"from £10\", with the caller's copy around it." },
						{ name: "currency", type: "string", description: "An ISO code. Intl repeats the symbol on both ends, which is its considered answer to the ambiguity a single symbol creates." },
						{ name: "unit", type: "string", description: "A CSS-style unit identifier. Ignored when currency is set." },
						{ name: "maximumFractionDigits", type: "number", description: "Caps the decimals on both ends." },
					]}
				/>
			</Example>

			<Example id="ratio-api" title="Ratio and Rating API">
				<PropTable owner="Ratio"
					rows={[
						{ name: "Ratio value / total", type: "number | null", description: "The count and what it is counted against. Without a total the value renders alone." },
						{ name: "Ratio format", type: '"words" | "fraction"', default: '"words"', description: "\"3 of 10\" in prose, \"3/10\" in a table." },
						{ name: "Rating value", type: "number | null", description: "The score. Shown to at most one decimal, so 4 stays 4." },
						{ name: "Rating max", type: "number", default: "5", description: "The top of the scale." },
						{ name: "Rating hideMax", type: "boolean", default: "false", description: "Drops the scale, for a surface that states it elsewhere. Not the default: a bare score is a number the reader has to guess the meaning of." },
						{ name: "strings", type: "Partial<RatioStrings> | Partial<RatingStrings>", description: "The connectors — \"of\", \"out of\", and the fraction separator." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
