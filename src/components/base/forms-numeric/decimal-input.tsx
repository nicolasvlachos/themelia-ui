/**
 * DecimalInput — the numeric field this family builds on. A text input, not
 * `type="number"`: the native spinner is unstyleable, the wheel changes values, and
 * invalid input reads back as "". The value is always a plain string.
 */
import { MinusIcon, PlusIcon } from "lucide-react"
import * as React from "react"

import { Input, type InputProps } from "@/components/base/text-inputs"
import { cx } from "@/lib/cx"

import { defaultDecimalInputStrings, type DecimalInputStrings } from "./forms-numeric.strings"
import styles from "./forms-numeric.module.css"
import { applyRounding, formatDecimal, normalizePastedNumber, type RoundingMode } from "./decimal.format"

export interface DecimalInputProps extends Omit<InputProps, "type" | "inputMode"> {
	/** Maximum fractional digits accepted, and used when normalising. */
	decimalPlaces?: number
	min?: number
	max?: number
	allowNegative?: boolean
	/** Lets the field be left blank. */
	allowEmpty?: boolean
	/** Renders − / + buttons that snap the value to multiples of this. */
	step?: number
	/**
	 * How halves are resolved when stepping or normalising. `half-even` (bankers' rounding)
	 * avoids accumulating bias across many money rows.
	 */
	roundingMode?: RoundingMode
	/** Pads to the full decimal places and clamps to the range on blur. */
	normalizeOnBlur?: boolean
	/** Overrides this field's own copy — the two icon-only steppers. */
	strings?: Partial<DecimalInputStrings>
	/**
	 * A unit rendered after the field, inside the stepper group — wrapping a stepped field in
	 * a second shell would double the border.
	 */
	endAdornment?: React.ReactNode
}

function clamp(value: number, min?: number, max?: number): number {
	let next = value
	if (min !== undefined) next = Math.max(min, next)
	if (max !== undefined) next = Math.min(max, next)
	return next
}

/** Steps relative to `min`, not zero: 5–50 by 10 offers 5, 15, 25. */
function snapToStep(current: number, delta: number, step: number, min?: number): number {
	const anchor = min ?? 0
	const steps = (current - anchor) / step
	const nearest = Math.round(steps)
	/*
	 * On the grid, step by one; off it, go to the next grid value in that direction (native
	 * `stepUp`/`stepDown`). `roundingMode` governs decimal places, not this.
	 */
	const next = Math.abs(steps - nearest) < 1e-9 ? nearest + delta : delta > 0 ? Math.ceil(steps) : Math.floor(steps)
	// Trim float noise (0.30000000000000004).
	return Number((anchor + next * step).toFixed(12))
}

function parseNumeric(raw: unknown): number | undefined {
	if (raw === undefined || raw === null) return undefined
	const numeric = Number.parseFloat(String(raw).replace(",", "."))
	return Number.isFinite(numeric) ? numeric : undefined
}

/**
 * Writes through the native value setter before calling `onChange`, so an uncontrolled
 * field updates its DOM and React's value tracker stays in sync for controlled callers.
 */
function fireChange(target: HTMLInputElement, value: string, onChange?: InputProps["onChange"]) {
	const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set
	if (setter) setter.call(target, value)
	else target.value = value

	onChange?.({
		target,
		currentTarget: target,
		type: "change",
		bubbles: false,
		cancelable: false,
	} as unknown as React.ChangeEvent<HTMLInputElement>)
}

