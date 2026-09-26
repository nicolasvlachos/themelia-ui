/**
 * FileSize. Binary steps with KB/MB labels by default (as Windows shows); `base` switches
 * convention. See file-size.format.ts.
 */
import type { ReactNode, Ref } from "react"

import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"
import { formatFileSize, type FileSizeBase, type FileSizeUnit } from "./file-size.format"

export interface FileSizeProps extends SpanProps {
	value?: number | null
	from?: FileSizeUnit
	/** `binary` (default), `decimal`, or `iec`. See file-size.format.ts. */
	base?: FileSizeBase
	locale?: string
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

/*
 * Not right-aligned by default: a span in running text as often as a cell. Use
 * `<TableCell align="end">` for columns; pass `align` only when the value has its own box.
 */
export function FileSize({ value, from, base, locale, align, ...props }: FileSizeProps) {
	const { locale: scopeLocale } = useFormatting()
	return (
		<ValueRoot hook="file-size" numeric align={align} {...props}>
			{value === null || value === undefined || !Number.isFinite(value)
				? undefined
				: formatFileSize(value, { from, base, locale: locale ?? scopeLocale })}
		</ValueRoot>
	)
}
