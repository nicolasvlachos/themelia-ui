/**
 * Range: a numeric span as one value. `Intl.NumberFormat.formatRange` owns the locale's
 * separator, which is why this formats currency and units itself rather than taking two
 * formatted children. Equal ends use `format`: `formatRange(10, 10)` gives "~£10.00".
 */
import type { ReactNode, Ref } from "react"

import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"

export interface RangeProps extends SpanProps {
	/**
	 * The low end. One end alone still renders — "from £10", with the caller's copy around
	 * the value.
	 */
	from?: number | null
	/** The high end. One end alone still renders, with the caller's copy around the value. */
	to?: number | null
	/**
	 * An ISO currency code. Renders the range as money: Intl repeats the symbol on both ends,
	 * which is its considered answer to the ambiguity a single symbol creates.
	 */
	currency?: string
	/**
	 * A CSS-style unit identifier — `kilogram`, `day`. Renders the range with its unit.
	 * Ignored when `currency` is set.
	 */
	unit?: string
	/** Caps the decimals on both ends. */
	maximumFractionDigits?: number
	locale?: string
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

export function Range({
	from,
	to,
	currency,
	unit,
	maximumFractionDigits,
	locale,
	align,
	...props
}: RangeProps) {
	const { locale: scopeLocale } = useFormatting()
	const resolved = locale ?? scopeLocale

	const hasFrom = from !== null && from !== undefined && Number.isFinite(from)
	const hasTo = to !== null && to !== undefined && Number.isFinite(to)

	let text: string | undefined
	if (hasFrom || hasTo) {
		const options: Intl.NumberFormatOptions = {
			maximumFractionDigits,
			...(currency ? { style: "currency", currency } : null),
			...(!currency && unit ? { style: "unit", unit } : null),
		}

		/* An unknown currency or unit makes `Intl` throw; fall back to a plain number. */
		let format: Intl.NumberFormat
		try {
			format = new Intl.NumberFormat(resolved, options)
		} catch {
			format = new Intl.NumberFormat(resolved, { maximumFractionDigits })
		}

		/* One end only renders that value (the caller's copy says "from"); equal ends too, avoiding the tilde. */
		text =
			hasFrom && hasTo && from !== to
				? format.formatRange(from, to)
				: format.format(hasFrom ? from : (to as number))
	}

	return (
		<ValueRoot hook="range" numeric align={align} {...props}>
			{text}
		</ValueRoot>
	)
}
