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

/** The two routes out of an overlay, each switchable on its own. */
export interface OverlayDismissal {
	/**
	 * Backdrop click dismisses. Off for a decision the user must answer.
	 * @default true
	 */
	backdrop?: boolean
	/**
	 * Escape dismisses. Off for destructive or in-progress work.
	 * @default true
	 */
	escape?: boolean
}

export interface OverlayRootProps {
	/** Controlled open state. Pair with `onOpenChange`. */
	open?: boolean
	/** The open state to start with, when uncontrolled. */
	defaultOpen?: boolean
	/** Called with the next open state, whichever control or route changed it. */
	onOpenChange?: (open: boolean) => void
	/** The trigger and the content, with anything else the surface needs around them. */
	children: ReactNode
}

export interface OverlayContentProps {
	/**
	 * Where the surface sits. Centre reads as a dialog, an edge as a sheet. DialogContent and
	 * AlertDialogContent fix it to centre; SheetContent exposes it as `side`.
	 */
	placement?: OverlayPlacement
	/**
	 * Cross-axis extent for an edge placement — the width of a side panel; a top or bottom
	 * one sizes to its content and takes this as the ceiling. Named steps resolve to tokens;
	 * any other CSS length is used as given. Ignored when centred.
	 * @default "md"
	 */
	size?: OverlaySize
	/**
	 * Along-axis extent, for an edge placement. Less than full detaches the panel and centres
	 * it on that axis. It is measured against the space the inset leaves rather than the
	 * viewport: 70% of an inset panel is 70% of what is between the offsets, and the rest is
	 * split between the two ends. Full needs no inset to look right, which is why a
	 * corner-anchored sheet sets only `inset`.
	 * @default "full"
	 */
	length?: OverlayLength
	/**
	 * The gap to the viewport edges. `false` is flush — a sheet welded to the side; `true`
	 * uses the kit's gap; any CSS length sets your own. One offset, spent on every side the
	 * panel does not run to, so an inset side panel sits the same distance from the top, the
	 * side and the bottom. Any gap detaches it, rounds all four corners and gives it a full
	 * border.
	 * @default false
	 */
	inset?: OverlayInset
	/**
	 * How much of the page the surface takes hostage: scrim, inert background and scroll
	 * lock (`modal`), focus alone (`trap-focus`), or neither (`non-modal`).
	 * @default "modal"
	 */
	modality?: OverlayModality
	/**
	 * `bare` drops the region dividers, for content that draws its own chrome.
	 * @default "framed"
	 */
	surface?: OverlaySurface
	/**
	 * Each route out, separately. Off for a decision that must be answered, or for work in
	 * progress. AlertDialogContent fixes both off.
	 * @default { backdrop: true, escape: true }
	 */
	dismissal?: OverlayDismissal
	/** Element to focus on open, instead of the first tabbable node. */
	initialFocusRef?: RefObject<HTMLElement | null>
	/** Renders the corner dismiss control. AlertDialogContent turns it off. */
	showCloseButton?: boolean
	/** Overrides this surface's own copy — the corner dismiss control's name. */
	strings?: Partial<OverlayStrings>
	className?: string
	children?: ReactNode
}
