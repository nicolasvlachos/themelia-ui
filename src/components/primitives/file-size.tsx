/**
 * FileSize. Binary steps with KB/MB labels by default (as Windows shows); `base` switches
 * convention. See file-size.format.ts.
 */
import type { ReactNode, Ref } from "react"

import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"
import { formatFileSize, type FileSizeBase, type FileSizeUnit } from "./file-size.format"

export interface FileSizeProps extends SpanProps {
	/** The size. Bytes unless `from` says otherwise. */
	value?: number | null
	/**
	 * The unit `value` is given in. Converted with the same base, so `from="megabytes"` means
	 * 2^20 under `binary` and 10^6 under `decimal`.
	 */
	from?: FileSizeUnit
	/**
	 * Which base and which labels. `binary` divides by 1024 and labels it MB — the pairing
	 * Windows and most file managers show, chosen so a size agrees with the machine it
	 * describes rather than with SI. `decimal` is SI-correct and what Apple platforms and
	 * storage vendors use. `iec` is strictly correct. The default does not move, so nothing
	 * already shipped changes.
	 * @default "binary"
	 */
	base?: FileSizeBase
	locale?: string
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	/**
	 * For a size given a box of its own. A COLUMN of sizes is aligned by the column —
	 * `<TableCell align="end">` — because the primitive is a span, and blockifying it to
	 * align would break the text runs it also sits in.
	 */
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
