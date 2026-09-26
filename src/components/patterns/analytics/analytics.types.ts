/**
 * One data shape, `MetricData`, for every metric surface, so a figure is formatted once
 * and moves between surfaces by changing the component alone.
 */
import type { LucideIcon } from "lucide-react"

import type { SemanticTone } from "@/lib/component-vocabulary"

/** How the figure should be formatted. `formatMetricValue` is the one place that decides. */
export type MetricValueType = "number" | "currency" | "percentage" | "duration" | "text"

/** Which way the figure moved against its baseline. */
export type MetricDirection = "up" | "down" | "neutral"

/**
 * Whether the movement is good news. Not the same as direction: for churn or error rate,
 * down is good.
 */
export type MetricTrend = "positive" | "negative" | "neutral"

/** Structural presentation. Every variant reads the same `MetricData`. */
export type MetricVariant =
	/** A flat tile, for use inside a bar or a grid that already owns the chrome. */
	| "default"
	/** Stands alone on the kit's Card surface. */
	| "card"
	/** One row: icon, label, value, chip. For a sidebar or a list. */
	| "compact"
	/** `Label: value ↑12%`, for a figure sitting inside a sentence. */
	| "minimal"
	/** A card panel whose border takes `tone`. */
	| "bordered"
	/** An inverse surface with a full-bleed sparkline along its foot. */
	| "accent"
	/** A segmented progress bar, driven by `progress`. */
	| "colored"

/** How the delta chip is drawn. */
export type MetricTrendVariant = "default" | "badge" | "compact" | "inline"

/** One entry in a period selector. */
export interface MetricPeriod {
	label: string
	value: string
}

/** The movement against the comparison period. */
export interface MetricChange {
	value: number | string
	direction: MetricDirection
	label?: string
}

export interface MetricData {
	/** Stable identity, for list keys. */
	id: string
	label: string
	/** `null` renders the empty marker rather than collapsing the tile. */
	value: number | string | null
	valueType?: MetricValueType
	/** ISO 4217, for `valueType: "currency"`. */
	currency?: string
	change?: MetricChange
	/** Points for the tile's sparkline, in chronological order. */
	sparkline?: readonly number[]
	icon?: LucideIcon
	/** Behind an info affordance on the label line. */
	tooltip?: string
	subtitle?: string
	footer?: string
	/**
	 * Overrides the trend the direction would imply. Set it for any metric where down is
	 * the good direction.
	 */
	trend?: MetricTrend
	onClick?: () => void
}

/** A named point on a time series. */
export interface MetricDataPoint {
	label: string
	value: number
}

/** The tone for the `bordered` and `colored` variants, from the kit's semantic vocabulary. */
export type MetricTone = SemanticTone
