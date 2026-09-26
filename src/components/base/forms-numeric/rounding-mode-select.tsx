/**
 * RoundingModeSelect — how a monetary or measured value resolves a half: `round`
 * (everyday), `floor` (never more), `ceil` (never less), `half-even` (no bias across long
 * columns). Values are `RoundingMode`, exactly what `DecimalInput` accepts.
 */
import { forwardRef, useMemo } from "react"

import {
	Select, type SelectProps,
} from "@/components/base/choice-inputs"

import type { RoundingMode } from "./decimal.format"
import { defaultRoundingModeStrings, type RoundingModeStrings } from "./rounding-mode-select.strings"

/** The everyday three; `half-even` suits accounting columns and is opt-in. */
const DEFAULT_MODES: RoundingMode[] = ["floor", "round", "ceil"]

export interface RoundingModeSelectProps
	extends Omit<SelectProps, "options" | "value" | "onValueChange"> {
	value?: RoundingMode
	onValueChange?: (value: RoundingMode | undefined) => void
	/** Which modes to offer, in order. Include `half-even` for an accounting surface. */
	modes?: RoundingMode[]
	/** Replaces the mode labels. */
	strings?: Partial<RoundingModeStrings>
}

export const RoundingModeSelect = forwardRef<HTMLButtonElement, RoundingModeSelectProps>(
	function RoundingModeSelect({ value, onValueChange, modes, strings, ...props }, ref) {
		/* Merge inside the memo: merged outside, a new object each render would defeat it. */
		const options = useMemo(() => {
			const copy = { ...defaultRoundingModeStrings, ...strings }
			return (modes ?? DEFAULT_MODES).map((mode) => ({ value: mode, label: copy[mode] }))
		}, [modes, strings])

		return (
			<Select
				ref={ref}
				options={options}
				value={value ?? null}
				onValueChange={(next) => onValueChange?.((next ?? undefined) as RoundingMode | undefined)}
				{...props}
			/>
		)
	},
)
