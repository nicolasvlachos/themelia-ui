/**
 * Progress — a `progressbar` with its real bounds. Omit `value` for indeterminate; the ARIA
 * value attributes are then dropped rather than reporting 0%.
 */
import * as React from "react"

import type { SemanticTone } from "@/lib/component-vocabulary"
import { cx } from "@/lib/cx"

import { normalizeProgressRange } from "./progress-range"
import styles from "./progress.module.css"

/** The tones a measure takes: the kit's tone union, without neutral and secondary. */
export type ProgressTone = Extract<SemanticTone, "primary" | "success" | "warning" | "destructive" | "info">

export interface ProgressProps extends Omit<React.ComponentProps<"div">, "children"> {
	/** 0–`max`. Non-finite values resolve to 0. Omit for indeterminate. */
	value?: number
	/** A finite positive upper bound; invalid values resolve to 100. */
	max?: number
	/**
	 * Semantic colour intent. Left unset the bar takes the primary tone — a progress bar that
	 * changes colour at a threshold is the caller's decision, not the component's.
	 * @default "primary"
	 */
	tone?: ProgressTone
	/** Accessible name. Required when no visible label describes the bar. */
	label?: string
}

/**
 * A `progressbar` with its real bounds. Omit `value` for indeterminate; the ARIA value
 * attributes are then dropped rather than reporting 0%.
 */
export function Progress({ value, max = 100, tone = "primary", label, className, ...props }: ProgressProps) {
	const indeterminate = value === undefined
	const range = normalizeProgressRange(value ?? 0, max)

	return (
		<div
			data-slot="progress"
			data-tone={tone}
			role="progressbar"
			aria-label={label}
			aria-valuemin={indeterminate ? undefined : 0}
			aria-valuemax={indeterminate ? undefined : range.max}
			aria-valuenow={indeterminate ? undefined : range.value}
			className={cx("progress--component", styles.root, className)}
			{...props}
		>
			{indeterminate ? (
				<div className={styles.indeterminate} />
			) : (
				<div className={styles.fill} style={{ width: `${range.percent}%` }} />
			)}
		</div>
	)
}
