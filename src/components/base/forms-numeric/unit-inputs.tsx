/**
 * Unit-bearing numeric fields — weight, dimensions, coordinates. The unit lives in its own
 * channel, as CurrencyInput's currency does: "1.5 kg" in one string is ambiguous to parse.
 */
import { Fragment, forwardRef, useCallback, useId, useMemo, useState } from "react"

import { Select } from "@/components/base/choice-inputs"
import { cx } from "@/lib/cx"

import { DecimalInput } from "./decimal-input"
import {
	defaultCoordinatesInputStrings, defaultDimensionsInputStrings, defaultUnitInputStrings,
	type CoordinatesInputStrings, type DimensionsInputStrings, type UnitInputStrings,
} from "./forms-numeric.strings"
import styles from "./forms-numeric.module.css"

/** A change event shaped like a native one, so a form library can register the field. */
export interface ValueChangeEvent {
	target: { value: string }
}

/* ── Weight ───────────────────────────────────────────────────────────────────── */

export type WeightUnit = "g" | "kg" | "lb" | "oz"

const WEIGHT_UNITS: { value: WeightUnit; label: string }[] = [
	{ value: "g", label: "g" },
	{ value: "kg", label: "kg" },
	{ value: "lb", label: "lb" },
	{ value: "oz", label: "oz" },
]

/** What `FormField` hands a clustered field: forwarded to every part so each is named, described and marked invalid. */
export interface ClusterFieldWiring {
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean | "true" | "false"
	"aria-required"?: boolean | "true" | "false"
}

function useClusterWiring(wiring: ClusterFieldWiring, invalid?: boolean) {
	const base = useId()
	const isInvalid = !!invalid || wiring["aria-invalid"] === true || wiring["aria-invalid"] === "true"
	const required = wiring["aria-required"] === true || wiring["aria-required"] === "true"
	return {
		base,
		isInvalid,
		/* One part, named "{field caption} {part caption}" and described by the field's hint. */
		part: (captionId: string) => ({
			"aria-labelledby": wiring["aria-labelledby"] ? `${wiring["aria-labelledby"]} ${captionId}` : captionId,
			"aria-describedby": wiring["aria-describedby"],
			"aria-invalid": isInvalid || undefined,
			"aria-required": required || undefined,
		}),
	}
}

export interface WeightInputProps extends ClusterFieldWiring {
	/**
	 * Applied to the first numeric input, which a `FormField` label addresses; each input
	 * keeps its own `aria-label` for its part.
	 */
	id?: string
	/**
	 * Overrides this field's own copy — the unit selector's name. Like every other piece of
	 * copy, each string can be overridden on its own.
	 */
	strings?: Partial<UnitInputStrings>
	/** Controlled amount: the number, as a plain string. */
	value?: string
	/** The starting amount, for an uncontrolled field. */
	defaultValue?: string
	/** Called with a change event shaped like a native one, carrying the amount. */
	onChange?: (event: ValueChangeEvent) => void
	/**
	 * Controlled unit, apart from the number. Switching unit does not convert — it relabels.
	 */
	unit?: WeightUnit
	/** The unit the field starts in. */
	defaultUnit?: WeightUnit
	/** Called with the new unit. Switching relabels rather than converting — the number is the caller's. */
	onUnitChange?: (unit: WeightUnit) => void
	/** Which units the selector offers. */
	units?: WeightUnit[]
	/** Digits after the separator. */
	decimalPlaces?: number
	/** The lower bound. */
	min?: number
	/** The upper bound. */
	max?: number
	/** The increment for the − / + controls. */
	step?: number
	/** Shows the unit selector. Turn it off for a field with one fixed unit. */
	showUnitSelector?: boolean
	/** Shows the unit selector read-only, for a value whose unit is decided elsewhere. */
	disableUnitSelector?: boolean
	placeholder?: string
	disabled?: boolean
	/** The error surface. The message stays on the `FormField`. */
	invalid?: boolean
	className?: string
	"aria-label"?: string
}

/**
 * A weight: the number and its unit in separate channels, as `CurrencyInput` keeps the
 * currency — "1.5 kg" in one string is ambiguous to parse.
 */
