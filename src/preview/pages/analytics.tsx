import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AnalyticsPage() {
	return (
		<ComponentPage>
			<Example
				example="analytics/analytics-bar"
				title="Metric bar"
				description="A strip of KPIs divided by hairlines. The dividers are what make four numbers read as one module rather than four cards that happen to be adjacent. The period sits in a band above the cells rather than in a column beside them, so every figure gets its full share of the width. It stacks to rows on a narrow container — a container query, because a bar above a table is as likely to sit in a drawer as to span the page."
			/>

			<Example
				example="analytics/analytics-grid"
				title="Metric grid"
				description="The same four metrics as standalone cards, with the same label, figure and delta steps as the bar. Column counts break against the grid's own width, not the viewport's: four sit two by two until a quarter of the row can hold a currency figure without cutting it, and six metrics in a 300px rail would otherwise render as six 40px columns."
			/>

			<Example
				example="analytics/analytics-variants"
				title="Seven variants, one shape"
				description="Every variant reads the same MetricData, so moving a figure between them is a prop change. There is no size prop: the kit has one `--scale`, and a metric inside a compact scope is already smaller. Note where tone is NOT used — a revenue figure reports no state, and painting a grid of them one colour is the trap of treating semantic state tokens as a palette. Tone marks the colored variant, whose segments genuinely track progress."
			/>

			<Example
				example="analytics/analytics-comparison"
				title="Comparison"
				description="This period against the last one, and the gap between them. The delta is computed from the raw values, not from the formatted strings — reading numbers back out of '€1,240' is how a comparison quietly stops comparing."
			/>

			<Example
				example="analytics/analytics-hero"
				title="Gradient hero"
				description="The one metric on a page allowed to shout. Its ramps come from the categorical chart palette, never the state tokens — a hero card reports no success and no warning, and painting it `--success` would repaint it whenever a consumer retunes the colour that means things went right."
			/>

			<Example
				example="analytics/analytics-micro"
				title="Micro grid"
				description="Six dense cells, each pairing a figure with a different sketch. Deliberately not six sparklines — when every cell draws the same shape, a reader scanning the block has nothing to tell them apart by except the label."
			/>

			<Example
				example="analytics/analytics-chart-card"
				title="Chart card"
				description="The kit's heading and description around a chart the caller owns. Card-free until the call site asks for a surface, so dropping one into a panel that already has chrome does not nest two borders."
			/>

			<Example
				example="analytics/analytics-heatmap"
				title="Activity heatmap"
				description="Half a year of daily activity as Monday-aligned columns. Month labels are placed by week index and thinned to a three-week minimum gap — without the thinning, a month starting mid-week puts its label a few pixels from the last one and the two overlap into a smear."
			/>

			<Example
				example="analytics/analytics-ruler"
				title="Time ruler"
				description="Twenty-four hours as one bar, shaded by how busy each was. Four bands rather than a continuous ramp: a reader cannot rank 24 shades, but can rank four. The peak hour is ringed and the marker pins the current hour."
			/>

			<Example id="analytics-props" title="Props">
				<Callout>
					A metric where <em>down</em> is the good direction — churn, refunds, latency —
					sets <code>trend</code> explicitly. Direction is a fact about the number; tone is
					a judgement about it, and inferring the second from the first paints a falling
					churn rate red.
				</Callout>
				<PropTable owners={["Metric", "MetricData", "MetricGrid"]} />
				<PropTable symbols={["MetricMicroGrid", "MetricGradient", "MetricTrendChip", "MetricSkeleton"]} />
			</Example>
		</ComponentPage>
	)
}
