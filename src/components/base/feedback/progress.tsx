/**
 * Progress — a `progressbar` with its real bounds. Omit `value` for indeterminate; the ARIA
 * value attributes are then dropped rather than reporting 0%.
 */
import * as React from "react"

import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"

import { normalizeProgressRange } from "./progress-range"
import styles from "./progress.module.css"

export type ProgressTone = "primary" | "success" | "warning" | "destructive" | "info"

const progressVariants = cvm(styles.root, {
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

export interface ProgressProps extends Omit<React.ComponentProps<"div">, "children"> {
	/** 0–`max`. Non-finite values resolve to 0. Omit for indeterminate. */
	value?: number
	/** A finite positive upper bound; invalid values resolve to 100. */
	max?: number
	tone?: ProgressTone
	/** Accessible name. Required when no visible label describes the bar. */
	label?: string
}

export function Progress({ value, max = 100, tone, label, className, ...props }: ProgressProps) {
	const indeterminate = value === undefined
	const range = normalizeProgressRange(value ?? 0, max)

	return (
		<div
			data-slot="progress"
			role="progressbar"
			aria-label={label}
			aria-valuemin={indeterminate ? undefined : 0}
			aria-valuemax={indeterminate ? undefined : range.max}
			aria-valuenow={indeterminate ? undefined : range.value}
			className={cx("progress--component", progressVariants({ tone }), className)}
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
