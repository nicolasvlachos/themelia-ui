/**
 * MetricComparison: this period against the last, and the gap. Both halves take
 * `MetricData`, so they format alike and the delta comes from raw values.
 */
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, EqualIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Badge } from "@/components/base/badge"
import { ContentBlock } from "@/components/base/display"
import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultMetricComparisonStrings, type MetricComparisonStrings } from "./analytics.strings"
import type { MetricData } from "./analytics.types"
import { formatMetricValue } from "./format-metric-value"
import styles from "./analytics.module.css"

export interface MetricComparisonProps extends Omit<ComponentProps<"div">, "children"> {
	current: MetricData
	previous: MetricData
	/** Names the periods, when they are worth stating.  */
	currentPeriod?: string
	previousPeriod?: string
	strings?: Partial<MetricComparisonStrings>
}

function toNumber(value: MetricData["value"]): number | null {
	if (value === null || value === undefined) return null
	if (typeof value === "number") return value
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : null
}

export function MetricComparison({
	current,
	previous,
	currentPeriod,
	previousPeriod,
	strings,
	className,
	...props
}: MetricComparisonProps) {
	const copy = { ...defaultMetricComparisonStrings, ...strings }

	const currentValue = toNumber(current.value)
	const previousValue = toNumber(previous.value)
	const comparable = currentValue !== null && previousValue !== null

	const delta = comparable ? currentValue - previousValue : 0
	/* No percentage from a previous value of zero. */
	const percent = comparable && previousValue !== 0 ? Math.round((delta / previousValue) * 100) : null

	const flat = delta === 0
	const up = delta > 0
	const Arrow = flat ? EqualIcon : up ? ArrowUpIcon : ArrowDownIcon
	const tone = flat ? "neutral" : up ? "positive" : "negative"

	/* Signed by the arrow, so the magnitude itself is unsigned. */
	const magnitude = formatMetricValue({ ...current, value: Math.abs(delta) })

	return (
		<div className={cx("metric-comparison--component", styles.comparison, className)} {...props}>
			{(currentPeriod != null || previousPeriod != null) && (
				<div className={styles.comparisonPeriods}>
					{currentPeriod != null && <Badge tone="secondary">{currentPeriod}</Badge>}
					{previousPeriod != null && <Badge tone="secondary">{previousPeriod}</Badge>}
				</div>
			)}

			<div className={styles.comparisonPair}>
				<ContentBlock surface="card" className={styles.comparisonBox}>
					<DisplayLabel>{copy.currentLabel}</DisplayLabel>
					<Text size="lg" weight="semibold" numeric lineHeight="tight">
						{formatMetricValue(current)}
					</Text>
				</ContentBlock>

				{/* Points across on a wide container and down on a narrow one, where the boxes stack. */}
				<div className={styles.comparisonArrow} aria-hidden="true">
					<ArrowRightIcon className={styles.comparisonArrowWide} />
					<ArrowDownIcon className={styles.comparisonArrowNarrow} />
				</div>

				<ContentBlock
					surface="card"
					className={cx(styles.comparisonBox, styles.comparisonBoxPrevious)}
				>
					<DisplayLabel>{copy.previousLabel}</DisplayLabel>
					<Text size="lg" weight="semibold" numeric lineHeight="tight" type="secondary">
						{formatMetricValue(previous)}
					</Text>
				</ContentBlock>
			</div>

			{comparable && (
				<div data-tone={tone} className={styles.comparisonDelta}>
					<span className={styles.comparisonChip}>
						<Arrow className={styles.comparisonChipIcon} aria-hidden="true" />
						<Text tag="span" size="xs" type="inherit" weight="semibold" numeric>
							{up ? "+" : flat ? "" : "−"}
							{magnitude}
						</Text>
					</span>
					{percent !== null && (
						<Text size="xs" type={flat ? "secondary" : "inherit"} numeric>
							{up ? "+" : flat ? "" : "−"}
							{Math.abs(percent)}%
						</Text>
					)}
					<Text size="xs" type="secondary">
						{copy.suffix}
					</Text>
				</div>
			)}
		</div>
	)
}
