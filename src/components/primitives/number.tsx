/**
 * Number and Percent. Locale comes from the provider. Not right-aligned by default:
 * `<TableCell align="end">` aligns a column.
 */
import type { ReactNode, Ref } from "react"

import { formatNumber, formatPercentage } from "@/lib/format"
import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"

export interface NumberProps extends SpanProps {
	value?: number | string | null
	locale?: string
	options?: Intl.NumberFormatOptions
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

const toNumber = (value: number | string | null | undefined) => {
	if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) return undefined
	const parsed = typeof value === "number" ? value : Number(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

export function Number_({ value, locale, options, align, ...props }: NumberProps) {
	const { locale: scopeLocale } = useFormatting()
	const parsed = toNumber(value)
	return (
		<ValueRoot
			hook="number"
			numeric
			align={align}
			{...props}
		>
			{parsed === undefined ? undefined : formatNumber(parsed, { locale: locale ?? scopeLocale, ...options })}
		</ValueRoot>
	)
}
export { Number_ as Number }

export interface PercentProps extends Omit<NumberProps, "options"> {
	/** The value is already 0–100 rather than 0–1. */
	scaled?: boolean
	options?: Intl.NumberFormatOptions
}

export function Percent({
	value,
	locale,
	options,
	scaled = false,
	align,
	...props
}: PercentProps) {
	const { locale: scopeLocale } = useFormatting()
	const parsed = toNumber(value)
	return (
		<ValueRoot hook="percent" numeric align={align} {...props}>
			{parsed === undefined
				? undefined
				: formatPercentage(scaled ? parsed / 100 : parsed, { locale: locale ?? scopeLocale, ...options })}
		</ValueRoot>
	)
}
