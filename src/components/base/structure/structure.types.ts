import type { ComponentScale } from "@/lib/component-vocabulary"
import type { CssLength } from "@/lib/css-length"
import { BREAKPOINTS } from "@/lib/responsive"

export type { CssLength }

// The breakpoint vocabulary lives in `lib`; re-exported under the published names.
export type { Breakpoint as StructureBreakpoint, ResponsiveValue } from "@/lib/responsive"

/**
 * The two gaps: `default` between groups (fields, cards, sections), `sm` inside a group
 * (icon and label, title and description, a toolbar's controls). Unset is `default`.
 */
export type StructureGap = "none" | "sm" | "default"
export type StructureAlign = "start" | "center" | "end" | "stretch" | "baseline"
export type StructureJustify = "start" | "center" | "end" | "between" | "around" | "evenly"
export type StructureDirection = "vertical" | "horizontal"
export type GridColumns = 1 | 2 | 3 | 4
export type GridSpan = GridColumns | "full"
export type AdaptiveGridMinimum = ComponentScale

/**
 * The content width (`default`), a narrow reading or form measure (`sm`), or any CSS length
 * for a control measure such as a field's ~26rem.
 */
export type StructureWidth = "default" | "sm" | "full" | "none"

/** The axis a `Bleed` escapes on. */
export type BleedAxis = "inline" | "block" | "both"

/** Which side of a `Split` holds the fixed column. */
export type SplitSide = "start" | "end"

export const STRUCTURE_BREAKPOINTS = BREAKPOINTS
