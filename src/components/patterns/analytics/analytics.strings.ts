/**
 * Copy owned by the analytics blocks. Day and month names are here, not derived from the
 * date-fns locale: the heatmap needs abbreviations sized to its columns.
 */
export interface AnalyticsStrings {
	/** Shown in place of the figure when `error` is set. */
	metricErrorLabel: string
	/** Names the `colored` variant's progress bar for a screen reader. */
	metricProgressLabel: (label: string) => string
	/**
	 * Names the info affordance beside a label that carries a `tooltip`. Optional for
	 * backward compatibility; the default applies.
	 */
	metricInfoLabel?: string
}

export const defaultAnalyticsStrings: AnalyticsStrings = {
	metricErrorLabel: "Unable to load metric",
	metricProgressLabel: (label) => `${label} progress`,
	metricInfoLabel: "More information",
}

export interface MetricComparisonStrings {
	currentLabel: string
	previousLabel: string
	/** Follows the percentage — "12% vs previous". */
	suffix: string
}

export const defaultMetricComparisonStrings: MetricComparisonStrings = {
	currentLabel: "This period",
	previousLabel: "Previous period",
	suffix: "vs previous",
}

export interface ActivityHeatmapStrings {
	/** Monday first, and blanks are deliberate — every other row is unlabelled. */
	dayLabels: readonly [string, string, string, string, string, string, string]
	monthNames: readonly [
		string, string, string, string, string, string,
		string, string, string, string, string, string,
	]
	legendLess: string
	legendMore: string
	/** Names one cell for a pointer and a screen reader. */
	formatDay: (date: string, level: number) => string
}

export const defaultActivityHeatmapStrings: ActivityHeatmapStrings = {
	dayLabels: ["Mon", "", "Wed", "", "Fri", "", ""],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
	],
	legendLess: "Less",
	legendMore: "More",
	formatDay: (date, level) => `${date}: level ${level}`,
}

export interface TimeRulerStrings {
	legendNone: string
	legendLow: string
	legendMedium: string
	legendHigh: string
	legendNow: string
	/**
	 * An hour of the day as its axis tick.
	 *
	 * A function rather than a format string, because zero-padded 24-hour numerals are the
	 * Latin default and nothing more — a caller on a 12-hour clock or a different numbering
	 * system replaces the whole rendering, not a separator inside it.
	 */
	formatHour: (hour: number) => string
	/** The per-hour tooltip. The default names no noun; the data knows what it counts. */
	formatHourTitle: (hourLabel: string, count: number) => string
}

export const defaultTimeRulerStrings: TimeRulerStrings = {
	legendNone: "None",
	legendLow: "Low",
	legendMedium: "Medium",
	legendHigh: "High",
	legendNow: "Now",
	formatHour: (hour) => String(hour).padStart(2, "0"),
	formatHourTitle: (hourLabel, count) => `${hourLabel}:00 — ${count}`,
}
