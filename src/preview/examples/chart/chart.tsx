import type { CSSProperties } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Card } from "themelia-ui/base/cards"
import {
	ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "themelia-ui/base/chart"
import { Grid, GridCell } from "themelia-ui/base/structure"

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

export default function Chart() {
	return (
		/* Two columns, with the third chart spanning both. */
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
	)
}
