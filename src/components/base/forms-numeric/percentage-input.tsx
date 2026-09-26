/**
 * PercentageInput — DecimalInput bounded to a percentage, with a trailing `%` affordance;
 * the value stays a plain number string.
 */
import { forwardRef } from "react"

import { FieldShell } from "@/components/base/text-inputs"
import { cx } from "@/lib/cx"

import { DecimalInput, type DecimalInputProps } from "./decimal-input"
import styles from "./forms-numeric.module.css"

export type PercentageInputProps = Omit<DecimalInputProps, "allowNegative"> & {
	/** Defaults to 0. */
	min?: number
	/** Defaults to 100. */
	max?: number
	/** Lets the value go below zero — a change in percent, rather than a proportion. */
	allowNegative?: boolean
}

export const PercentageInput = forwardRef<HTMLInputElement, PercentageInputProps>(
	function PercentageInput(
		{ decimalPlaces = 2, min = 0, max = 100, allowNegative = false, step, className, ...props },
		ref,
	) {
		const stepped = step !== undefined && step > 0

		const field = (
			<DecimalInput
				ref={ref}
				decimalPlaces={decimalPlaces}
				allowNegative={allowNegative}
				min={min}
				max={max}
				step={step}
				endAdornment={stepped ? "%" : undefined}
				className={className}
				{...props}
			/>
		)

		/* A stepper field is already a shell, so the sign rides inside the group rather than a second shell. */
		if (stepped) return field

		return (
			<FieldShell end="%" className={cx("percentage-input--component", styles.grow)}>
				{field}
			</FieldShell>
		)
	},
)