export const WeightInput = forwardRef<HTMLInputElement, WeightInputProps>(function WeightInput(
	{
		id,
		value,
		defaultValue,
		onChange,
		unit,
		defaultUnit = "g",
		onUnitChange,
		units,
		decimalPlaces = 2,
		min = 0,
		max,
		step,
		showUnitSelector = true,
		disableUnitSelector = false,
		strings,
		placeholder,
		disabled,
		invalid,
		className,
		"aria-label": ariaLabel,
		...wiring
	},
	ref,
) {
	const copy = { ...defaultUnitInputStrings, ...strings }
	const isInvalid = !!invalid || wiring["aria-invalid"] === true || wiring["aria-invalid"] === "true"
	const options = useMemo(
		() => (units ? WEIGHT_UNITS.filter((entry) => units.includes(entry.value)) : WEIGHT_UNITS),
		[units],
	)
	const isControlled = unit !== undefined
	const [internalUnit, setInternalUnit] = useState<WeightUnit>(defaultUnit)
	const resolvedUnit = isControlled ? (unit ?? defaultUnit) : internalUnit

	const setUnit = useCallback(
		(next: string | undefined) => {
			if (!next) return
			if (!isControlled) setInternalUnit(next as WeightUnit)
			onUnitChange?.(next as WeightUnit)
		},
		[isControlled, onUnitChange],
	)

	return (
		<div className={cx("weight-input--component", styles.row, className)}>
			<div className={styles.grow}>
				<DecimalInput
					id={id}
					ref={ref}
					value={value}
					defaultValue={defaultValue}
					onChange={(event) => onChange?.({ target: { value: event.target.value } })}
					decimalPlaces={decimalPlaces}
					allowNegative={false}
					min={min}
					max={max}
					step={step}
					placeholder={placeholder}
					disabled={disabled}
					aria-invalid={isInvalid || undefined}
					aria-label={ariaLabel}
					aria-labelledby={ariaLabel ? undefined : wiring["aria-labelledby"]}
					aria-describedby={wiring["aria-describedby"]}
					aria-required={wiring["aria-required"]}
				/>
			</div>
			{showUnitSelector && (
				<div className={styles.unitColumn}>
					<Select
						options={options}
						value={resolvedUnit}
						onValueChange={setUnit}
						disabled={disabled || disableUnitSelector}
						invalid={isInvalid}
						aria-label={copy.unit}
					/>
				</div>
			)}
		</div>
	)
})

/* ── Dimensions ───────────────────────────────────────────────────────────────── */

export type DimensionUnit = "mm" | "cm" | "m" | "in" | "ft" | "px"

const DIMENSION_UNITS: { value: DimensionUnit; label: string }[] = [
	{ value: "mm", label: "mm" },
	{ value: "cm", label: "cm" },
	{ value: "m", label: "m" },
	{ value: "in", label: "in" },
	{ value: "ft", label: "ft" },
	{ value: "px", label: "px" },
]

export interface DimensionsValue {
	length?: string
	width?: string
	height?: string
}

export interface DimensionsInputProps extends ClusterFieldWiring {
	/**
	 * Applied to the first numeric input, which a `FormField` label addresses; each input
	 * keeps its own `aria-label` for its part.
	 */
	id?: string
	/**
	 * `{ length, width, height }`: three strings, one field. Each part is independently
	 * editable.
	 */
	value?: DimensionsValue
	/** Called with the whole value when any part changes. */
	onValueChange?: (value: DimensionsValue) => void
	/** Controlled unit. Switching unit does not convert — it relabels. */
	unit?: DimensionUnit
	/** The unit the field starts in. */
	defaultUnit?: DimensionUnit
	/** Called with the new unit. Switching relabels rather than converting — the number is the caller's. */
	onUnitChange?: (unit: DimensionUnit) => void
	/** Which units the selector offers. */
	units?: DimensionUnit[]
	/** Digits after the separator, applied to every part of the field. */
	decimalPlaces?: number
	/**
	 * Shows the third dimension box. Turn it off for a value that is a plane rather than a
	 * solid: a two-dimensional measurement.
	 */
	showHeight?: boolean
	/** Shows the unit selector. Turn it off for a field with one fixed unit. */
	showUnitSelector?: boolean
	/**
	 * Overrides this field's own copy — the three axis names and the unit selector. Like every
	 * other piece of copy, each string can be overridden on its own.
	 */
	strings?: Partial<DimensionsInputStrings>
	disabled?: boolean
	/** The error surface. The message stays on the `FormField`. */
	invalid?: boolean
	className?: string
}

