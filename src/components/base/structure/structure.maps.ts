import type {
	AdaptiveGridMinimum,
	StructureWidth,
	StructureAlign,
	StructureDirection,
	StructureGap,
	StructureJustify,
} from "./structure.types"

/** Prop value → CSS value. Gaps are the theme's two gaps, so structure follows density. */
export const GAP: Record<StructureGap, string> = {
	none: "0",
	sm: "var(--gap-sm)",
	default: "var(--gap)",
}

export const DIRECTION: Record<StructureDirection, string> = {
	vertical: "column",
	horizontal: "row",
}

export const ALIGN: Record<StructureAlign, string> = {
	start: "flex-start",
	center: "center",
	end: "flex-end",
	stretch: "stretch",
	baseline: "baseline",
}

export const JUSTIFY: Record<StructureJustify, string> = {
	start: "flex-start",
	center: "center",
	end: "flex-end",
	between: "space-between",
	around: "space-around",
	evenly: "space-evenly",
}

/** The narrowest a column may get before AdaptiveGrid drops a track. */
export const ADAPTIVE_MIN: Record<AdaptiveGridMinimum, string> = {
	default: "16rem",
	sm: "12rem",
}

/** Width step → CSS value; anything else passes through as a length (`maxWidth="26rem"`). */
export const WIDTH: Record<StructureWidth, string> = {
	default: "var(--content-width)",
	sm: "40rem",
	full: "100%",
	none: "none",
}

export const width = (value: string) => WIDTH[value as StructureWidth] ?? value
