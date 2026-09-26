/** Dimensions: width × height, optionally × depth, with one separator and unit rule. */
import type { ReactNode, Ref } from "react"

import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"
import { formatDimensions, type DimensionPart } from "./dimensions.format"

export interface DimensionsProps extends SpanProps {
	/** The first part. The parts stay separate numbers until the render joins them. */
	width?: DimensionPart
	/** The second part. */
	height?: DimensionPart
	/** The third part, optional — two values render as a plane. */
	depth?: DimensionPart
	/** Appended once, not per part. */
	unit?: ReactNode
	/** Between the parts. A multiplication sign, not the letter x. */
	separator?: ReactNode
	locale?: string
	options?: Intl.NumberFormatOptions
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

export function Dimensions({
	width,
	height,
	depth,
	unit,
	separator,
	locale,
	options,
	...props
}: DimensionsProps) {
	const { locale: scopeLocale } = useFormatting()
	return (
		<ValueRoot hook="dimensions" numeric {...props}>
			{formatDimensions(width, height, {
				depth,
				unit: typeof unit === "string" ? unit : undefined,
				separator: typeof separator === "string" ? separator : undefined,
				locale: locale ?? scopeLocale,
				options,
			})}
		</ValueRoot>
	)
}
