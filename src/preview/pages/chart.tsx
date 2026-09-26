import type { CSSProperties } from "react"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Card } from "@/components/base/cards"
import {
	ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent,
	Sparkline,
	type ChartConfig,
} from "@/components/base/chart"
import { Grid, GridCell } from "@/components/base/structure"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const REVENUE = [
	{ month: "Jan", revenue: 18600, expenses: 12400 },
	{ month: "Feb", revenue: 30500, expenses: 15100 },
	{ month: "Mar", revenue: 23700, expenses: 16800 },
	{ month: "Apr", revenue: 27300, expenses: 14200 },
	{ month: "May", revenue: 20900, expenses: 13900 },
	{ month: "Jun", revenue: 34100, expenses: 18300 },
]

/**
 * Series colours reference the theme's own tokens, so the chart follows a light/dark
 * switch with no per-theme configuration.
 */
const CONFIG = {
	revenue: { label: "Revenue", color: "var(--chart-1)" },
	expenses: { label: "Expenses", color: "var(--chart-2)" },
} satisfies ChartConfig


const SPARK_UP = [4, 9, 6, 12, 10, 17, 15, 22]
const SPARK_DOWN = [22, 19, 20, 14, 15, 9, 11, 5]
const SPARK_FLAT = [11, 12, 11, 13, 12, 12, 13, 12]

export function ChartPage() {
	return (
		<ComponentPage
			title="Chart"
			summary="Recharts with the kit's tooltip, legend, and colour wiring. The container maps each data key to a token, so a chart follows the theme with no per-theme configuration."
			importPath="@/components/base/chart"
			exports={["ChartContainer", "ChartTooltip", "ChartTooltipContent", "ChartLegend", "ChartLegendContent", "Sparkline"
			]}
		>
			<Example
				id="chart"
				title="Chart"
				description="Recharts owns the geometry; the container owns the chrome. Each series key becomes a CSS variable, so a colour is declared once in the config and referenced as `var(--color-revenue)` rather than repeated at every Bar and Line."
				stacked
				code={`const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  expenses: { label: "Expenses", color: "var(--chart-2)" },
} satisfies ChartConfig

<ChartContainer config={config} label="Monthly revenue and expenses">
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
  </BarChart>
</ChartContainer>`}
			>
				{/* Two columns, with the third chart spanning both. */}
				<Grid columns={{ base: 1, md: 2 }} gap="lg" style={{ width: "100%" }}>
					<Card surface="bordered" title="Revenue vs expenses" description="Bars, with a legend.">
						<ChartContainer config={CONFIG} label="Monthly revenue and expenses, January to June">
							<BarChart data={REVENUE}>
								<CartesianGrid vertical={false} />
								<XAxis dataKey="month" tickLine={false} axisLine={false} />
								<YAxis tickLine={false} axisLine={false} width={44} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<ChartLegend content={<ChartLegendContent />} />
								<Bar isAnimationActive={false} dataKey="revenue" fill="var(--color-revenue)" radius={4} />
								<Bar isAnimationActive={false} dataKey="expenses" fill="var(--color-expenses)" radius={4} />
							</BarChart>
						</ChartContainer>
					</Card>

					<Card surface="bordered" title="Trend" description="A line, with the dashed tooltip indicator.">
						<ChartContainer config={CONFIG} label="Revenue and expenses trend, January to June">
							<LineChart data={REVENUE}>
								<CartesianGrid vertical={false} />
								{/* A point scale needs `padding`, or recharts drops the first tick at x=0. */}
								<XAxis dataKey="month" tickLine={false} axisLine={false} padding={{ left: 12, right: 12 }} />
								<ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
								<Line isAnimationActive={false} dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
								<Line isAnimationActive={false} dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} dot={false} />
							</LineChart>
						</ChartContainer>
					</Card>

					<GridCell span="full">
						<Card surface="bordered" title="Cumulative" description="An area, with the line indicator.">
							{/* A wide aspect: 16:9 across the page would be half a screen tall. */}
							<ChartContainer config={CONFIG} label="Cumulative revenue and expenses, January to June" style={{ "--chart-aspect": "48 / 9" } as CSSProperties}>
								<AreaChart data={REVENUE}>
									<CartesianGrid vertical={false} />
									{/* A point scale again — see the note on the line chart's axis. */}
									<XAxis dataKey="month" tickLine={false} axisLine={false} padding={{ left: 12, right: 12 }} />
									<ChartTooltip content={<ChartTooltipContent indicator="line" hideLabel />} />
									<Area
										isAnimationActive={false}
										dataKey="revenue"
										stroke="var(--color-revenue)"
										fill="var(--color-revenue)"
										fillOpacity={0.15}
										strokeWidth={2}
									/>
								</AreaChart>
							</ChartContainer>
						</Card>
					</GridCell>
				</Grid>
			</Example>

			<Example
				id="chart-sparkline"
				title="Sparkline"
				description="The shape of a series at a glance — no axes, no grid, no tooltip. Sized to sit inside a metric tile or a table cell, so it fills its box and the caller sizes the box. Animation is off by default: a screenful of tiles all drawing themselves at once reads as the page malfunctioning rather than as motion."
				stacked
				code={`<Sparkline data={[4, 9, 6, 12, 10, 17, 15, 22]} tone="success" label="Revenue, last eight weeks" />`}
			>
				<Grid columns={3} gap="xl">
					<GridCell>
						<Sparkline data={SPARK_UP} tone="success" label="Revenue, trending up" />
					</GridCell>
					<GridCell>
						<Sparkline data={SPARK_DOWN} tone="destructive" label="Churn, trending down" />
					</GridCell>
					<GridCell>
						<Sparkline data={SPARK_FLAT} label="Sessions, flat" />
					</GridCell>
				</Grid>
			</Example>

			<Example id="data-viz-rule" title="Colour comes from the theme" stacked>
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
