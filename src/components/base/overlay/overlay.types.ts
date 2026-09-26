import type { OverlayStrings } from "./overlay.strings"

import type { ReactNode, RefObject } from "react"

/** Where the surface sits. Centre reads as a dialog; edges read as sheets and drawers. */
export type OverlayPlacement =
	| "center"
	| "inline-start"
	| "inline-end"
	| "block-start"
	| "block-end"

/**
 * `modal` — focus trap, scrim, inert page, scroll lock.
 * `trap-focus` — focus stays inside; the page keeps scroll and pointer events (an inspector).
 * `non-modal` — no trap, no scrim, page fully interactive.
 */
export type OverlayModality = "modal" | "trap-focus" | "non-modal"

/** Chrome treatment. `bare` drops the region dividers for a surface that owns its own. */
export type OverlaySurface = "framed" | "bare"

/** Cross-axis extent of an edge-placed surface (a side panel's width): a step or any CSS length. */
export type OverlaySize = "sm" | "md" | "lg" | "full" | (string & {})

/** Along-axis extent (a side panel's height). `full` welds it to both ends; less centres it. */
export type OverlayLength = "full" | (string & {})

/**
 * The gap to the viewport edges: `false` is flush, `true` the kit's gap, or any CSS length.
 * An inset panel rounds all four corners.
 */
export type OverlayInset = boolean | (string & {})

export interface OverlayDismissal {
	/** Backdrop click dismisses. Off for a decision the user must answer. */
	backdrop?: boolean
	/** Escape dismisses. Off for destructive or in-progress work. */
	escape?: boolean
}

export interface OverlayRootProps {
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	children: ReactNode
}

export interface OverlayContentProps {
	placement?: OverlayPlacement
	/** Cross-axis extent, for an edge placement. Ignored when centred. */
	size?: OverlaySize
	/** Along-axis extent, for an edge placement. Less than full centres the panel. */
	length?: OverlayLength
	/** Detaches the surface from the viewport edges. */
	inset?: OverlayInset
	modality?: OverlayModality
	surface?: OverlaySurface
	dismissal?: OverlayDismissal
	/** Element to focus on open, instead of the first tabbable node. */
	initialFocusRef?: RefObject<HTMLElement | null>
	/** Renders the corner dismiss control. */
	showCloseButton?: boolean
	/** Overrides this surface's own copy — the corner dismiss control's name. */
	strings?: Partial<OverlayStrings>
	className?: string
	children?: ReactNode
}
