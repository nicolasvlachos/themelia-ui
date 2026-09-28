/**
 * ChartCard: heading, description and footer around a chart the caller owns, plus the
 * ChartContainer colour wiring. No surface unless the caller asks for one.
 */
import type { ComponentProps, ReactNode } from "react"

import { ChartContainer, type ChartConfig } from "@/components/base/chart"
import { ContentBlock } from "@/components/base/display"
import { cx } from "@/lib/cx"

import styles from "./analytics.module.css"

export interface ChartCardProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	config: ChartConfig
	/** The Recharts composition. */
	children: ComponentProps<typeof ChartContainer>["children"]
	/** Below the plot — a legend note, a source, a caveat. */
	footer?: ReactNode
}

export function ChartCard({ config, children, footer, className, ...props }: ChartCardProps) {
	return (
		<ContentBlock className={cx("chart-card--component", className)} {...props}>
			<ChartContainer
				config={config}
				/* A plain-text card title is the chart's name for a screen reader. */
				label={typeof props.title === "string" ? props.title : undefined}
				className={cx("chart-card--chart", styles.chartCardChart)}
			>
				{children}
			</ChartContainer>
			{footer != null && <div className={styles.chartCardFooter}>{footer}</div>}
		</ContentBlock>
	)
}
