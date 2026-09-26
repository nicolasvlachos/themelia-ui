/**
 * InlineList: several values read as one phrase ("Alice, Bob and Carol"), joined by
 * `Intl.ListFormat` for the locale's conjunction rules. `items` are strings because
 * ListFormat formats text; a row of badges is a `Stack`.
 */
import type { ReactNode, Ref } from "react"

import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type SpanProps, type ValueProps } from "./value"
import { defaultInlineListStrings, type InlineListStrings } from "./primitives.strings"

export interface InlineListProps extends SpanProps {
	items?: readonly string[] | null
	/**
	 * `and` is "A, B and C"; `or` is "A, B or C"; `none` is "A, B, C", for lists that are
	 * not prose. (Not `type`, which primitives use for the text tone.)
	 */
	join?: "and" | "or" | "none"
	/**
	 * `long` is "and", `short` is "&" where the locale has one, `narrow` drops it.
	 * (Not `style`, the DOM attribute.)
	 */
	joinStyle?: "long" | "short" | "narrow"
	/**
	 * Shows at most this many, then a count of the rest inside the list, so the
	 * conjunction still lands correctly: "Alice, Bob and 3 more".
	 */
	max?: number
	locale?: string
	strings?: Partial<InlineListStrings>
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLSpanElement>
}

export function InlineList({
	items,
	join = "and",
	joinStyle = "long",
	max,
	locale,
	strings,
	align,
	...props
}: InlineListProps) {
	const { locale: scopeLocale } = useFormatting()
	const copy = { ...defaultInlineListStrings, ...strings }
	const resolved = locale ?? scopeLocale

	let text: string | undefined
	if (items && items.length > 0) {
		let parts = [...items]
		if (max !== undefined && max > 0 && parts.length > max) {
			const hidden = parts.length - max
			parts = [...parts.slice(0, max), copy.more(hidden)]
		}
		/* Falls back to the default style if the engine rejects this type/style pair. */
		const intlType = join === "and" ? "conjunction" : join === "or" ? "disjunction" : "unit"
		try {
			text = new Intl.ListFormat(resolved, { type: intlType, style: joinStyle }).format(parts)
		} catch {
			text = new Intl.ListFormat(resolved, { type: intlType }).format(parts)
		}
	}

	return (
		<ValueRoot hook="inline-list" align={align} {...props}>
			{text}
		</ValueRoot>
	)
}
