/**
 * MetricGrid: a row of metrics that breaks against its own width (container queries). The
 * root is the container; the grid inside it reacts.
 */
import type { ComponentProps } from "react"

import { cx } from "@/lib/cx"

import type { MetricData, MetricTone, MetricVariant } from "./analytics.types"
import { Metric } from "./metric"
import styles from "./analytics.module.css"

/** `auto` picks the break points from the cell count, which is right most of the time. */
export type MetricGridColumns = "auto" | 1 | 2 | 3 | 4 | 6

export interface MetricGridProps extends Omit<ComponentProps<"div">, "children"> {
	metrics: MetricData[]
	/** Forwarded to every cell. */
	variant?: Extract<MetricVariant, "card" | "compact" | "bordered" | "accent" | "colored">
	tone?: MetricTone
	columns?: MetricGridColumns
	showSparklines?: boolean
	showChanges?: boolean
	showIcons?: boolean
	loading?: boolean
}

/* Four goes 2×2 before going wide; five and six start paired on a phone. */
function autoColumns(count: number): 1 | 2 | 3 | 4 | 6 {
	if (count <= 1) return 1
	if (count === 2) return 2
	if (count === 3) return 3
	if (count === 4) return 4
	if (count <= 6) return 6
	return 4
}

export function MetricGrid({
	metrics,
	variant = "card",
	tone = "neutral",
	columns = "auto",
	showSparklines = true,
	showChanges = true,
	showIcons = true,
	loading = false,
	className,
	...props
}: MetricGridProps) {
	const resolved = columns === "auto" ? autoColumns(metrics.length) : columns

	return (
		<div className={cx("metric-grid--component", styles.metricGridRoot, className)} {...props}>
			<div data-columns={resolved} className={cx("metric-grid--grid", styles.metricGrid)}>
				{metrics.map((metric) => (
					<Metric
						key={metric.id}
						data={metric}
						variant={variant}
						tone={tone}
						showSparkline={showSparklines}
						showChange={showChanges}
						showIcon={showIcons}
						loading={loading}
					/>
				))}
			</div>
		</div>
	)
}
