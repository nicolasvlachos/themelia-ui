/** Dimensions: width × height, optionally × depth, with one separator and unit rule. */
import type { ReactNode, Ref } from "react"

import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"
import { formatDimensions, type DimensionPart } from "./dimensions.format"

export interface DimensionsProps extends SpanProps {
	width?: DimensionPart
	height?: DimensionPart
	depth?: DimensionPart
	unit?: ReactNode
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
