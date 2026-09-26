import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ChartPage() {
	return (
		<ComponentPage>
			<Example
				example="chart/chart"
				title="Chart"
				description="Recharts owns the geometry; the container owns the chrome. Each series key becomes a CSS variable, so a colour is declared once in the config and referenced as `var(--color-revenue)` rather than repeated at every Bar and Line."
			/>

			<Example
				example="chart/chart-sparkline"
				title="Sparkline"
				description="The shape of a series at a glance — no axes, no grid, no tooltip. Sized to sit inside a metric tile or a table cell, so it fills its box and the caller sizes the box. Animation is off by default: a screenful of tiles all drawing themselves at once reads as the page malfunctioning rather than as motion."
			/>

			<Example id="data-viz-rule" title="Colour comes from the theme">
				<Callout label="Rule">
					A series colour should be <code>var(--chart-1)</code> … <code>var(--chart-5)</code>,
					never a literal. Those tokens already flip with light and dark, so a chart
					follows the theme with no per-theme configuration — and the five are
					categorical, so none of them is ever a status colour.
				</Callout>
			</Example>

			<Example id="chart-api" title="API">
				<PropTable owners={["ChartContainer", "ChartTooltipContent", "ChartLegendContent"]} />
				<PropTable symbols={["Sparkline"]} />
			</Example>
		</ComponentPage>
	)
}
