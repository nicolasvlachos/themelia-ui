/**
 * InlineStat — one label and one value, on a row or stacked, inside another surface's
 * chrome (use `MetadataList` for a set). An absent value renders the empty marker.
 */
import type { ReactNode } from "react"
import type { ComponentProps } from "react"

import { DisplayLabel } from "@/components/base/typography"
import { MonoValue, Value } from "@/components/primitives"
import { cx } from "@/lib/cx"

import styles from "./display.module.css"

/**
 * `between`: opposite ends of the box, for a panel row. `inline`: together, among other
 * facts. `stacked`: label over value.
 */
export type InlineStatLayout = "between" | "inline" | "stacked"

export interface InlineStatProps extends Omit<ComponentProps<"div">, "children"> {
	/** Names the fact. Rendered as a `DisplayLabel`, which has one style everywhere. */
	label: ReactNode
	/**
	 * The fact itself. Absent renders the empty marker rather than collapsing the row to its
	 * label — a dash says the fact was looked for.
	 */
	value?: ReactNode
	/** How the free space between label and value is spent — the only thing the three change. */
	layout?: InlineStatLayout
	/**
	 * Tabular figures, for an amount or a counter — what makes a column of these compare down
	 * the page instead of jittering with each digit's width.
	 */
	mono?: boolean
}

export function InlineStat({
	label,
	value,
	layout = "between",
	mono = false,
	className,
	...props
}: InlineStatProps) {
	const ValuePrimitive = mono ? MonoValue : Value

	return (
		<div
			data-layout={layout}
			className={cx("inline-stat--component", styles.inlineStat, className)}
			{...props}
		>
			<DisplayLabel className="inline-stat--label">{label}</DisplayLabel>
			<ValuePrimitive className="inline-stat--value">{value}</ValuePrimitive>
		</div>
	)
}
