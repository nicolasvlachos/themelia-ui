/**
 * Metric: one figure, seven arrangements. Every variant reads the same `MetricData`, so
 * formatting and trend inference are decided once. No `size` prop: `--scale` covers it.
 */
import { InfoIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Sparkline } from "@/components/base/chart"
import { Card } from "@/components/base/cards"
import { ContentBlock, IconBadge } from "@/components/base/display"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/base/tooltip"
import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultAnalyticsStrings, type AnalyticsStrings } from "./analytics.strings"
import type { MetricData, MetricTone, MetricTrend, MetricVariant } from "./analytics.types"
import { formatMetricValue, resolveTrend } from "./format-metric-value"
import { MetricSkeleton } from "./metric-skeleton"
import { MetricTrendChip } from "./metric-trend-chip"
import styles from "./analytics.module.css"

/** How many segments the `colored` variant's bar is divided into. */
const SEGMENTS = 16

export interface MetricProps extends Omit<ComponentProps<"div">, "children"> {
	data: MetricData
	variant?: MetricVariant
	/** Tints the `bordered` and `colored` variants. */
	tone?: MetricTone
	showSparkline?: boolean
	showChange?: boolean
	showIcon?: boolean
	loading?: boolean
	error?: boolean
	/** Overrides this block's own copy. */
	strings?: Partial<AnalyticsStrings>
	/** `colored` only — 0–100. */
	progress?: number
}

/** The sparkline takes the metric's trend, so the curve agrees with the chip beside it. */
const SPARK_TONE: Record<MetricTrend, "success" | "destructive" | "neutral"> = {
	positive: "success",
	negative: "destructive",
	neutral: "neutral",
}

