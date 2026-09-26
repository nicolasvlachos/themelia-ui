/** DateTimeInput — a date picker and time segments editing one ISO value. */
import { forwardRef, useCallback } from "react"

import { DatePicker, TimePicker, type TimeValue } from "@/components/base/date-pickers"
import { Stack } from "@/components/base/structure"
import { cx } from "@/lib/cx"

export interface DateTimeInputProps {
	/** Applied to the date trigger, so a `FormField` label can address this pair. */
	id?: string
	/** Controlled value, as an ISO string. */
	value?: string
	onValueChange?: (value: string | undefined) => void
	placeholder?: string
	displayFormat?: string
	/** Minutes snap to this in the time segments. */
	minuteStep?: number
	withSeconds?: boolean
	disabled?: boolean
	invalid?: boolean
	className?: string
	/** `FormField` supplies these; the date trigger and each time segment carry them. */
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean | "true" | "false"
	"aria-required"?: boolean | "true" | "false"
}

export const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(function DateTimeInput(
	{
		id,
		value,
		onValueChange,
		placeholder,
		displayFormat,
		minuteStep = 15,
		withSeconds = false,
		disabled,
		invalid,
		className,
		"aria-labelledby": labelledBy,
		"aria-describedby": describedBy,
		"aria-invalid": ariaInvalid,
		"aria-required": ariaRequired,
	},
	ref,
) {
	const isInvalid = invalid || ariaInvalid === true || ariaInvalid === "true"
	const date = value ? new Date(value) : undefined
	const valid = date && !Number.isNaN(date.getTime()) ? date : undefined

	const time: TimeValue = {
		hours: valid?.getHours() ?? 0,
		minutes: valid?.getMinutes() ?? 0,
		seconds: valid?.getSeconds() ?? 0,
	}

	const setDate = useCallback(
		(next: unknown) => {
			if (!(next instanceof Date)) {
				onValueChange?.(undefined)
				return
			}
			// The calendar returns midnight; keep the time already set.
			const merged = new Date(next)
			merged.setHours(time.hours, time.minutes, time.seconds ?? 0, 0)
			onValueChange?.(merged.toISOString())
		},
		[onValueChange, time.hours, time.minutes, time.seconds],
	)

	const setTime = useCallback(
		(next: TimeValue) => {
			// With no date yet, anchor the time to today.
			const base = valid ?? new Date()
			const merged = new Date(base)
			merged.setHours(next.hours, next.minutes, next.seconds ?? 0, 0)
			onValueChange?.(merged.toISOString())
		},
		[onValueChange, valid],
	)

	return (
		<Stack ref={ref} direction="horizontal" gap="sm" align="center" className={cx("date-time-input--component", className)}>
			<DatePicker
				id={id}
				value={valid}
				onValueChange={setDate}
				placeholder={placeholder}
				displayFormat={displayFormat}
				disabled={disabled}
				invalid={isInvalid}
				aria-labelledby={labelledBy}
				aria-describedby={describedBy}
				aria-required={ariaRequired}
			/>
			<TimePicker
				value={time}
				onValueChange={setTime}
				minuteStep={minuteStep}
				withSeconds={withSeconds}
				disabled={disabled}
				invalid={isInvalid}
				aria-labelledby={labelledBy}
				aria-describedby={describedBy}
				aria-required={ariaRequired}
			/>
		</Stack>
	)
})
