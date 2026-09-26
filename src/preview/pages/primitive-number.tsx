import { Number, Percent, Range, Rating, Ratio } from "@/components/primitives"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import { SpecimenList } from "../partials/specimen-list"

export function PrimitiveNumberPage() {
	return (
		<ComponentPage
			title="Numbers, ranges & ratios"
			summary="A number on its own, a span between two, and a value against the total it is measured out of. All five render tabular figures, so they can share a column and still align; they stay separate components because each carries something a bare number drops — the range’s locale dash, the ratio’s total, the rating’s scale."
			importPath="@/components/primitives"
			exports={["Number", "Percent", "Range", "Ratio", "Rating"]}
		>
			<Example
				id="number"
				title="Number and percent"
				description="Tabular figures throughout, so a column of numbers aligns on the decimal point without a monospace face. Percent takes a FRACTION — 0.214 renders as 21.4% — because that is what a rate is stored as."
				stacked
				code={`<Number value={1234567.891} />
<Number value={-42} />
<Percent value={0.214} />
<Percent value={1} />
<Percent value={21.4} scaled />
<Number value={null} />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `<Number value={1234567.891} />`, value: <Number value={1234567.891} /> },
						{ code: `<Number value={-42} />`, value: <Number value={-42} /> },
						{ code: `<Percent value={0.214} />`, value: <Percent value={0.214} /> },
						{ code: `<Percent value={1} />`, value: <Percent value={1} /> },
						{ code: `<Percent value={21.4} scaled />`, value: <Percent value={21.4} scaled /> },
						{ code: `<Number value={null} />`, value: <Number value={null} /> },
					]}
				/>
			</Example>

			<Example
				id="range"
				title="Range"
				description="Intl.NumberFormat.formatRange owns the separator and the spacing around it — English writes 10–50 with an en dash and no spaces, and puts spaces around it once a currency is involved. Equal ends are formatted as a single value here rather than through formatRange, which returns ~£10.00: ICU reads a collapsed range as an approximation, and a product costing exactly £10 is not approximately £10."
				stacked
				code={`<Range from={10} to={50} />
<Range from={10} to={50} currency="GBP" />
<Range from={2} to={5} unit="day" />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `from={10} to={50}`, value: <Range from={10} to={50} /> },
						{ code: `currency="GBP"`, value: <Range from={10} to={50} currency="GBP" /> },
						{ code: `currency="EUR"`, value: <Range from={10} to={50} currency="EUR" /> },
						{ code: `unit="day"`, value: <Range from={2} to={5} unit="day" /> },
						{ code: `equal ends`, value: <Range from={10} to={10} currency="GBP" /> },
						{ code: `one end only`, value: <Range from={10} currency="GBP" /> },
						{ code: `null`, value: <Range from={null} to={null} /> },
					]}
				/>
			</Example>

			<Example
				id="ratio"
				title="Ratio"
				description="A count against its total, kept together. A bare 3 beside a progress bar is a number nobody can size. The fraction form exists for columns, where 'of' repeated down the page is mostly noise."
				stacked
				code={`<Ratio value={3} total={10} />
<Ratio value={3} total={10} format="fraction" />
<Ratio value={3} />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `<Ratio value={3} total={10} />`, value: <Ratio value={3} total={10} /> },
						{ code: `<Ratio value={7} total={7} />`, value: <Ratio value={7} total={7} /> },
						{ code: `format="fraction"`, value: <Ratio value={3} total={10} format="fraction" /> },
						{ code: `<Ratio value={1240} total={10000} />`, value: <Ratio value={1240} total={10000} /> },
						{ code: `<Ratio value={3} />`, value: <Ratio value={3} /> },
						{ code: `<Ratio value={null} />`, value: <Ratio value={null} /> },
					]}
				/>
			</Example>

			<Example
				id="rating"
				title="Rating"
				description="The scale stays visible by default: 4.5 on its own could be out of five or out of ten. A whole score reads as 4, not 4.0 — the instrument does not have that precision."
				stacked
				code={`<Rating value={4.5} />
<Rating value={4} hideMax />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `<Rating value={4.5} />`, value: <Rating value={4.5} /> },
						{ code: `<Rating value={4} />`, value: <Rating value={4} /> },
						{ code: `<Rating value={8.5} max={10} />`, value: <Rating value={8.5} max={10} /> },
						{ code: `hideMax`, value: <Rating value={4.5} hideMax /> },
						{ code: `<Rating value={null} />`, value: <Rating value={null} /> },
					]}
				/>
			</Example>

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
