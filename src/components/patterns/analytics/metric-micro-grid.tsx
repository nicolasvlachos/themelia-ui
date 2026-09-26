/**
 * MetricMicroGrid: six dense cells, each a figure with a different sketch, so the shape
 * tells cells apart. Hand-drawn SVG/CSS (no chart library at this size). One chart-palette
 * accent across the block, never state tokens; only the pie uses several stops.
 */
import type { ComponentProps, CSSProperties } from "react"

import { ContentBlock } from "@/components/base/display"
import { Progress } from "@/components/base/feedback"
import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./analytics.module.css"

export type MicroChartKind = "bars" | "line" | "dots" | "progress" | "area" | "pie"

export interface MicroMetricCell {
	id?: string
	label: string
	/** Already formatted — this block draws the shape, it does not format figures. */
	value: string
	data: readonly number[]
	/** Pins the mark. Otherwise it follows the cell's position. */
	chart?: MicroChartKind
}

export interface MetricMicroGridProps extends Omit<ComponentProps<"div">, "children"> {
	cells: readonly MicroMetricCell[]
}

/** Positional by default, so six cells get six different marks with no configuration. */
const ORDER: MicroChartKind[] = ["bars", "line", "dots", "progress", "area", "pie"]

/** Normalises a series into 0–1, flattening a constant series to its midline. */
function normalise(data: readonly number[]) {
	const max = Math.max(...data, 0)
	const min = Math.min(...data, 0)
	const range = max - min || 1
	return data.map((value) => (value - min) / range)
}

function points(data: readonly number[], height: number) {
	const scaled = normalise(data)
	const step = 60 / Math.max(scaled.length - 1, 1)
	return scaled.map((value, index) => `${index * step},${height - value * (height - 2)}`)
}

function Mark({
	kind,
	data,
	label,
}: {
	kind: MicroChartKind
	data: readonly number[]
	label: string
}) {
	if (kind === "bars") {
		const scaled = normalise(data.slice(0, 6))
		return (
			<span className={styles.microBars} aria-hidden="true">
				{scaled.map((value, index) => (
					<span
						key={index}
						className={styles.microBar}
						/* Data drives the height; there is no class that could name it. */
						style={{ "--micro-bar": `${Math.max(value, 0.08) * 100}%` } as CSSProperties}
					/>
				))}
			</span>
		)
	}

	if (kind === "dots") {
		const scaled = normalise(data.slice(0, 5))
		return (
			<span className={styles.microDots} aria-hidden="true">
				{scaled.map((value, index) => (
					<span
						key={index}
						className={styles.microDot}
						/*
						 * Whole pixels, not a percentage. A circle offset by half a pixel is
						 * rasterised lopsided, and a percentage of a 20px track lands on one
						 * almost every time.
						 */
						style={{ "--micro-dot": `${Math.round(value * 12)}px` } as CSSProperties}
					/>
				))}
			</span>
		)
	}

	if (kind === "progress") {
		/* Two numbers, not a series: the value and what it is out of. */
		const [value = 0, max = 100] = data
		/*
		 * `base/feedback`'s bar, not a track and a fill drawn here.
		 *
		 * The other five marks are sketches — shapes with no reading of their own, so they
		 * are `aria-hidden` and hand-drawn on purpose. This one is a real measurement
		 * against a real bound, which is what Progress is: it reports the role and the
		 * value range, and the local copy reported neither. What stays here is the colour,
		 * because the series hue is this block's decision and not a state.
		 */
		return <Progress value={value} max={max} label={label} className={styles.microProgress} />
	}

	if (kind === "pie") {
		const total = data.reduce((sum, value) => sum + value, 0) || 1
		const slice = data.slice(0, 3)
		/* Each stop starts where the ones before it end; computed from them rather than
		 * carried in a variable the render mutates. Three segments at most. */
		const stops = slice.map((value, index) => {
			const before = slice.slice(0, index).reduce((sum, each) => sum + each, 0)
			const from = (before / total) * 100
			const to = ((before + value) / total) * 100
			return `var(--chart-${index + 1}) ${from}% ${to}%`
		})
		return (
			<span className={styles.microMarkRow} aria-hidden="true">
				<span
					className={styles.microPie}
					style={{ "--micro-pie": `conic-gradient(${stops.join(", ")})` } as CSSProperties}
				/>
			</span>
		)
	}

	const height = 16
	const path = points(data.slice(0, 8), height)
	if (kind === "area") {
		return (
			<svg viewBox="0 0 60 16" className={styles.microSvg} preserveAspectRatio="none" aria-hidden="true">
				<polygon className={styles.microArea} points={`0,${height} ${path.join(" ")} 60,${height}`} />
			</svg>
		)
	}

	return (
		<svg viewBox="0 0 60 16" className={styles.microSvg} preserveAspectRatio="none" aria-hidden="true">
			<polyline className={styles.microLine} points={path.join(" ")} />
		</svg>
	)
}

export function MetricMicroGrid({ cells, className, ...props }: MetricMicroGridProps) {
	return (
		<div className={cx("metric-micro-grid--component", styles.microGridRoot, className)} {...props}>
			{/*
			 * `bordered`, not `card`: the ground here is the DIVIDER colour, showing through
			 * one-pixel gutters so six cells read as one ruled block without a border each.
			 * The frame and the clipping are the block's; the ground is this grid's own.
			 */}
			<ContentBlock surface="bordered" flush className={styles.microGrid}>
				{cells.map((cell, index) => {
				const kind = cell.chart ?? ORDER[index % ORDER.length] ?? "bars"
				return (
					<div
						key={cell.id ?? cell.label}
						className={cx("metric-micro-grid--cell", styles.microCell)}
					>
						<DisplayLabel>{cell.label}</DisplayLabel>
						<Text weight="semibold" numeric lineHeight="tight" className="metric-micro-grid--value">
							{cell.value}
						</Text>
						<Mark kind={kind} data={cell.data} label={cell.label} />
					</div>
					)
				})}
			</ContentBlock>
		</div>
	)
}
