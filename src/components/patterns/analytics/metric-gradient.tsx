/**
 * MetricGradient: the hero metric, a gradient panel with an area chart bled into its foot.
 * Ramps come from the categorical chart palette, never state tokens.
 */
import { useId } from "react"
import type { ComponentProps } from "react"
import * as Recharts from "recharts"

import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import type { MetricChange, MetricDataPoint } from "./analytics.types"
import { MetricTrendChip } from "./metric-trend-chip"
import styles from "./analytics.module.css"

/** Four pairs off the categorical ramp. Named for the look, not for a meaning. */
export type MetricGradientTheme = "cool" | "violet" | "warm" | "ocean"

export interface MetricGradientProps extends Omit<ComponentProps<"div">, "children"> {
	title: string
	/** Already formatted — a hero figure is usually shaped by the page, not by a type hint. */
	value?: string
	change?: MetricChange
	data: readonly MetricDataPoint[]
	theme?: MetricGradientTheme
	subtitle?: string
}

export function MetricGradient({
	title,
	value,
	change,
	data,
	theme = "cool",
	subtitle,
	className,
	...props
}: MetricGradientProps) {
	/* Document-scoped `url(#id)`, so two heroes on one page need two ids. */
	const gradientId = `metric-gradient-${useId().replaceAll(":", "")}`

	return (
		<div
			data-theme-ramp={theme}
			/* A dark scope, like the accent panel (analytics.module.css). */
			data-theme="dark"
			className={cx("metric-gradient--component", styles.gradient, className)}
			{...props}
		>
			<div className={styles.gradientHead}>
				<div className={styles.gradientHeadText}>
					<DisplayLabel>{title}</DisplayLabel>
					{value != null && (
						<Text size="lg" weight="semibold" numeric lineHeight="tight">
							{value}
						</Text>
					)}
					{/* The main role, not secondary: a muted grey is unreadable over a ramp. */}
					{subtitle != null && (
						<Text size="xs">
							{subtitle}
						</Text>
					)}
				</div>
				{change && <MetricTrendChip change={change} variant="badge" className={styles.gradientChip} />}
			</div>

			<div className={styles.gradientPlot}>
				<Recharts.ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
					<Recharts.AreaChart data={data as MetricDataPoint[]} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
						<defs>
							<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.3} />
								<stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
							</linearGradient>
						</defs>
						<Recharts.Area
							type="monotone"
							dataKey="value"
							stroke="var(--muted-foreground)"
							strokeWidth={2}
							fill={`url(#${gradientId})`}
							dot={false}
							activeDot={false}
							isAnimationActive={false}
						/>
					</Recharts.AreaChart>
				</Recharts.ResponsiveContainer>
			</div>
		</div>
	)
}
