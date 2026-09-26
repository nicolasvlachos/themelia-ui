/**
 * Quantity counts things with a noun that agrees ("1 item", "3 items"): `Intl.PluralRules`
 * picks the form and the caller supplies the forms. Measure states a physical amount with
 * Intl unit formatting ("2.5 kg").
 */
import type { ReactNode, Ref } from "react"

import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"

type SharedProps = SpanProps & {
	locale?: string
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

/**
 * The noun forms a locale might ask for. `one` and `other` cover English; the rest are the
 * other `Intl.PluralRules` categories. Anything missing falls back to `other`.
 */
export interface PluralForms {
	one: string
	other: string
	zero?: string
	two?: string
	few?: string
	many?: string
}

export interface QuantityProps extends SharedProps {
	value?: number | null
	/** The noun, in the forms the locale may need. A bare string is used for every form. */
	unit?: PluralForms | string
	/** Rendered instead when the count is zero ("no items"). Off by default. */
	zeroLabel?: ReactNode
}

export function Quantity({ value, unit, zeroLabel, locale, align, ...props }: QuantityProps) {
	const { locale: scopeLocale } = useFormatting()
	const resolved = locale ?? scopeLocale
	const empty = value === null || value === undefined || !Number.isFinite(value)

	let text: string | undefined
	if (!empty) {
		if (value === 0 && zeroLabel !== undefined) {
			text = undefined
		} else {
			const count = new Intl.NumberFormat(resolved).format(value)
			if (unit === undefined) {
				text = count
			} else if (typeof unit === "string") {
				text = `${count} ${unit}`
			} else {
				const rule = new Intl.PluralRules(resolved).select(value)
				const noun = unit[rule as keyof PluralForms] ?? unit.other
				text = `${count} ${noun}`
			}
		}
	}

	if (!empty && value === 0 && zeroLabel !== undefined) {
		return (
			<ValueRoot hook="quantity" align={align} {...props}>
				{zeroLabel}
			</ValueRoot>
		)
	}

	return (
		<ValueRoot hook="quantity" numeric align={align} {...props}>
			{text}
		</ValueRoot>
	)
}

export interface MeasureProps extends SharedProps {
	value?: number | null
	/**
	 * A CSS-style unit identifier — `kilogram`, `meter`, `liter`, `celsius`, `byte`.
	 *
	 * Passed to `Intl.NumberFormat`, which owns both the abbreviation and where it goes:
	 * English writes "2.5 kg" and French writes "2,5 kg", and neither is a string this
	 * component should be assembling.
	 */
	unit?: string
	/** `short` is "2.5 kg", `narrow` is "2.5kg", `long` is "2.5 kilograms". */
	unitDisplay?: "short" | "narrow" | "long"
	/** Caps the decimals. The value is not rounded before formatting. */
	maximumFractionDigits?: number
}

export function Measure({
	value,
	unit,
	unitDisplay = "short",
	maximumFractionDigits,
	locale,
	align,
	...props
}: MeasureProps) {
	const { locale: scopeLocale } = useFormatting()
	const resolved = locale ?? scopeLocale
	const empty = value === null || value === undefined || !Number.isFinite(value)

	/*
	 * An unknown unit makes `Intl` throw, and a formatter throwing takes the page with it.
	 * A value that renders without its unit is a worse answer than a correct one and a
	 * better answer than a blank screen, so it degrades rather than propagates.
	 */
	let text: string | undefined
	if (!empty) {
		const options: Intl.NumberFormatOptions = { maximumFractionDigits }
		try {
			text = new Intl.NumberFormat(resolved, {
				...options,
				...(unit ? { style: "unit", unit, unitDisplay } : null),
			}).format(value)
		} catch {
			text = new Intl.NumberFormat(resolved, options).format(value)
		}
	}

	return (
		<ValueRoot hook="measure" numeric align={align} {...props}>
			{text}
		</ValueRoot>
	)
}
