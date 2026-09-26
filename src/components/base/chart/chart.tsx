/**
 * Chart — Recharts on the kit's tokens. Recharts owns geometry; this owns chrome. The
 * container maps each series key to `--color-<key>`, so colours are set once in the config;
 * prefer `var(--chart-1)` … `var(--chart-5)`, which follow the theme.
 */
import * as React from "react"
import * as Recharts from "recharts"

import { cx } from "@/lib/cx"

import styles from "./chart.module.css"

export interface ChartSeriesConfig {
	/** Shown in the tooltip and the legend in place of the raw data key. */
	label?: React.ReactNode
	icon?: React.ComponentType
	/** Any CSS colour. Prefer a theme token so the chart follows light and dark. */
	color?: string
}

/** Maps each data key to its label, colour, and icon. */
export type ChartConfig = Record<string, ChartSeriesConfig>

/** One entry of what is under the cursor. Shaped by Recharts, narrowed here. */
export interface ChartPayloadItem {
	dataKey?: string | number
	name?: string | number
	value?: string | number | (string | number)[]
	color?: string
	fill?: string
	payload?: Record<string, unknown>
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
	const context = React.useContext(ChartContext)
	if (!context) throw new Error("Chart parts must be used inside a <ChartContainer />.")
	return context
}

export interface ChartContainerProps extends Omit<React.ComponentProps<"div">, "children"> {
	config: ChartConfig
	children: React.ComponentProps<typeof Recharts.ResponsiveContainer>["children"]
	/**
	 * What the chart shows, as a sentence a screen reader can speak ("Monthly revenue against
	 * expenses, January to June"). Without it the focusable plot is announced by its tick text.
	 */
	label?: string
	/** A longer summary of the data or its takeaway, read after the label. */
	description?: string
}

export function ChartContainer({ config, label, description, className, children, style, ...props }: ChartContainerProps) {
	/* One `--color-<key>` per series; Recharts takes colour strings, so series use `var(--color-<key>)`. */
	const colorVars = React.useMemo(() => {
		const vars: Record<string, string> = {}
		for (const [key, series] of Object.entries(config)) {
			if (series.color) vars[`--color-${key}`] = series.color
		}
		return vars
	}, [config])

	return (
		<ChartContext.Provider value={{ config }}>
			<div
				data-slot="chart"
				className={cx("chart--component", styles.container, className)}
				style={{ ...colorVars, ...style } as React.CSSProperties}
				{...props}
			>
				<Recharts.ResponsiveContainer>
					{/* The label and description become the SVG's <title> and <desc> unless the caller set them. */}
					{React.isValidElement<{ title?: string; desc?: string }>(children) && (label || description)
						? React.cloneElement(children, {
								title: children.props.title ?? label,
								desc: children.props.desc ?? description,
							})
						: children}
				</Recharts.ResponsiveContainer>
			</div>
		</ChartContext.Provider>
	)
}

export const ChartTooltip = Recharts.Tooltip
/* Series order, not Recharts' default alphabetical sort, so legend and tooltip agree. */
export function ChartLegend({ itemSorter = null, ...props }: React.ComponentProps<typeof Recharts.Legend>) {
	return <Recharts.Legend itemSorter={itemSorter} {...props} />
}

/** The value an entry holds under `key`, on the entry itself or on its data row. */
function payloadValue(item: ChartPayloadItem, key: string): string | undefined {
	const value = (item as Record<string, unknown>)[key] ?? item.payload?.[key]
	return typeof value === "string" || typeof value === "number" ? String(value) : undefined
}

/**
 * Resolves a payload entry to its configured series: by the value under `nameKey` (a pie's
 * `browser` column), else by data key or name.
 */
function seriesFor(config: ChartConfig, item: ChartPayloadItem, nameKey?: string) {
	const named = nameKey ? payloadValue(item, nameKey) : undefined
	return config[named ?? String(item.dataKey ?? item.name ?? "")]
}

export interface ChartTooltipContentProps extends Omit<React.ComponentProps<"div">, "color"> {
	/** Supplied by Recharts. */
	active?: boolean
	payload?: ChartPayloadItem[]
	label?: React.ReactNode
	hideLabel?: boolean
	hideIndicator?: boolean
	indicator?: "dot" | "line" | "dashed"
	/** Key in the payload holding each series name. */
	nameKey?: string
	/** Key in the payload holding the tooltip label. */
	labelKey?: string
	labelFormatter?: (label: React.ReactNode, payload: ChartPayloadItem[]) => React.ReactNode
	formatter?: (
		value: NonNullable<ChartPayloadItem["value"]>,
		name: NonNullable<ChartPayloadItem["name"]>,
		item: ChartPayloadItem,
		index: number,
	) => React.ReactNode
}