/** Length, width and height as one field, with one unit for all three. */
export const DimensionsInput = forwardRef<HTMLDivElement, DimensionsInputProps>(
	function DimensionsInput(
		{
			id,
			value,
			onValueChange,
			unit,
			defaultUnit = "cm",
			onUnitChange,
			units,
			decimalPlaces = 2,
			showHeight = true,
			showUnitSelector = true,
			strings,
			disabled,
			invalid,
			className,
			...wiring
		},
		ref,
	) {
		const copy = { ...defaultDimensionsInputStrings, ...strings }
		const { base, isInvalid, part } = useClusterWiring(wiring, invalid)
		const options = useMemo(
			() => (units ? DIMENSION_UNITS.filter((entry) => units.includes(entry.value)) : DIMENSION_UNITS),
			[units],
		)
		const isControlled = unit !== undefined
		const [internalUnit, setInternalUnit] = useState<DimensionUnit>(defaultUnit)
		const resolvedUnit = isControlled ? (unit ?? defaultUnit) : internalUnit

		const setAxis = (axis: keyof DimensionsValue, next: string) =>
			onValueChange?.({ ...value, [axis]: next })

		const axes: (keyof DimensionsValue)[] = showHeight
			? ["length", "width", "height"]
			: ["length", "width"]

		return (
			<div ref={ref} className={cx("dimensions-input--component", styles.row, styles.dimensions, className)}>
				{axes.map((axis, index) => (
					<Fragment key={axis}>
						{index > 0 && (
							/* Decorative: the boxes are already labelled. */
							<span aria-hidden className={styles.separator}>
								×
							</span>
						)}
						<div className={styles.field}>
							{/* A real label: clicking the caption focuses its box. */}
							<label id={`${base}-${axis}-caption`} htmlFor={index === 0 && id ? id : `${base}-${axis}`} className={styles.subLabel}>
								{copy[axis]}
							</label>
							<DecimalInput
								/* The first axis takes the field's id, so its label reaches the first box. */
								id={index === 0 && id ? id : `${base}-${axis}`}
								value={value?.[axis] ?? ""}
								onChange={(event) => setAxis(axis, event.target.value)}
								decimalPlaces={decimalPlaces}
								allowNegative={false}
								min={0}
								disabled={disabled}
								{...part(`${base}-${axis}-caption`)}
							/>
						</div>
					</Fragment>
				))}
				{showUnitSelector && (
					<div className={styles.field} style={{ flex: "0 0 auto", width: "var(--numeric-unit-w)" }}>
						<span className={styles.subLabel}>{copy.unit}</span>
						<Select
							options={options}
							value={resolvedUnit}
							onValueChange={(next) => {
								if (!next) return
								if (!isControlled) setInternalUnit(next as DimensionUnit)
								onUnitChange?.(next as DimensionUnit)
							}}
							disabled={disabled}
							invalid={isInvalid}
							aria-label={copy.unit}
						/>
					</div>
				)}
			</div>
		)
	},
)

/* ── Coordinates ──────────────────────────────────────────────────────────────── */

export interface CoordinatesValue {
	latitude?: string
	longitude?: string
}

export interface CoordinatesInputProps extends ClusterFieldWiring {
	/**
	 * Applied to the first numeric input, which a `FormField` label addresses; each input
	 * keeps its own `aria-label` for its part.
	 */
	id?: string
	/**
	 * `{ latitude, longitude }`: two strings, kept apart so a half-typed latitude cannot
	 * corrupt the longitude.
	 */
	value?: CoordinatesValue
	/** Called with the whole value when either part changes. */
	onValueChange?: (value: CoordinatesValue) => void
	/** Six places is roughly 0.1 m — past the precision of consumer GPS. */
	decimalPlaces?: number
	/**
	 * Overrides this field's own copy — the two axis names. Like every other piece of copy,
	 * each string can be overridden on its own.
	 */
	strings?: Partial<CoordinatesInputStrings>
	disabled?: boolean
	/** The error surface. The message stays on the `FormField`. */
	invalid?: boolean
	className?: string
}

/** A latitude and a longitude as one field, each with its own bounds. */
export const CoordinatesInput = forwardRef<HTMLDivElement, CoordinatesInputProps>(
	function CoordinatesInput(
		{
			id,
			value,
			onValueChange,
			decimalPlaces = 6,
			strings,
			disabled,
			invalid,
			className,
			...wiring
		},
		ref,
	) {
		const copy = { ...defaultCoordinatesInputStrings, ...strings }
		const { base, part } = useClusterWiring(wiring, invalid)
		const set = (axis: keyof CoordinatesValue, next: string) =>
			onValueChange?.({ ...value, [axis]: next })

		return (
			<div ref={ref} className={cx("coordinates-input--component", styles.row, className)}>
				{/* Latitude ±90, longitude ±180 — distinct bounds on purpose. */}
				<div className={styles.field}>
					<label id={`${base}-latitude-caption`} htmlFor={id ?? `${base}-latitude`} className={styles.subLabel}>
						{copy.latitude}
					</label>
					<DecimalInput
						id={id ?? `${base}-latitude`}
						value={value?.latitude ?? ""}
						onChange={(event) => set("latitude", event.target.value)}
						decimalPlaces={decimalPlaces}
						min={-90}
						max={90}
						disabled={disabled}
						{...part(`${base}-latitude-caption`)}
					/>
				</div>
				<div className={styles.field}>
					<label id={`${base}-longitude-caption`} htmlFor={`${base}-longitude`} className={styles.subLabel}>
						{copy.longitude}
					</label>
					<DecimalInput
						id={`${base}-longitude`}
						value={value?.longitude ?? ""}
						onChange={(event) => set("longitude", event.target.value)}
						decimalPlaces={decimalPlaces}
						min={-180}
						max={180}
						disabled={disabled}
						{...part(`${base}-longitude-caption`)}
					/>
				</div>
			</div>
		)
	},
)
