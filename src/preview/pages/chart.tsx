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
				<PropTable owner="ChartTooltipContent"
					rows={[
						{ name: "config", api: "ChartContainer.config", type: "ChartConfig", description: "Maps each data key to a label, a colour, and an icon. Each colour becomes `--color-{key}` on the container." },
						{ name: "ChartTooltipContent indicator", type: '"dot" | "line" | "dashed"', default: '"dot"', description: "Shape of the swatch beside each value." },
						{ name: "ChartTooltipContent hideLabel / hideIndicator", type: "boolean", description: "Drops the label row, or the swatches." },
						{ name: "ChartTooltipContent formatter", type: "(value, name, item, i) => ReactNode", description: "Formats each value. Without it, numbers get locale grouping." },
						{ name: "ChartTooltipContent nameKey / labelKey", type: "string", description: "Which payload key holds the series name and the tooltip label, when they are not the data key." },
						{ name: "ChartLegendContent hideIcon", type: "boolean", default: "false", description: "Drops the swatch, for a legend beside a chart whose colours are already named." },
						{ name: "ChartTooltipContent labelFormatter", type: "(label, payload) => ReactNode", description: "Formats the tooltip's heading — a date key into a readable date." },
						{ name: "active / payload", type: "boolean / ChartPayloadItem[]", description: "Supplied by Recharts. A content component is cloned with them; it never receives them from you." },
						{ name: "Sparkline", type: "component", description: "A trend line with no axes, no grid and no tooltip \u2014 the shape of a series beside the figure it belongs to. Not a small ChartContainer: it draws no chrome, so it can sit inside a table cell or a metric tile." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
