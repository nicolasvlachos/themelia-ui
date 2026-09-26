/** SliderField — a number (or, given an array, a range) on Base UI's slider. */
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { forwardRef, useId, type ReactElement, type Ref, type RefAttributes } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultSliderStrings, type SliderStrings } from "./value-inputs.strings"
import styles from "./value-inputs.module.css"

/** A change event shaped like a native one (`event.target.value`), for form libraries. */
export interface SliderChangeEvent<TValue extends number | number[] = number> {
	target: { name: string; value: TValue }
}

export interface SliderFieldProps<TValue extends number | number[] = number | number[]> {
	name?: string
	id?: string
	/**
	 * Controlled value. An array makes it a range, one thumb per entry. Handlers report back
	 * in the same shape: a number in, a number out.
	 */
	value?: TValue
	defaultValue?: TValue
	min?: number
	max?: number
	step?: number
	disabled?: boolean
	invalid?: boolean
	orientation?: "horizontal" | "vertical"
	/** Track and thumb size: `md` is a larger drag target (touch, media controls). */
	size?: "sm" | "md"

	/** Native-shaped handler, for form libraries. */
	onChange?: (event: SliderChangeEvent<TValue extends number ? number : TValue>) => void
	/** The value on its own, for everything else. */
	onValueChange?: (value: TValue extends number ? number : TValue) => void
	/** Fires once on pointer release or keyboard commit, not on every step. */
	onValueCommitted?: (value: TValue extends number ? number : TValue) => void

	/** Shows the current value beside the track. */
	showValue?: boolean
	/** Formats ONE value. A range formats each end and joins them. */
	formatValue?: (value: number) => string
	/** Suffix on the displayed value — "px", "%", "mm". Ignored when `formatValue` is given. */
	unit?: string

	className?: string
	"aria-label"?: string
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
	/** Overrides this slider's own copy: each range thumb's name ("Minimum", "Maximum") and the fallback name. */
	strings?: Partial<SliderStrings>
}

export const SliderField = forwardRef(function SliderField<TValue extends number | number[]>(
	{
		name,
		id,
		value,
		defaultValue,
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		invalid = false,
		orientation = "horizontal",
		size = "sm",
		onChange,
		onValueChange,
		onValueCommitted,
		showValue = false,
		formatValue,
		unit,
		className,
		"aria-label": ariaLabelProp,
		"aria-labelledby": ariaLabelledBy,
		"aria-describedby": ariaDescribedBy,
		"aria-invalid": ariaInvalid,
		strings,
	}: SliderFieldProps<TValue>,
	ref: Ref<HTMLDivElement>,
) {
	const copy = { ...defaultSliderStrings, ...strings }
	const ariaLabel = ariaLabelProp ?? copy.label
	const generatedId = useId()
	const resolvedId = id ?? generatedId
	const resolvedName = name ?? resolvedId

	// The shape the caller chose (number or array), from whichever value they supplied.
	const source = value ?? defaultValue
	const isRange = Array.isArray(source)
	const asArray = (input: number | number[] | undefined, fallback: number) =>
		input === undefined ? [fallback] : Array.isArray(input) ? input : [input]

	const current = asArray(source, min)

	const renderValue = (entry: number) =>
		formatValue ? formatValue(entry) : unit ? `${entry}${unit}` : String(entry)

	return (
		<FieldPrimitive.Root
			invalid={invalid || (ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== "false")}
			data-size={size}
			className={cx("slider--component", styles.sliderRoot, size === "md" && styles.sliderMd, className)}
		>
			<SliderPrimitive.Root
				ref={ref}
				id={resolvedId}
				name={name}
				aria-label={ariaLabelledBy ? undefined : ariaLabel}
				aria-labelledby={ariaLabelledBy}
				aria-describedby={ariaDescribedBy}
				aria-invalid={invalid || ariaInvalid || undefined}
				value={value}
				defaultValue={defaultValue ?? (min as TValue)}
				min={min}
				max={max}
				step={step}
				disabled={disabled}
				orientation={orientation}
				onValueChange={next => {
					onValueChange?.(next)
					onChange?.({ target: { name: resolvedName, value: next } })
				}}
				onValueCommitted={next => onValueCommitted?.(next)}
				className={styles.slider}
			>
				<SliderPrimitive.Control className={styles.sliderControl}>
					<SliderPrimitive.Track className={styles.sliderTrack}>
						<SliderPrimitive.Indicator className={styles.sliderRange} />
					</SliderPrimitive.Track>
					{current.map((_, index) => (
						<SliderPrimitive.Thumb
							key={index}
							index={index}
							aria-labelledby={!isRange ? ariaLabelledBy : undefined}
							aria-describedby={ariaDescribedBy}
							aria-invalid={invalid || ariaInvalid || undefined}
							getAriaLabel={() => (isRange ? copy.thumb(index) : (ariaLabel ?? ""))}
							/* The unit is spoken as well as drawn: "40%", not "40". */
							getAriaValueText={(_formatted, value) => renderValue(value)}
							className={styles.sliderThumb}
						/>
					))}
				</SliderPrimitive.Control>
				{showValue && (
					<SliderPrimitive.Value render={<Text tag="span" size="inherit" type={invalid ? "error" : "secondary"} className={styles.sliderValue} />}>
						{(_formatted, values) => values.map(renderValue).join("–")}
					</SliderPrimitive.Value>
				)}
			</SliderPrimitive.Root>
		</FieldPrimitive.Root>
	)
}) as <TValue extends number | number[] = number>(props: SliderFieldProps<TValue> & RefAttributes<HTMLDivElement>) => ReactElement | null

/** `SliderField` without the readout (`showValue`, `unit`) — for a toolbar or a canvas control. */
export const Slider = forwardRef(function Slider<TValue extends number | number[]>(props: SliderProps<TValue>, ref: Ref<HTMLDivElement>) {
	return <SliderField ref={ref} {...props} />
}) as <TValue extends number | number[] = number>(props: SliderProps<TValue> & RefAttributes<HTMLDivElement>) => ReactElement | null

export type SliderProps<TValue extends number | number[] = number | number[]> = Omit<SliderFieldProps<TValue>, "showValue" | "unit">
