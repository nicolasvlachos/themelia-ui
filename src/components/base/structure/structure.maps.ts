import type {
	AdaptiveGridMinimum,
	StructureWidth,
	StructureAlign,
	StructureDirection,
	StructureGap,
	StructureJustify,
} from "./structure.types"

/** Prop value → CSS value. Gaps are spacing tokens, so structure follows density. */
export const GAP: Record<StructureGap, string> = {
	none: "0",
	"2xs": "var(--space-2xs)",
	xs: "var(--space-xs)",
	sm: "var(--space-sm)",
	md: "var(--space-md)",
	lg: "var(--space-lg)",
	xl: "var(--space-xl)",
	"2xl": "var(--space-2xl)",
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

export const ADAPTIVE_MIN: Record<AdaptiveGridMinimum, string> = {
	sm: "var(--adaptive-grid-min-sm)",
	md: "var(--adaptive-grid-min-md)",
	lg: "var(--adaptive-grid-min-lg)",
}

/** Width step → CSS value; anything else passes through as a length (`maxWidth="26rem"`). */
export const WIDTH: Record<StructureWidth, string> = {
	sm: "var(--content-width-sm)",
	md: "var(--content-width-md)",
	lg: "var(--content-width-lg)",
	xl: "var(--content-width-xl)",
	"2xl": "var(--content-width-2xl)",
	full: "100%",
	none: "none",
}

export const width = (value: string) => WIDTH[value as StructureWidth] ?? value
