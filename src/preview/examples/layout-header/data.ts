/*
 * The frame holds a strip of page under the header, so the rounded corners belong to the
 * page body and the header's bottom rule runs unclipped.
 */
export const FRAME = {
	width: "100%",
	/* Give the sticky backdrop layer the same clipping curve as the frame. */
	clipPath: "inset(0 round var(--radius))",
	border: "var(--border-width) solid var(--border)",
	borderRadius: "var(--radius)",
	overflow: "hidden",
} as const

/** The page under the bar. It exists to own the frame's bottom corners. */
export const FRAME_BODY = {
	height: "1.5rem",
	backgroundColor: "color-mix(in oklab, var(--muted) var(--tint-strong), transparent)",
} as const
