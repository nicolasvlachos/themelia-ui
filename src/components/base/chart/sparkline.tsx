/**
 * Sparkline — a mini area chart with no axes, grid or tooltip, for metric tiles and table
 * cells. Lives in `base/chart` so Recharts stays a peer of this subpath only. The stroke is
 * a CSS variable set from `tone`, so it follows the theme.
 */
import { useId } from "react"
import * as Recharts from "recharts"

import type { SemanticTone } from "@/lib/component-vocabulary"
import { cx } from "@/lib/cx"

import styles from "./chart.module.css"

export interface SparklineProps extends Omit<React.ComponentProps<"div">, "children"> {
	/** The series, in chronological order. */
	data: readonly number[]
	/** Colours the stroke and its fade. */
	tone?: SemanticTone
	/** Off by default: many sparklines animating at once reads as a malfunction. */
	animated?: boolean
	/** What the shape says. Without it the chart is decorative and hidden from readers. */
	label?: string
}

export function Sparkline({
	data,
	tone = "neutral",
	animated = false,
	label,
	className,
	...props
}: SparklineProps) {
	/* `url(#id)` is document-scoped, so each instance needs its own gradient id. */
	const gradientId = `sparkline-${useId().replaceAll(":", "")}`
	const points = data.map((value, index) => ({ index, value }))

	return (
		<div
			data-tone={tone}
			className={cx("sparkline--component", styles.sparkline, className)}
			role={label ? "img" : undefined}
			aria-label={label}
			aria-hidden={label ? undefined : true}
			{...props}
		>
			{/* An empty series still holds its box, so a row of tiles doesn't reflow. */}
			{points.length > 0 && (
				<Recharts.ResponsiveContainer
					width="100%"
					height="100%"
					initialDimension={{ width: 1, height: 1 }}
				>
					{/*
 * `accessibilityLayer={false}`: the sparkline is a picture with nothing to walk, and the
 * layer's tab stop would focus an element that is `aria-hidden` when unlabelled.
 */}
					<Recharts.AreaChart
						data={points}
						accessibilityLayer={false}
						margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
					>
						<defs>
							<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--sparkline-stroke)" stopOpacity={0.25} />
								<stop offset="100%" stopColor="var(--sparkline-stroke)" stopOpacity={0} />
							</linearGradient>
						</defs>
						<Recharts.Area
							type="monotone"
							dataKey="value"
							stroke="var(--sparkline-stroke)"
							strokeWidth={1.75}
							fill={`url(#${gradientId})`}
							dot={false}
							activeDot={false}
							isAnimationActive={animated}
						/>
					</Recharts.AreaChart>
				</Recharts.ResponsiveContainer>
			)}
		</div>
	)
}
