/**
 * MetricBar: a strip of KPIs divided by hairlines. Stacks on a narrow container and becomes
 * columns on a wide one (a container query).
 */
import { CalendarIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/base/buttons"
import { ContentBlock } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import type { MetricData, MetricPeriod } from "./analytics.types"
import { Metric } from "./metric"
import styles from "./analytics.module.css"

export interface MetricBarProps extends Omit<ComponentProps<"div">, "children"> {
	metrics: MetricData[]
	/** Shows a period control in a band above the cells. */
	period?: MetricPeriod
	onPeriodChange?: (value: string) => void
	showSparklines?: boolean
	showChanges?: boolean
	/** A quiet line under the strip — a caveat, a freshness note. */
	footerText?: string
}

export function MetricBar({
	metrics,
	period,
	onPeriodChange,
	showSparklines = true,
	showChanges = true,
	footerText,
	className,
	...props
}: MetricBarProps) {
	return (
		<ContentBlock
			surface="card"
			/* Flush, so the hairlines reach the border; the cells pay the inset. */
			flush
			className={cx("metric-bar--component", styles.metricBar, className)}
			{...props}
		>
			<div className={styles.metricBarRow}>
				{period && (
					<div className={styles.metricBarPeriod}>
						<Button
							tone="secondary"
							buttonStyle="ghost"
							onClick={onPeriodChange ? () => onPeriodChange(period.value) : undefined}
						>
							<CalendarIcon aria-hidden="true" />
							{period.label}
						</Button>
					</div>
				)}
				{/* One grid for all cells, so their parts line up across the strip. */}
				<div className={styles.metricBarCells}>
					{metrics.map((metric) => (
						<div key={metric.id} className={styles.metricBarCell}>
							<Metric
								data={metric}
								variant="default"
								showSparkline={showSparklines}
								showChange={showChanges}
							/>
						</div>
					))}
				</div>
			</div>
			{footerText != null && (
				<div className={styles.metricBarFooter}>
					<Text size="xs" type="secondary">
						{footerText}
					</Text>
				</div>
			)}
		</ContentBlock>
	)
}
