/**
 * MetricTrendChip: the ↑ / ↓ / → delta beside a figure. Direction (a fact) and trend (a
 * judgement) are separate, since for churn or latency they disagree.
 */
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Text } from "@/components/base/typography"
import type { SemanticTone } from "@/lib/component-vocabulary"
import { cx } from "@/lib/cx"

import type { MetricChange, MetricDirection, MetricTrend, MetricTrendVariant } from "./analytics.types"
import styles from "./analytics.module.css"

export interface MetricTrendChipProps extends Omit<ComponentProps<"span">, "children"> {
	change: MetricChange
	/** Overrides the tone the direction would imply. */
	trend?: MetricTrend
	variant?: MetricTrendVariant
}

const ICON = {
	up: ArrowUpIcon,
	down: ArrowDownIcon,
	neutral: MinusIcon,
} as const

function trendFor(trend: MetricTrend | undefined, direction: MetricDirection): MetricTrend {
	if (trend) return trend
	if (direction === "up") return "positive"
	if (direction === "down") return "negative"
	return "neutral"
}

/* The judgement reaches the stylesheet as the kit's tone, through the shared tone rule. */
const TONE: Record<MetricTrend, Extract<SemanticTone, "success" | "destructive" | "neutral">> = {
	positive: "success",
	negative: "destructive",
	neutral: "neutral",
}

/**
 * The delta beside a figure. Direction and tone are separate props on purpose: the direction
 * in `change` is a fact about the number, `trend` is a judgement about it, and for churn,
 * refunds or latency the two disagree. A chip that could only derive its colour from the
 * arrow would paint a rising error rate green.
 */
export function MetricTrendChip({
	change,
	trend,
	variant = "default",
	className,
	...props
}: MetricTrendChipProps) {
	const tone = TONE[trendFor(trend, change.direction)]
	const Icon = ICON[change.direction]
	/* Only a rise is signed: a fall's formatted magnitude may already carry a minus. */
	const sign = change.direction === "up" ? "+" : ""

	return (
		<span
			data-tone={tone}
			data-variant={variant}
			className={cx("metric-trend-chip--component", styles.trendChip, className)}
			{...props}
		>
			{variant !== "inline" && <Icon className={styles.trendChipIcon} aria-hidden="true" />}
			{/* `inherit`, so the text takes the chip's tone. */}
			<Text tag="span" type="inherit" size="xs" weight="medium" numeric className="metric-trend-chip--value">
				{sign}
				{change.value}
			</Text>
			{change.label != null && (
				<Text tag="span" size="xs" type="secondary" className="metric-trend-chip--label">
					{change.label}
				</Text>
			)}
		</span>
	)
}
