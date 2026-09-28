/**
 * Analytics blocks: every metric, KPI and activity surface, all driven by `MetricData`.
 * Recharts is a peer dependency of this subpath and `base/chart` only.
 */
export type {
	MetricChange, MetricData, MetricDataPoint, MetricDirection, MetricPeriod,
	MetricTone, MetricTrend, MetricTrendVariant, MetricValueType, MetricVariant,
} from "./analytics.types"

export {
	defaultAnalyticsStrings, defaultActivityHeatmapStrings,
	defaultMetricComparisonStrings, defaultTimeRulerStrings,
	type AnalyticsStrings, type ActivityHeatmapStrings,
	type MetricComparisonStrings, type TimeRulerStrings,
} from "./analytics.strings"

export { formatMetricValue, resolveTrend } from "./format-metric-value"

export { Metric, type MetricProps } from "./metric"
export { MetricTrendChip, type MetricTrendChipProps } from "./metric-trend-chip"
export { MetricSkeleton, type MetricSkeletonProps } from "./metric-skeleton"
export { MetricBar, type MetricBarProps } from "./metric-bar"
export { MetricGrid, type MetricGridProps, type MetricGridColumns } from "./metric-grid"
export { MetricComparison, type MetricComparisonProps } from "./metric-comparison"
export {
	MetricMicroGrid,
	type MetricMicroGridProps, type MicroChartKind, type MicroMetricCell,
} from "./metric-micro-grid"
export { MetricGradient, type MetricGradientProps, type MetricGradientTheme } from "./metric-gradient"
export {
	ActivityHeatmap,
	type ActivityHeatmapProps, type ActivityHeatmapDay, type ActivityLevel,
} from "./activity-heatmap"
export { ChartCard, type ChartCardProps } from "./chart-card"
export { TimeRuler, type TimeRulerProps } from "./time-ruler"