/*
 * Recharts clones `content` elements with its own internals (cursor, offset, width, …)
 * mixed into the caller's props, indistinguishable by origin or shape. So forward an
 * allow-list of what a caller can put on this div; anything else is dropped.
 */
const FORWARDED_PROPS = new Set([
	"id",
	"role",
	"style",
	"title",
	"lang",
	"dir",
	"hidden",
	"slot",
	"tabIndex",
])

function domProps<T extends Record<string, unknown>>(props: T): Record<string, unknown> {
	const out: Record<string, unknown> = {}
	for (const key of Object.keys(props)) {
		const keep =
			FORWARDED_PROPS.has(key) ||
			key.startsWith("data-") ||
			key.startsWith("aria-") ||
			/* Handlers never become attributes. */
			(key.startsWith("on") && typeof props[key] === "function")
		if (keep) out[key] = props[key]
	}
	return out
}

export function ChartTooltipContent({
	active,
	payload,
	label,
	hideLabel = false,
	hideIndicator = false,
	indicator = "dot",
	nameKey,
	labelKey,
	labelFormatter,
	formatter,
	className,
	...props
}: ChartTooltipContentProps) {
	const { config } = useChart()

	// Recharts renders the content component even while the tooltip is closed.
	if (!active || !payload?.length) return null

	const resolvedLabel = (() => {
		if (hideLabel) return null
		const [first] = payload
		if (!first) return null
		const named = labelKey ? payloadValue(first, labelKey) : undefined
		// A string label may itself be a configured key — an axis of series names.
		const value =
			named !== undefined
				? (config[named]?.label ?? named)
				: typeof label === "string"
					? (config[label]?.label ?? label)
					: (seriesFor(config, first)?.label ?? label)
		return labelFormatter ? labelFormatter(value, payload) : value
	})()

	return (
		<div className={cx("chart--tooltip", styles.tooltip, className)} {...domProps(props)}>
			{resolvedLabel != null && <div className={styles.tooltipLabel}>{resolvedLabel}</div>}

			{payload.map((item, index) => {
				const series = seriesFor(config, item, nameKey)
				const color = item.color ?? item.fill
				const name = series?.label ?? (nameKey ? payloadValue(item, nameKey) : undefined) ?? item.name ?? item.dataKey ?? ""

				return (
					<div key={String(item.dataKey ?? index)} className={styles.tooltipRow}>
						{!hideIndicator &&
							(series?.icon ? (
								<series.icon />
							) : (
								<span
									className={cx(
										styles.indicator,
										indicator === "line" && styles.indicatorLine,
										indicator === "dashed" && styles.indicatorDashed,
									)}
									style={{ "--chart-indicator-color": color } as React.CSSProperties}
								/>
							))}
						<span className={styles.tooltipName}>{name}</span>
						{item.value != null && (
							<span className={styles.tooltipValue}>
								{formatter
									? formatter(item.value, item.name ?? "", item, index)
									: // Locale grouping for readability.
										typeof item.value === "number"
										? item.value.toLocaleString()
										: String(item.value)}
							</span>
						)}
					</div>
				)
			})}
		</div>
	)
}

export interface ChartLegendContentProps extends React.ComponentProps<"div"> {
	/** Supplied by Recharts. */
	payload?: ChartPayloadItem[]
	hideIcon?: boolean
	nameKey?: string
}

export function ChartLegendContent({
	payload,
	hideIcon = false,
	nameKey,
	className,
	...props
}: ChartLegendContentProps) {
	const { config } = useChart()
	if (!payload?.length) return null

	return (
		<div className={cx("chart--legend", styles.legend, className)} {...domProps(props)}>
			{payload.map((item, index) => {
				const series = seriesFor(config, item, nameKey)
				return (
					<div key={String(item.dataKey ?? index)} className={styles.legendItem}>
						{!hideIcon &&
							(series?.icon ? (
								<series.icon />
							) : (
								<span
									className={styles.indicator}
									style={{ "--chart-indicator-color": item.color ?? item.fill } as React.CSSProperties}
								/>
							))}
						{series?.label ?? item.value ?? item.dataKey}
					</div>
				)
			})}
		</div>
	)
}
