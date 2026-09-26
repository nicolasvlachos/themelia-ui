/**
 * Name: a name normalised for display. Title-cases only ALL CAPS or all-lower input;
 * deliberate casing ("McDonald", "iPhone") is left alone.
 */
import type { ReactNode } from "react"

import { ValueRoot, type ValueProps } from "./value"
import { formatName } from "./name.format"

export interface NameProps extends Omit<ValueProps, "children"> {
	value?: string | null
	children?: ReactNode
	force?: boolean
}

export function Name({ value, children, force, ...props }: NameProps) {
	const source = value ?? (typeof children === "string" ? children : undefined)
	return (
		<ValueRoot hook="name" {...props}>
			{source ? formatName(source, { force }) : (children ?? undefined)}
		</ValueRoot>
	)
}
