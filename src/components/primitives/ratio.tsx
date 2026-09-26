/**
 * Ratio ("3 of 10", a count against a total) and Rating ("4.5 out of 5", a value on a
 * fixed scale). Both show the total by default.
 */
import type { ReactNode, Ref } from "react"

import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"
import {
	defaultRatingStrings,
	defaultRatioStrings,
	type RatingStrings,
	type RatioStrings,
} from "./primitives.strings"

type SharedProps = SpanProps & {
	locale?: string
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

export interface RatioProps extends SharedProps {
	value?: number | null
	/** What the value is counted against. Without it the component renders the value alone. */
	total?: number | null
	/** `words` reads "3 of 10" (prose); `fraction` reads "3/10" (tables). */
	format?: "words" | "fraction"
	strings?: Partial<RatioStrings>
}

export function Ratio({
	value,
	total,
	format = "words",
	locale,
	strings,
	align,
	...props
}: RatioProps) {
	const { locale: scopeLocale } = useFormatting()
	const copy = { ...defaultRatioStrings, ...strings }
	const resolved = locale ?? scopeLocale
	const empty = value === null || value === undefined || !Number.isFinite(value)

	const number = (input: number) => new Intl.NumberFormat(resolved).format(input)

	return (
		<ValueRoot hook="ratio" numeric align={align} {...props}>
			{empty
				? undefined
				: total === null || total === undefined || !Number.isFinite(total)
					? number(value)
					: format === "fraction"
						? `${number(value)}${copy.fraction}${number(total)}`
						: `${number(value)} ${copy.of} ${number(total)}`}
		</ValueRoot>
	)
}

export interface RatingProps extends SharedProps {
	value?: number | null
	/** The top of the scale. Five unless said otherwise, which is the common instrument. */
	max?: number
	/**
	 * Hides the scale, leaving the score alone.
	 *
	 * For a surface that states the scale elsewhere — a column headed "Rating / 5", or a
	 * row of stars that already shows it. Not the default, because "4.5" on its own is a
	 * number a reader has to guess the meaning of.
	 */
	hideMax?: boolean
	strings?: Partial<RatingStrings>
}

export function Rating({
	value,
	max = 5,
	hideMax = false,
	locale,
	strings,
	align,
	...props
}: RatingProps) {
	const { locale: scopeLocale } = useFormatting()
	const copy = { ...defaultRatingStrings, ...strings }
	const resolved = locale ?? scopeLocale
	const empty = value === null || value === undefined || !Number.isFinite(value)

	/*
	 * `maximumFractionDigits: 1` rather than a fixed one: a rating of exactly 4 should read
	 * "4", not "4.0", and 4.53 should not carry precision the instrument does not have.
	 */
	const score = empty ? "" : new Intl.NumberFormat(resolved, { maximumFractionDigits: 1 }).format(value)

	return (
		<ValueRoot hook="rating" numeric align={align} {...props}>
			{empty
				? undefined
				: hideMax || !Number.isFinite(max)
					? score
					: `${score} ${copy.outOf} ${new Intl.NumberFormat(resolved).format(max)}`}
		</ValueRoot>
	)
}
