/** The one place a metric's figure becomes a string, so every surface formats it alike. */
import { EMPTY, formatCurrency, formatDuration, formatNumber, formatPercentage } from "@/lib/format"

import type { MetricData, MetricTrend } from "./analytics.types"

export function formatMetricValue(data: MetricData): string {
	if (data.value === null || data.value === undefined) return EMPTY

	const numeric = typeof data.value === "number" ? data.value : null
	// A value that is already a string has been formatted by whoever supplied it.
	if (numeric === null) return String(data.value)

	switch (data.valueType) {
		case "currency":
			/*
			 * The code, not the symbol ("$" does not say which dollar). Intl's non-breaking
			 * space is replaced so the figure can wrap.
			 */
			return formatCurrency(numeric, { currency: data.currency, currencyDisplay: "code" })
				.replace(/ /g, " ")
		case "percentage":
			return formatPercentage(numeric)
		case "duration":
			return formatDuration(numeric)
		case "number":
			return formatNumber(numeric)
		case "text":
		default:
			return String(numeric)
	}
}

/**
 * The effective trend: an explicit `trend` wins, otherwise the direction implies it. Set
 * `trend` where down is good (churn, latency).
 */
export function resolveTrend(data: MetricData): MetricTrend {
	if (data.trend) return data.trend
	if (data.change?.direction === "up") return "positive"
	if (data.change?.direction === "down") return "negative"
	return "neutral"
}
