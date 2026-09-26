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
	/** Names the fact. */
	label: ReactNode
	/** The fact itself. Absent renders the empty marker. */
	value?: ReactNode
	layout?: InlineStatLayout
	/** Tabular figures, for amounts and counters, so a column of these compares cleanly. */
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
