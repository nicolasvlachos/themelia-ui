import { defaultSelectStrings, type SelectStrings } from "@/components/base/choice-inputs"

import type { RoundingMode } from "./decimal.format"

/* Extends Select's strings as the props do: one object carries the placeholder and the mode labels. */
export type RoundingModeStrings = SelectStrings & Record<RoundingMode, string>

export const defaultRoundingModeStrings: RoundingModeStrings = {
	...defaultSelectStrings,
	floor: "Round down",
	round: "Round half up",
	ceil: "Round up",
	"half-even": "Round half to even",
}
