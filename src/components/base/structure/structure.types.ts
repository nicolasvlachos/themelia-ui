import type { ComponentScale } from "@/lib/component-vocabulary"
import { BREAKPOINTS } from "@/lib/responsive"

// The breakpoint vocabulary lives in `lib`; re-exported under the published names.
export type { Breakpoint as StructureBreakpoint, ResponsiveValue } from "@/lib/responsive"

export type StructureGap = "none" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
export type StructureAlign = "start" | "center" | "end" | "stretch" | "baseline"
export type StructureJustify = "start" | "center" | "end" | "between" | "around" | "evenly"
export type StructureDirection = "vertical" | "horizontal"
export type GridColumns = 1 | 2 | 3 | 4
export type GridSpan = GridColumns | "full"
export type AdaptiveGridMinimum = ComponentScale

/**
 * A content-width step (`--content-width-*`), or any CSS length for a control measure such
 * as a field's ~26rem.
 */
export type StructureWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none"

/** The axis a `Bleed` escapes on. */
export type BleedAxis = "inline" | "block" | "both"

/** Which side of a `Split` holds the fixed column. */
export type SplitSide = "start" | "end"

export const STRUCTURE_BREAKPOINTS = BREAKPOINTS
