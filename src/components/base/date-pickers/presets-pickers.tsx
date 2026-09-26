/**
 * SingleDatePicker, MultipleDatePicker, RangeDatePicker — `DatePicker` with `mode` fixed
 * and the value type narrowed, so callers needn't cast the union on every read.
 */
import { forwardRef } from "react"

import { DatePicker, type DatePickerProps } from "./date-picker"
import type { DateRangeValue } from "./calendar.types"

type Base = Omit<DatePickerProps, "mode" | "value" | "onValueChange">

export interface SingleDatePickerProps extends Base {
	value?: Date
	onValueChange?: (value: Date | undefined) => void
}

export const SingleDatePicker = forwardRef<HTMLButtonElement, SingleDatePickerProps>(
	function SingleDatePicker({ value, onValueChange, ...props }, ref) {
		return (
			<DatePicker
				ref={ref}
				mode="single"
				value={value}
				onValueChange={(next) => onValueChange?.(next as Date | undefined)}
				{...props}
			/>
		)
	},
)

export interface MultipleDatePickerProps extends Base {
	value?: Date[]
	onValueChange?: (value: Date[]) => void
}

export const MultipleDatePicker = forwardRef<HTMLButtonElement, MultipleDatePickerProps>(
	function MultipleDatePicker({ value, onValueChange, ...props }, ref) {
		return (
			<DatePicker
				ref={ref}
				mode="multiple"
				value={value}
				onValueChange={(next) => onValueChange?.((next as Date[]) ?? [])}
				{...props}
			/>
		)
	},
)

export interface RangeDatePickerProps extends Base {
	value?: DateRangeValue
	onValueChange?: (value: DateRangeValue) => void
}

export const RangeDatePicker = forwardRef<HTMLButtonElement, RangeDatePickerProps>(
	function RangeDatePicker({ value, onValueChange, ...props }, ref) {
		return (
			<DatePicker
				ref={ref}
				mode="range"
				value={value}
				onValueChange={(next) => onValueChange?.((next as DateRangeValue) ?? {})}
				{...props}
			/>
		)
	},
)