export function Metric({
	data,
	variant = "default",
	tone = "neutral",
	showSparkline = true,
	showChange = true,
	showIcon = true,
	loading = false,
	error = false,
	strings,
	progress = 0,
	className,
	...props
}: MetricProps) {
	const copy = { ...defaultAnalyticsStrings, ...strings }
	const value = formatMetricValue(data)
	const trend = resolveTrend(data)
	const Icon = data.icon
	const hasSpark = showSparkline && !!data.sparkline?.length
	const hasChange = showChange && !!data.change

	const root = cx("metric--component", styles.metric, className)

	if (loading) return <MetricSkeleton variant={variant} className={root} />

	if (error) {
		return (
			<ContentBlock
				surface="card"
				data-variant={variant}
				className={cx(root, styles.metricError)}
				{...props}
			>
				<Text type="secondary">{copy.metricErrorLabel}</Text>
			</ContentBlock>
		)
	}

	const spark = hasSpark ? (
		<Sparkline
			data={data.sparkline!}
			tone={SPARK_TONE[trend]}
			className={cx("metric--sparkline", styles.metricSpark)}
		/>
	) : null

	const chip = (chipVariant: "badge" | "compact" | "inline" | "default") =>
		hasChange ? <MetricTrendChip change={data.change!} trend={data.trend} variant={chipVariant} /> : null

	/* ── minimal: a figure inside a sentence, so a span rather than a box ── */
	if (variant === "minimal") {
		return (
			<span
				data-variant="minimal"
				className={cx(root, styles.metricMinimal)}
				{...(props as ComponentProps<"span">)}
			>
				<DisplayLabel className="metric--label">{data.label}:</DisplayLabel>
				<Text tag="span" weight="semibold" numeric className="metric--value">
					{value}
				</Text>
				{chip("inline")}
			</span>
		)
	}

	/*
	 * ── card: the kit's Card for the surface, the metric's own anatomy inside it ──
	 * The label is a DisplayLabel, not the Card's title; the delta gets its own line under
	 * the figure so every card in a row keeps one arrangement.
	 */
	if (variant === "card") {
		return (
			<Card data-variant="card" className={cx(root, styles.metricCard)} onClick={data.onClick} {...props}>
				<div className={styles.metricCardBody}>
					<span className={styles.metricLabelGroup}>
						{showIcon && Icon && <Icon className={styles.metricLabelIcon} aria-hidden="true" />}
						<DisplayLabel className="metric--label">
							{data.label}
						</DisplayLabel>
						{!!data.tooltip && (
							<Tooltip>
								<TooltipTrigger
									render={
										<button
											type="button"
											data-hit-area
											className={styles.metricInfo}
											aria-label={copy.metricInfoLabel ?? defaultAnalyticsStrings.metricInfoLabel}
										/>
									}
								>
									<InfoIcon aria-hidden="true" />
								</TooltipTrigger>
								<TooltipContent>{data.tooltip}</TooltipContent>
							</Tooltip>
						)}
					</span>
					<Text size="lg" weight="semibold" numeric lineHeight="tight" truncate title={value} className="metric--value">
						{value}
					</Text>
					{(hasChange || data.subtitle != null) && (
						<div className={styles.metricDelta}>
							{chip("badge")}
							{data.subtitle != null && (
								<Text tag="span" size="xs" type="secondary" className="metric--subtitle">
									{data.subtitle}
								</Text>
							)}
						</div>
					)}
				</div>
				{spark}
				{data.footer != null && (
					<Text size="xs" type="secondary" className="metric--footer">
						{data.footer}
					</Text>
				)}
			</Card>
		)
	}

	/* ── compact: one row, for a rail or a list ── */
	if (variant === "compact") {
		return (
			<div data-variant="compact" className={cx(root, styles.metricCompact)} {...props}>
				{showIcon && Icon && <IconBadge icon={Icon} aria-hidden="true" />}
				<div className={styles.metricCompactBody}>
					<DisplayLabel className="metric--label">
						{data.label}
					</DisplayLabel>
					<Text weight="semibold" numeric lineHeight="tight" className="metric--value">
						{value}
					</Text>
				</div>
				{chip("badge")}
			</div>
		)
	}

	/* ── accent: an inverse surface with the sparkline bled to its foot ── */
	if (variant === "accent") {
		return (
			<div
				data-variant="accent"
				/* A dark scope: tokens inside re-derive, the trend chip's included. */
				data-theme="dark"
				className={cx(root, styles.metricAccent)}
				{...props}
			>
				<div className={styles.metricAccentBody}>
					<div className={styles.metricHead}>
						<DisplayLabel className="metric--label">
							{data.label}
						</DisplayLabel>
						{showIcon && Icon && <IconBadge icon={Icon} aria-hidden="true" />}
					</div>
					<div className={styles.metricValueRow}>
						<Text size="lg" weight="semibold" numeric lineHeight="tight" className="metric--value">
							{value}
						</Text>
						{chip("compact")}
					</div>
					{data.subtitle != null && (
						<Text size="xs" className="metric--subtitle">
							{data.subtitle}
						</Text>
					)}
				</div>
				{spark}
			</div>
		)
	}

	/* ── colored: the figure plus how far along it is ── */
	if (variant === "colored") {
		const clamped = Math.min(Math.max(progress, 0), 100)
		const filled = Math.round((clamped / 100) * SEGMENTS)
		return (
			<ContentBlock
				surface="card"
				data-variant="colored"
				data-tone={tone}
				className={cx(root, styles.metricPanel)}
				{...props}
			>
				<div className={styles.metricHead}>
					<DisplayLabel className="metric--label">
						{data.label}
					</DisplayLabel>
					<span className={styles.metricDot} aria-hidden="true" />
				</div>
				<div className={styles.metricValueRow}>
					<Text size="lg" weight="semibold" numeric lineHeight="tight" className="metric--value">
						{value}
					</Text>
					{data.subtitle != null && (
						<Text size="xs" type="secondary" className="metric--subtitle">
							{data.subtitle}
						</Text>
					)}
				</div>
				<div
					className={styles.metricSegments}
					role="progressbar"
					aria-label={copy.metricProgressLabel(data.label)}
					aria-valuenow={clamped}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					{Array.from({ length: SEGMENTS }, (_, index) => (
						<span key={index} data-filled={index < filled ? "" : undefined} className={styles.metricSegment} />
					))}
				</div>
				{chip("default")}
				{data.footer != null && (
					<Text size="xs" type="secondary" className="metric--footer">
						{data.footer}
					</Text>
				)}
			</ContentBlock>
		)
	}

	/* ── bordered: a panel with a toned border ── */
	if (variant === "bordered") {
		return (
			<ContentBlock
				surface="card"
				data-variant="bordered"
				data-tone={tone}
				className={cx(root, styles.metricPanel)}
				{...props}
			>
				<div className={styles.metricHead}>
					<span className={styles.metricLabelGroup}>
						{showIcon && Icon && <Icon className={styles.metricLabelIcon} aria-hidden="true" />}
						<DisplayLabel className="metric--label">
							{data.label}
						</DisplayLabel>
					</span>
					{chip("badge")}
				</div>
				<Text size="lg" weight="semibold" numeric lineHeight="tight" className="metric--value">
					{value}
				</Text>
				{data.subtitle != null && (
					<Text size="xs" type="secondary" className="metric--subtitle">
						{data.subtitle}
					</Text>
				)}
				{spark}
				{data.footer != null && (
					<Text size="xs" type="secondary" className="metric--footer">
						{data.footer}
					</Text>
				)}
			</ContentBlock>
		)
	}

	/*
	 * ── default: a flat tile, for a bar or a grid that owns the chrome ──
	 * Each part carries a class so MetricBar can place it on its row of the shared grid,
	 * whichever parts are missing.
	 */
	return (
		<div data-variant="default" className={cx(root, styles.metricTile)} {...props}>
			<span className={cx(styles.metricLabelGroup, styles.tileLabel)}>
				{showIcon && Icon && <Icon className={styles.metricLabelIcon} aria-hidden="true" />}
				<DisplayLabel className="metric--label">
					{data.label}
				</DisplayLabel>
			</span>
			{/* Truncates rather than running into the next cell; `title` carries the full figure. */}
			<Text
				size="lg"
				weight="semibold"
				numeric
				lineHeight="tight"
				truncate
				title={value}
				className={cx("metric--value", styles.tileValue)}
			>
				{value}
			</Text>
			{hasChange && (
				<MetricTrendChip
					change={data.change!}
					trend={data.trend}
					variant="compact"
					className={styles.tileChange}
				/>
			)}
			{data.subtitle != null && (
				<Text size="xs" type="secondary" className={cx("metric--subtitle", styles.tileSubtitle)}>
					{data.subtitle}
				</Text>
			)}
			{spark}
			{data.footer != null && (
				<Text size="xs" type="secondary" className={cx("metric--footer", styles.tileFooter)}>
					{data.footer}
				</Text>
			)}
		</div>
	)
}
