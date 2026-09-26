/**
 * ProgressCircle — a determinate ring with the reading inside it, for tiles, scores and
 * grids of small measures. A conic gradient masked into a ring (one sweep, no
 * circumference maths); size comes from `--progress-circle`, with no size prop.
 */
import * as React from "react"

import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"

import type { ProgressTone } from "./progress"
import { normalizeProgressRange } from "./progress-range"
import styles from "./progress-circle.module.css"

const circleVariants = cvm(styles.root, {
	variants: {
		tone: {
			primary: undefined,
			success: styles.toneSuccess,
			warning: styles.toneWarning,
			destructive: styles.toneDestructive,
			info: styles.toneInfo,
		},
	},
	defaultVariants: { tone: "primary" },
})

export interface ProgressCircleProps extends React.ComponentProps<"div"> {
	/** 0–`max`. Non-finite values resolve to 0; overflow fills rather than wrapping. */
	value: number
	/** A finite positive upper bound; invalid values resolve to 100. */
	max?: number
	tone?: ProgressTone
	/** Accessible name. Required when no visible label describes the ring. */
	label?: string
	/** What sits in the hole — a percentage, a count, a verdict glyph. */
	children?: React.ReactNode
}

export function ProgressCircle({
	value,
	max = 100,
	tone,
	label,
	children,
	className,
	style,
	...props
}: ProgressCircleProps) {
	const range = normalizeProgressRange(value, max)

	return (
		<div
			data-slot="progress-circle"
			role="progressbar"
			aria-label={label}
			aria-valuemin={0}
			aria-valuemax={range.max}
			aria-valuenow={range.value}
			className={cx("progress-circle--component", circleVariants({ tone }), className)}
			/* Data drives the sweep. */
			style={{ "--progress-sweep": `${range.percent}%`, ...style } as React.CSSProperties}
			{...props}
		>
			<span className={styles.inner}>{children}</span>
		</div>
	)
}
