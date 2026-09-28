/** A CSS length: a number with a unit or a percentage, or a math or `var()` expression. */
export type CssLength =
	| `${number}${"px" | "rem" | "em" | "ch" | "%" | "vw" | "vh" | "dvw" | "dvh" | "svw" | "svh" | "lvw" | "lvh"}`
	| `${"calc" | "min" | "max" | "clamp" | "var"}(${string})`
