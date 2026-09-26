import type { CSSProperties } from "react"

/** The three widths a docs example may use, so a control has one width across pages. */
export const MEASURE = {
	/** A control whose whole point is that it is short — a rail, a code, a unit. */
	narrow: { maxWidth: "16rem", width: "100%" },
	/** One field per row. The common case. */
	field: { maxWidth: "26rem", width: "100%" },
	/** Two fields on a row, a card, a disclosure. */
	wide: { maxWidth: "34rem", width: "100%" },
} satisfies Record<string, CSSProperties>
