/**
 * Name: a name normalised for display. Title-cases only ALL CAPS or all-lower input;
 * deliberate casing ("McDonald", "iPhone") is left alone.
 */
import type { ReactNode } from "react"

import { ValueRoot, type ValueProps } from "./value"
import { formatName } from "./name.format"

export interface NameProps extends Omit<ValueProps, "children"> {
	/** The whole name, however it was stored. */
	value?: string | null
	children?: ReactNode
	/**
	 * Title-cases a name that already looks INTENTIONALLY cased. A name arriving all-shouting
	 * or all-lowercase is re-cased without it — those two carry no intent to preserve. Off by
	 * default, because a name is the one field where the stored casing is usually deliberate:
	 * `force` is what overrides that judgement. Hyphens and apostrophes each take a capital
	 * (jean-luc → Jean-Luc, o'brien → O'Brien); an intercap does not, so mcdonald becomes
	 * Mcdonald — Mc, Mac and van der have no rule that is right for every name carrying them.
	 */
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
