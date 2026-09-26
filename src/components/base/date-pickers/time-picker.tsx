/**
 * TimePicker — hours, minutes and optional seconds as separate segments, not
 * `<input type="time">`, whose look and 12/24-hour display follow the platform.
 */
import { useId, useState, type ChangeEvent, type KeyboardEvent } from "react"

import { VisuallyHidden } from "@/components/base/display"
import { Input } from "@/components/base/text-inputs"
import { cx } from "@/lib/cx"

import { defaultTimePickerStrings, type TimePickerStrings } from "./time-picker.strings"
import styles from "./calendar.module.css"

export interface TimeValue {
	hours: number
	minutes: number
	seconds?: number
}

export interface TimePickerProps {
	/**
	 * Applied to the hours segment, the one a `FormField` label addresses; each segment keeps
	 * its own part name.
	 */
	id?: string
	value?: TimeValue
	onValueChange?: (value: TimeValue) => void
	/** Adds a seconds segment. */
	withSeconds?: boolean
	/** Minutes snap to this. 15 gives a quarter-hour picker. */
	minuteStep?: number
	disabled?: boolean
	invalid?: boolean
	className?: string
	/** Overrides this picker's own copy — the group and the three segments. */
	strings?: Partial<TimePickerStrings>
	/** The field's caption. `FormField` supplies it; each segment is then named "{caption} {part}". */
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean | "true" | "false"
	"aria-required"?: boolean | "true" | "false"
}

/** Wraps rather than clamps: stepping past 23 lands on 0, which is what an hour does. */
function wrap(value: number, max: number) {
	if (Number.isNaN(value)) return 0
	return ((value % max) + max) % max
}

const pad = (value: number) => String(value).padStart(2, "0")

/**
 * One segment: a spinbutton with a typed draft. Digits commit on the second digit or on
 * blur, clamped then snapped to the step (75 → 59). Arrow keys step and wrap.
 */
function TimeSegment({
	id,
	labelledBy,
	describedBy,
	invalid,
	required,
	value,
	max,
	step,
	disabled,
	onCommit,
}: {
	id?: string
	labelledBy: string
	describedBy?: string
	invalid?: boolean
	required?: boolean
	value: number
	max: number
	step: number
	disabled: boolean
	onCommit: (value: number) => void
}) {
	const [draft, setDraft] = useState<string | null>(null)

	const snap = (next: number) => (step > 1 ? Math.min(Math.round(next / step) * step, max - step) : next)
	const commit = (digits: string) => {
		setDraft(null)
		if (digits === "") return
		onCommit(snap(Math.min(Number.parseInt(digits, 10), max - 1)))
	}

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (/^\d$/.test(event.key)) {
			event.preventDefault()
			const next = (draft ?? "") + event.key
			if (next.length >= 2) commit(next)
			else setDraft(next)
			return
		}
		if (event.key === "Backspace") {
			event.preventDefault()
			setDraft((draft ?? pad(value)).slice(0, -1))
			return
		}
		const delta = event.key === "ArrowUp" ? step : event.key === "ArrowDown" ? -step : 0
		if (delta !== 0) {
			event.preventDefault()
			setDraft(null)
			const base = draft ? Number.parseInt(draft, 10) : value
			onCommit(snap(wrap(base + delta, max)))
		}
	}

	return (
		<Input
			id={id}
			type="text"
			inputMode="numeric"
			role="spinbutton"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max - 1}
			aria-valuetext={pad(value)}
			aria-labelledby={labelledBy}
			aria-describedby={describedBy}
			aria-invalid={invalid || undefined}
			aria-required={required || undefined}
			className={styles.timeSegment}
			value={draft ?? pad(value)}
			disabled={disabled}
			onKeyDown={onKeyDown}
			/* Paste and IME input arrive here rather than through the keys above. */
			onChange={(event: ChangeEvent<HTMLInputElement>) => {
				const digits = event.target.value.replace(/\D/g, "").slice(0, 2)
				if (digits.length === 2) commit(digits)
				else setDraft(digits)
			}}
			onBlur={() => {
				if (draft !== null) commit(draft)
			}}
			// Select on focus so typing replaces "09" rather than appending.
			onFocus={(event) => event.target.select()}
		/>
	)
}

export function TimePicker({
	id,
	value = { hours: 0, minutes: 0 },
	onValueChange,
	withSeconds = false,
	minuteStep = 1,
	disabled = false,
	invalid = false,
	className,
	strings,
	"aria-labelledby": fieldLabelledBy,
	"aria-describedby": describedBy,
	"aria-invalid": ariaInvalid,
	"aria-required": ariaRequired,
}: TimePickerProps) {
	const copy = { ...defaultTimePickerStrings, ...strings }
	const partIds = useId()
	const isInvalid = invalid || ariaInvalid === true || ariaInvalid === "true"
	const isRequired = ariaRequired === true || ariaRequired === "true"

	const segment = (part: keyof TimeValue, label: string, current: number, max: number, step: number) => {
		const partId = `${partIds}-${part}`
		return (
			<>
				<VisuallyHidden id={partId}>{label}</VisuallyHidden>
				<TimeSegment
					id={part === "hours" ? id : undefined}
					/* Caption, then part: "Start time Hours". */
					labelledBy={fieldLabelledBy ? `${fieldLabelledBy} ${partId}` : partId}
					describedBy={describedBy}
					invalid={isInvalid}
					required={isRequired}
					value={current}
					max={max}
					step={step}
					disabled={disabled}
					onCommit={(next) => onValueChange?.({ ...value, [part]: next })}
				/>
			</>
		)
	}

	return (
		<div
			className={cx("time-picker--component", styles.time, className)}
			role="group"
			aria-labelledby={fieldLabelledBy}
			aria-label={fieldLabelledBy ? undefined : copy.label}
		>
			{segment("hours", copy.hours, value.hours, 24, 1)}
			<span aria-hidden className={styles.timeSeparator}>:</span>
			{segment("minutes", copy.minutes, value.minutes, 60, Math.max(1, minuteStep))}
			{withSeconds && (
				<>
					<span aria-hidden className={styles.timeSeparator}>:</span>
					{segment("seconds", copy.seconds, value.seconds ?? 0, 60, 1)}
				</>
			)}
		</div>
	)
}