export const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(function DecimalInput(
	{
		decimalPlaces = 2,
		min,
		max,
		allowNegative = true,
		allowEmpty = true,
		step,
		roundingMode = "round",
		normalizeOnBlur = true,
		strings,
		endAdornment,
		onChange,
		onBlur,
		onKeyDown,
		onPaste,
		placeholder,
		className,
		value,
		defaultValue,
		disabled,
		readOnly,
		...props
	},
	forwardedRef,
) {
	const copy = { ...defaultDecimalInputStrings, ...strings }
	const places = Math.min(12, Math.max(0, decimalPlaces))
	const inputRef = React.useRef<HTMLInputElement | null>(null)

	/*
	 * The shown number, so steppers can stop at the range's ends. Every write goes through
	 * `report`, so an uncontrolled field still knows its value.
	 */
	const [uncontrolled, setUncontrolled] = React.useState(() => parseNumeric(defaultValue))
	const shown = value !== undefined ? parseNumeric(value) : uncontrolled
	const report = React.useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setUncontrolled(parseNumeric(event.target.value))
			onChange?.(event)
		},
		[onChange],
	)

	const setRefs = React.useCallback(
		(node: HTMLInputElement | null) => {
			inputRef.current = node
			if (typeof forwardedRef === "function") forwardedRef(node)
			else if (forwardedRef) forwardedRef.current = node
		},
		[forwardedRef],
	)

	const handleChange = React.useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const raw = event.target.value
			if (!raw && allowEmpty) {
				report(event)
				return
			}

			const formatted = formatDecimal(raw, places, allowNegative)
			// Intermediate digits may fall outside the range; clamp only when editing ends.

			if (formatted === raw) {
				report(event)
				return
			}
			if (inputRef.current) fireChange(inputRef.current, formatted, report)
		},
		[allowEmpty, allowNegative, places, report],
	)

	/*
	 * A paste is parsed as a formatted number ("€1,234.50" → 1234.50), replacing the
	 * selection, not replayed as keystrokes.
	 */
	const handlePaste = React.useCallback(
		(event: React.ClipboardEvent<HTMLInputElement>) => {
			onPaste?.(event)
			if (event.defaultPrevented || disabled || readOnly) return
			const pasted = event.clipboardData.getData("text")
			if (!pasted) return
			event.preventDefault()
			const target = event.currentTarget
			const start = target.selectionStart ?? target.value.length
			const end = target.selectionEnd ?? start
			const next = `${target.value.slice(0, start)}${normalizePastedNumber(pasted, places)}${target.value.slice(end)}`
			fireChange(target, formatDecimal(next, places, allowNegative), report)
		},
		[allowNegative, disabled, onPaste, places, readOnly, report],
	)

	const handleBlur = React.useCallback(
		(event: React.FocusEvent<HTMLInputElement>) => {
			onBlur?.(event)
			if (!normalizeOnBlur || disabled || readOnly) return

			const raw = event.target.value
			if (!raw && allowEmpty) return
			const numeric = Number.parseFloat(raw.replace(",", "."))
			if (!Number.isFinite(numeric)) return

			const next = applyRounding(clamp(numeric, min, max), places, roundingMode).toFixed(places)
			if (next !== raw && inputRef.current) fireChange(inputRef.current, next, report)
		},
		[allowEmpty, disabled, readOnly, max, min, normalizeOnBlur, onBlur, places, report, roundingMode],
	)

	const adjust = React.useCallback(
		(delta: number) => {
			if (disabled || readOnly || step === undefined || !Number.isFinite(step) || step <= 0) return
			const target = inputRef.current
			if (!target) return

			const current = parseNumeric(target.value)
			const base = current ?? min ?? 0
			const snapped = clamp(snapToStep(base, delta, step, min), min, max)
			fireChange(target, applyRounding(snapped, places, roundingMode).toFixed(places), report)
		},
		[disabled, readOnly, max, min, places, report, roundingMode, step],
	)

	// Disable a stepper at the range's end rather than letting it click and do nothing.
	const atMin = min !== undefined && shown !== undefined && shown <= min
	const atMax = max !== undefined && shown !== undefined && shown >= max

	const resolvedPlaceholder = placeholder ?? (places > 0 ? `0.${"0".repeat(places)}` : "0")
	const showSteppers = typeof step === "number" && step > 0

	const input = (
		<Input
			{...props}
			ref={setRefs}
			type="text"
			inputMode={places > 0 ? "decimal" : "numeric"}
			placeholder={resolvedPlaceholder}
			value={value}
			defaultValue={defaultValue}
			disabled={disabled}
			readOnly={readOnly}
			onChange={handleChange}
			onPaste={handlePaste}
			onBlur={handleBlur}
			onKeyDown={event => {
				onKeyDown?.(event)
				if (event.defaultPrevented || event.nativeEvent.isComposing || disabled || readOnly || !showSteppers) return
				if (event.key === "ArrowUp" || event.key === "ArrowDown") {
					event.preventDefault()
					adjust(event.key === "ArrowUp" ? 1 : -1)
				}
			}}
			className={cx(showSteppers ? styles.stepperInput : styles.numericInput, className)}
		/>
	)

	if (!showSteppers) return input

	/*
	 * Stepper clicks keep focus in the field: blurring would normalise mid-edit and drop the
	 * caret and arrow-key stepping.
	 */
	const keepFocus = (event: React.MouseEvent) => event.preventDefault()

	return (
		<div
			data-field-shell=""
			aria-invalid={props["aria-invalid"] || undefined}
			className={cx("decimal-input--component", styles.stepperGroup)}
		>
			{/* Not tab stops: the field already steps with the arrow keys. */}
			<button
				type="button"
				tabIndex={-1}
				aria-label={copy.decrement}
				disabled={disabled || readOnly || atMin}
				onMouseDown={keepFocus}
				onClick={() => adjust(-1)}
				className={styles.stepperButton}
			>
				<MinusIcon aria-hidden />
			</button>
			{input}
			{!!endAdornment && <span className={styles.stepperAdornment}>{endAdornment}</span>}
			<button
				type="button"
				tabIndex={-1}
				aria-label={copy.increment}
				disabled={disabled || readOnly || atMax}
				onMouseDown={keepFocus}
				onClick={() => adjust(1)}
				className={styles.stepperButton}
			>
				<PlusIcon aria-hidden />
			</button>
		</div>
	)
})
