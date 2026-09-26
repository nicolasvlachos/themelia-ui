/**
 * Value: the base of the primitive family. Every primitive renders through `Text`, and an
 * absent value renders the shared empty marker, not an empty string.
 */
import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react"

import { Text, type TextProps } from "@/components/base/typography"
import { EMPTY } from "@/lib/format"
import type { TextSize } from "@/lib/ui-provider"
import { cx } from "@/lib/cx"
import { renderValueChildren } from "./value-children"

export type SpanProps = Omit<ComponentPropsWithoutRef<"span">, "children" | "color">
/**
 * `inherit` selects no colour, for a value inside a surface that already sets one — the
 * over-limit half of a character count, a figure in a toned callout.
 */
export type ValueType = Extract<TextProps["type"], "inherit" | "main" | "secondary">

export interface ValueProps extends SpanProps {
	children?: ReactNode
	/** Rendered when the value is absent. */
	emptyLabel?: ReactNode
	size?: TextSize
	align?: TextProps["align"]
	weight?: TextProps["weight"]
	type?: ValueType
	/** Ellipsises the value at one line. Every flex box in the chain needs `min-width: 0` — see `Text`. */
	truncate?: boolean
	ref?: Ref<HTMLSpanElement>
}

/** Shared shell so the empty state and the BEM hook are defined once. */
export function ValueRoot({
	children,
	emptyLabel = EMPTY,
	size,
	align,
	weight = "regular",
	type = "main",
	truncate,
	className,
	hook,
	numeric,
	ref,
	...props
}: ValueProps & { hook: string; numeric?: boolean }) {
	const empty = children === null || children === undefined || children === ""
	return (
		<Text
			ref={ref}
			tag="span"
			size={size}
			align={align}
			weight={weight}
			type={type}
			numeric={numeric}
			truncate={truncate}
			data-empty={empty ? "" : undefined}
			className={cx(`${hook}--component`, className)}
			{...props}
		>
			{renderValueChildren(children, emptyLabel)}
		</Text>
	)
}

export function Value(props: ValueProps) {
	return <ValueRoot hook="value" {...props} />
}

/** A value that supports the primary one — a subtitle, a unit, a qualifier. */
export function SecondaryValue({ type = "secondary", ...props }: ValueProps) {
	return <ValueRoot hook="secondary-value" type={type} {...props} />
}

/** Incidental copy — present, but not something the reader is meant to act on. */
export function MutedValue({ type = "secondary", size = "xs", ...props }: ValueProps) {
	return <ValueRoot hook="muted-value" type={type} size={size} {...props} />
}

/** Identifiers, hashes, SKUs — fixed width so they compare down a column. */
export function MonoValue({ className, ...props }: ValueProps) {
	return <ValueRoot hook="mono-value" numeric className={cx("value--mono", className)} {...props} />
}

export interface EmptyValueProps extends Omit<ValueProps, "children"> {
	label?: ReactNode
}

/** The absent state on its own, for a slot that has nothing to show. */
export function EmptyValue({ label = EMPTY, ...props }: EmptyValueProps) {
	return <ValueRoot hook="empty-value" type="secondary" emptyLabel={label} {...props} />
}
