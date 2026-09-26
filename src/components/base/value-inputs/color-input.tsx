/**
 * ColorInput — a colour as text (any CSS colour, kept verbatim), with the native hex picker
 * beside it; the picker's value is converted to the caller's notation via `format`.
 */
import * as React from "react"
import { converter, formatHsl, formatRgb, parse } from "culori"

import { Input, type InputProps } from "@/components/base/text-inputs"
import { cx } from "@/lib/cx"

import { defaultColorInputStrings, type ColorInputStrings } from "./value-inputs.strings"
import styles from "./value-inputs.module.css"

export interface ColorInputProps extends Omit<InputProps, "type"> {
	/** What the swatch shows. Defaults to the current value. */
	previewValue?: string
	onValueChange?: (value: string) => void
	/** Overrides this field's own copy — the swatch's name. */
	strings?: Partial<ColorInputStrings>
	/** The notation the picker emits. Defaults to `oklch` (or `hex` with the deprecated `emitHex`). */
	format?: "oklch" | "hex" | "rgb" | "hsl"
	/** @deprecated Use `format="hex"`. */
	emitHex?: boolean
}

function normalizeHex(value: string): string | null {
	const normalized = value.trim().toLowerCase()
	if (/^#[0-9a-f]{6}$/.test(normalized)) return normalized
	if (/^#[0-9a-f]{3}$/.test(normalized)) {
		return `#${normalized
			.slice(1)
			.split("")
			.map((part) => `${part}${part}`)
			.join("")}`
	}
	return null
}

function round(value: number, precision: number): number {
	const rounded = Number(value.toFixed(precision))
	// `-0` serialises as "-0", which is a strange thing to find in a colour.
	return Object.is(rounded, -0) ? 0 : rounded
}

const toOklch = converter("oklch")

/** The picker's hex in the requested notation (via culori); an unparseable string is returned untouched. */
function emit(hex: string, format: NonNullable<ColorInputProps["format"]>): string {
	if (format === "hex") return hex
	const parsed = parse(hex)
	if (!parsed) return hex
	if (format === "rgb") return formatRgb(parsed) ?? hex
	if (format === "hsl") return formatHsl(parsed) ?? hex
	const oklch = toOklch(parsed)
	if (!oklch) return hex
	return `oklch(${round(oklch.l, 4)} ${round(oklch.c, 4)} ${round(oklch.h ?? 0, 2)})`
}

/**
 * The swatch's painted colour as `#rrggbb`, to seed the native picker (which takes nothing
 * else). Computed colours keep their authored space (`oklch()`), so a 1×1 canvas rasterises
 * the string and the pixel is read back.
 */
function paintedColorToHex(element: HTMLElement, fallback: string): string {
	const painted = window.getComputedStyle(element).backgroundColor
	if (!painted) return fallback

	const canvas = document.createElement("canvas")
	canvas.width = 1
	canvas.height = 1
	const context = canvas.getContext("2d", { willReadFrequently: true })
	if (!context) return fallback

	/*
	 * Set twice from different sentinels: `fillStyle` keeps its previous value on a string it
	 * cannot parse, so the two agree only if it parsed.
	 */
	context.fillStyle = "#000000"
	context.fillStyle = painted
	const first = context.fillStyle
	context.fillStyle = "#ffffff"
	context.fillStyle = painted
	if (first !== context.fillStyle) return fallback

	context.clearRect(0, 0, 1, 1)
	context.fillRect(0, 0, 1, 1)
	const [r, g, b, alpha] = context.getImageData(0, 0, 1, 1).data
	/* A swatch with nothing behind it is not black; it is unset. */
	if (alpha === 0) return fallback
	const toHex = (channel: number) => channel.toString(16).padStart(2, "0")
	return `#${toHex(r ?? 0)}${toHex(g ?? 0)}${toHex(b ?? 0)}`
}

/*
 * Whether the browser can paint this string. `var()` always passes, and everything passes
 * without `CSS.supports` (jsdom, old engines).
 */
function isPaintable(value: string): boolean {
	if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return true
	return CSS.supports("color", value)
}

export const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(function ColorInput(
	{
		className,
		value,
		defaultValue,
		onChange,
		onValueChange,
		previewValue,
		strings,
		format,
		emitHex = false,
		disabled,
		readOnly,
		onFocus,
		onBlur,
		...props
	},
	forwardedRef,
) {
	const copy = { ...defaultColorInputStrings, ...strings }
	const [internal, setInternal] = React.useState(String(defaultValue ?? ""))
	const resolved = value !== undefined ? String(value) : internal
	const preview = previewValue ?? resolved
	const fieldNameId = React.useId()
	const [editing, setEditing] = React.useState(false)

	/*
	 * An unpaintable string shows the strike swatch, and once editing stops the field reports
	 * itself invalid (unless the caller set `aria-invalid`).
	 */
	const unreadable = preview.trim() !== "" && !isPaintable(preview)
	const invalid = props["aria-invalid"] ?? (unreadable && !editing ? true : undefined)
	const swatchRef = React.useRef<HTMLSpanElement>(null)
	const [pickerValue, setPickerValue] = React.useState(() => normalizeHex(resolved) ?? "#000000")

	// A layout effect, so the picker never opens on the previous colour for a frame.
	React.useLayoutEffect(() => {
		const direct = normalizeHex(preview)
		if (direct) {
			// oxlint-disable-next-line react/set-state-in-effect -- the fallback below reads a painted computed style off the swatch, so the picker's value is a measurement of the DOM rather than a function of props
			setPickerValue(direct)
			return
		}
		if (!swatchRef.current) return
		setPickerValue((current) => paintedColorToHex(swatchRef.current as HTMLElement, current))
	}, [preview])

	const publishText = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (value === undefined) setInternal(event.target.value)
		onChange?.(event)
		onValueChange?.(event.target.value)
	}

	const publishPicker = (event: React.FormEvent<HTMLInputElement>) => {
		const raw = event.currentTarget.value
		/* `format` wins where both are given; `emitHex` is the older spelling of `"hex"`. */
		const next = emit(normalizeHex(raw) ?? raw, format ?? (emitHex ? "hex" : "oklch"))
		if (value === undefined) setInternal(next)
		onValueChange?.(next)
	}

	/*
	 * The swatch is named for what it does and described by its field's label; naming it by
	 * the label would make `getByLabelText("Primary")` match two controls.
	 */
	const fieldLabelledBy = props["aria-labelledby"] ?? (props["aria-label"] ? fieldNameId : undefined)

	return (
		<div className={cx("color-input--component", styles.colorRoot, className)}>
			<label
				className={styles.colorPicker}
				data-disabled={disabled || readOnly || undefined}
				data-invalid={invalid === true || invalid === "true" || undefined}
			>
				<span
					ref={swatchRef}
					aria-hidden
					className={styles.colorSwatch}
					data-empty={!preview.trim() || unreadable || undefined}
					data-unreadable={unreadable || undefined}
					style={{ background: preview.trim() && !unreadable ? preview : undefined }}
				/>
				{!!props["aria-label"] && !props["aria-labelledby"] && (
					<span id={fieldNameId} hidden>
						{props["aria-label"]}
					</span>
				)}
				<input
					type="color"
					className={styles.colorNative}
					value={pickerValue}
					disabled={disabled || readOnly}
					aria-label={copy.picker}
					aria-describedby={fieldLabelledBy}
					onInput={publishPicker}
				/>
			</label>
			<Input
				{...props}
				ref={forwardedRef}
				value={resolved}
				disabled={disabled}
				readOnly={readOnly}
				aria-invalid={invalid}
				onChange={publishText}
				onFocus={(event) => {
					setEditing(true)
					onFocus?.(event)
				}}
				onBlur={(event) => {
					setEditing(false)
					onBlur?.(event)
				}}
				className={styles.colorText}
			/>
		</div>
	)
})
