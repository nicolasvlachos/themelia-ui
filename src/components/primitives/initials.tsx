/** Initials: the short form of a name, derived from it, for avatars and dense rows. */
import type { Ref } from "react"

import { ValueRoot, type ValueProps } from "./value"
import {
	formatInitials,
	type InitialsMaxCharacters,
	type InitialsStrategy,
} from "./initials-format"

export interface InitialsProps extends Omit<ValueProps, "children"> {
	/** Person, organisation, or resource name to derive initials from. */
	value?: string | null
	/** First + last word by default; `first-words` keeps the leading N words instead. */
	strategy?: InitialsStrategy
	maxCharacters?: InitialsMaxCharacters
	locale?: string
	/** Returned when no usable letter or number exists. */
	fallback?: string
	ref?: Ref<HTMLSpanElement>
}

export function Initials({
	value,
	strategy,
	maxCharacters,
	locale,
	fallback = "",
	...props
}: InitialsProps) {
	return (
		<ValueRoot hook="initials" {...props}>
			{value ? formatInitials(value, { strategy, maxCharacters, locale, fallback }) : undefined}
		</ValueRoot>
	)
}
