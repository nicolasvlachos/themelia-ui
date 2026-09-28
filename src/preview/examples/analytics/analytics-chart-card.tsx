import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import type { ChartConfig } from "themelia-ui/base/chart"
import { ChartCard } from "themelia-ui/blocks/analytics"

import { SERIES } from "./data"

const CHART_CONFIG = {
	sessions: { label: "Sessions", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function AnalyticsChartCard() {
	return (
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
	)
}
