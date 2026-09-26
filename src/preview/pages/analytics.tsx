import { CreditCardIcon, PackageIcon, TrendingUpIcon, UsersIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import type { ChartConfig } from "@/components/base/chart"
import {
	ActivityHeatmap, ChartCard, Metric, MetricBar, MetricComparison, MetricGradient,
	MetricGrid, MetricMicroGrid, TimeRuler,
	type ActivityHeatmapDay, type ActivityLevel, type MetricData,
} from "@/components/patterns/analytics"
import { Stack } from "@/components/base/structure"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const REVENUE: MetricData = {
	id: "revenue",
	label: "Revenue",
	value: 48_200,
	valueType: "currency",
	currency: "EUR",
	change: { value: "12.4%", direction: "up" },
	sparkline: [18, 22, 19, 27, 24, 31, 29, 38],
	icon: CreditCardIcon,
	subtitle: "Net of refunds",
}

const CHURN: MetricData = {
	id: "churn",
	label: "Churn",
	value: 0.038,
	valueType: "percentage",
	/* Down is the GOOD direction here, so the trend is stated rather than inferred. */
	change: { value: "0.6pp", direction: "down" },
	trend: "positive",
	sparkline: [9, 8, 8, 6, 7, 5, 5, 4],
	icon: UsersIcon,
}

const ORDERS: MetricData = {
	id: "orders",
	label: "Orders",
	value: 1_284,
	valueType: "number",
	change: { value: "3.1%", direction: "down" },
	sparkline: [40, 38, 41, 36, 34, 35, 31, 30],
	icon: PackageIcon,
}

const FULFILMENT: MetricData = {
	id: "fulfilment",
	label: "Median fulfilment",
	value: 5_400,
	valueType: "duration",
	change: { value: "0", direction: "neutral" },
	icon: TrendingUpIcon,
	footer: "Across all warehouses",
}

const METRICS = [REVENUE, CHURN, ORDERS, FULFILMENT]

const CHART_CONFIG = {
	sessions: { label: "Sessions", color: "var(--chart-1)" },
} satisfies ChartConfig

const SERIES = [
	{ month: "Mar", sessions: 3_100 },
	{ month: "Apr", sessions: 3_800 },
	{ month: "May", sessions: 3_400 },
	{ month: "Jun", sessions: 4_600 },
	{ month: "Jul", sessions: 4_200 },
	{ month: "Aug", sessions: 5_300 },
]

const HERO = SERIES.map((point) => ({ label: point.month, value: point.sessions }))

/* A fixed, cyclic pattern, not random data, for stable visual baselines. */
const HEATMAP: ActivityHeatmapDay[] = Array.from({ length: 182 }, (_, index) => {
	const date = new Date("2026-03-02T00:00:00")
	date.setDate(date.getDate() + index)
	const weekday = date.getDay()
	const level = (weekday === 0 || weekday === 6 ? index % 2 : (index % 5) + 1) as ActivityLevel
	return { date: date.toISOString().slice(0, 10), level: Math.min(level, 4) as ActivityLevel }
})

const HOURS = [
	0, 0, 0, 0, 1, 2, 5, 9, 14, 18, 22, 25,
	24, 19, 21, 23, 20, 16, 12, 9, 6, 4, 2, 1,
]

const MICRO = [
	{ label: "Sessions", value: "18.2k", data: [4, 9, 6, 12, 10, 17] },
	{ label: "Signups", value: "412", data: [2, 5, 4, 8, 7, 11] },
	{ label: "Activation", value: "63%", data: [3, 6, 5, 9, 8, 12] },
	{ label: "Seats used", value: "84 / 120", data: [84, 120] },
	{ label: "Retention", value: "91%", data: [6, 7, 7, 9, 10, 12] },
	{ label: "Plan mix", value: "3 tiers", data: [5, 3, 2] },
]

export function AnalyticsPage() {
	return (
		<ComponentPage
			title="Analytics"
			summary="Every metric surface in the kit, on one data shape. A figure written as MetricData renders in a strip, a grid, a hero card or a comparison without being remapped — so the formatting, the trend inference and the empty case are decided once instead of at each call site."
			importPath="@/components/patterns/analytics"
			exports={["Metric", "MetricBar", "MetricGrid", "MetricComparison", "ActivityHeatmap", "ChartCard", "TimeRuler",
				"MetricMicroGrid", "MetricGradient", "MetricTrendChip", "MetricSkeleton",
			]}
		>
			<Example
				id="analytics-bar"
				title="Metric bar"
				description="A strip of KPIs divided by hairlines. The dividers are what make four numbers read as one module rather than four cards that happen to be adjacent. The period sits in a band above the cells rather than in a column beside them, so every figure gets its full share of the width. It stacks to rows on a narrow container — a container query, because a bar above a table is as likely to sit in a drawer as to span the page."
				stacked
				code={`<MetricBar
  metrics={metrics}
  period={{ label: "Last 30 days", value: "30d" }}
  footerText="Updated 10 minutes ago"
/>`}
			>
				<MetricBar
					metrics={METRICS}
					period={{ label: "Last 30 days", value: "30d" }}
					footerText="Updated 10 minutes ago"
				/>
			</Example>

			<Example
				id="analytics-grid"
				title="Metric grid"
				description="The same four metrics as standalone cards, with the same label, figure and delta steps as the bar. Column counts break against the grid's own width, not the viewport's: four sit two by two until a quarter of the row can hold a currency figure without cutting it, and six metrics in a 300px rail would otherwise render as six 40px columns."
				stacked
				code={`<MetricGrid metrics={metrics} variant="card" />`}
			>
				<MetricGrid metrics={METRICS} variant="card" />
			</Example>

			<Example
				id="analytics-variants"
				title="Seven variants, one shape"
				description="Every variant reads the same MetricData, so moving a figure between them is a prop change. There is no size prop: the kit has one `--scale`, and a metric inside a compact scope is already smaller. Note where tone is NOT used — a revenue figure reports no state, and painting a grid of them one colour is the trap of treating semantic state tokens as a palette. Tone marks the colored variant, whose segments genuinely track progress."
				stacked
				code={`<Metric data={revenue} variant="bordered" />`}
			>
				<Stack gap="xl">
					<MetricGrid metrics={[REVENUE, CHURN]} variant="bordered" columns={2} />
					<MetricGrid metrics={[ORDERS, FULFILMENT]} variant="compact" columns={2} />
					<MetricGrid metrics={[REVENUE, CHURN]} variant="accent" columns={2} />
					<Metric data={ORDERS} variant="colored" tone="primary" progress={62} />
					<Metric data={REVENUE} variant="minimal" />
				</Stack>
			</Example>

			<Example
				id="analytics-comparison"
				title="Comparison"
				description="This period against the last one, and the gap between them. The delta is computed from the raw values, not from the formatted strings — reading numbers back out of '€1,240' is how a comparison quietly stops comparing."
				stacked
				code={`<MetricComparison
  current={{ id: "c", label: "Revenue", value: 48200, valueType: "currency", currency: "EUR" }}
  previous={{ id: "p", label: "Revenue", value: 42900, valueType: "currency", currency: "EUR" }}
  currentPeriod="Aug 2026"
  previousPeriod="Jul 2026"
/>`}
			>
				<MetricComparison
					current={{ id: "c", label: "Revenue", value: 48_200, valueType: "currency", currency: "EUR" }}
					previous={{ id: "p", label: "Revenue", value: 42_900, valueType: "currency", currency: "EUR" }}
					currentPeriod="Aug 2026"
					previousPeriod="Jul 2026"
				/>
			</Example>

			<Example
				id="analytics-hero"
				title="Gradient hero"
				description="The one metric on a page allowed to shout. Its ramps come from the categorical chart palette, never the state tokens — a hero card reports no success and no warning, and painting it `--success` would repaint it whenever a consumer retunes the colour that means things went right."
				stacked
				code={`<MetricGradient title="Sessions" value="18,204" data={points} theme="ocean" />`}
			>
				<MetricGradient
					title="Sessions this quarter"
					value="18,204"
					subtitle="Across every channel"
					change={{ value: "9.2%", direction: "up" }}
					data={HERO}
					theme="ocean"
				/>
			</Example>

			<Example
				id="analytics-micro"
				title="Micro grid"
				description="Six dense cells, each pairing a figure with a different sketch. Deliberately not six sparklines — when every cell draws the same shape, a reader scanning the block has nothing to tell them apart by except the label."
				stacked
				code={`<MetricMicroGrid cells={cells} />`}
			>
				<MetricMicroGrid cells={MICRO} />
			</Example>

			<Example
				id="analytics-chart-card"
				title="Chart card"
				description="The kit's heading and description around a chart the caller owns. Card-free until the call site asks for a surface, so dropping one into a panel that already has chrome does not nest two borders."
				stacked
				code={`<ChartCard title="Sessions" config={config} surface="bordered">
  <AreaChart data={series}>…</AreaChart>
</ChartCard>`}
			>
				<ChartCard
					title="Sessions"
					description="Six months, all channels."
					config={CHART_CONFIG}
					surface="bordered"
				>
					<AreaChart data={SERIES}>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="month" tickLine={false} axisLine={false} />
						<Area dataKey="sessions" type="monotone" stroke="var(--color-sessions)" fill="var(--color-sessions)" fillOpacity={0.2} />
					</AreaChart>
				</ChartCard>
			</Example>

			<Example
				id="analytics-heatmap"
				title="Activity heatmap"
				description="Half a year of daily activity as Monday-aligned columns. Month labels are placed by week index and thinned to a three-week minimum gap — without the thinning, a month starting mid-week puts its label a few pixels from the last one and the two overlap into a smear."
				stacked
				code={`<ActivityHeatmap data={days} />`}
			>
				<ActivityHeatmap data={HEATMAP} />
			</Example>

			<Example
				id="analytics-ruler"
				title="Time ruler"
				description="Twenty-four hours as one bar, shaded by how busy each was. Four bands rather than a continuous ramp: a reader cannot rank 24 shades, but can rank four. The peak hour is ringed and the marker pins the current hour."
				stacked
				code={`<TimeRuler hours={hours} currentHour={14} />`}
			>
				<TimeRuler hours={HOURS} currentHour={14} />
			</Example>

			<Example id="analytics-props" title="Props">
				<Callout>
					A metric where <em>down</em> is the good direction — churn, refunds, latency —
					sets <code>trend</code> explicitly. Direction is a fact about the number; tone is
					a judgement about it, and inferring the second from the first paints a falling
					churn rate red.
				</Callout>
				<PropTable owner="Metric"
					rows={[
						{ name: "data", type: "MetricData", required: true, description: "id, label, value, and optionally valueType, currency, change, sparkline, icon, subtitle, footer, trend. One shape for every surface here." },
						{ name: "variant", type: '"default" | "card" | "compact" | "minimal" | "bordered" | "accent" | "colored"', default: '"default"', description: "Structural only — each reads the same data." },
						{ name: "tone", type: "SemanticTone", default: '"neutral"', description: "Tints the bordered and colored variants. The kit's vocabulary, so never `danger` or `default`." },
						{ name: "showSparkline / showChange / showIcon", type: "boolean", default: "true", description: "Drops a part the surrounding surface already states." },
						{ name: "loading / error", type: "boolean", default: "false", description: "Loading reserves the resolved tile's height per variant, so a grid does not jump when data lands." },
						{ name: "progress", type: "number", default: "0", description: "0–100. `colored` only — drives the segmented bar." },
						{ name: "data.valueType", type: '"number" | "currency" | "percentage" | "duration" | "text"', description: "How formatMetricValue renders the figure. Currency shows the code rather than the symbol, because an admin screen routinely shows several at once and '$' does not say which dollar." },
						{ name: "MetricGrid columns", type: '"auto" | 1 | 2 | 3 | 4 | 6', default: '"auto"', description: "auto picks the break points from the cell count." },
						{ name: "MetricMicroGrid", type: "component", description: "Six dense cells, each pairing a figure with a different sketch \u2014 deliberately not six sparklines, because when every cell draws the same shape a reader scanning the block has nothing to tell them apart by except the label. One accent across the whole block: the SHAPE is the differentiator, and a hue per cell adds a second, weaker one." },
						{ name: "MetricGradient", type: "component", description: "The one metric on a page allowed to shout. Its ramps come from the categorical chart palette, never the state tokens \u2014 a hero reports no success and no warning, and painting it `--success` would repaint it whenever a consumer retunes the colour that means things went right." },
						{ name: "MetricTrendChip", type: "component", description: "The delta beside a figure. Direction and tone are separate props on purpose: direction is a fact about the number, tone is a judgement about it, and for churn, refunds or latency the two disagree. A chip deriving its colour from the arrow would paint a rising error rate green." },
						{ name: "MetricSkeleton", type: "component", description: "The placeholder a Metric shows while its figure is in flight, per variant \u2014 a single generic block would be the wrong height for five of the seven, and the reflow that causes is the thing a skeleton exists to avoid." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
