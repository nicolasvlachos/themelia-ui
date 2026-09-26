/**
 * Shared shape of the three action overlays: recipes over `base/dialog`, `base/sheet` and
 * `base/alert-dialog`. The primitives own surface, focus trap and placement; these own the
 * footer (which button confirms, pending state, what closes when).
 */
import type { CSSProperties, ReactNode, RefObject } from "react"

import type { ButtonStyle } from "@/components/base/buttons"
import type { SheetSide } from "@/components/base/sheet"
import type { SemanticTone } from "@/lib/component-vocabulary"

import type { OverlayActionStrings } from "./overlays.strings"

/** The tones an overlay can carry; a dialog is never "primary". */
export type OverlayTone = Extract<
	SemanticTone,
	"neutral" | "destructive" | "warning" | "info" | "success"
>

export type OverlayButtonTone = SemanticTone
/** Ghost is excluded: a footer's confirm must look like a commitment. */
export type OverlayButtonStyle = Exclude<ButtonStyle, "ghost">

export interface OverlayBaseProps {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** Fires after it closes, whatever dismissed it. */
	onClose?: () => void
	children?: ReactNode
	/** Supply one even with `hideHeader`: it names the dialog for screen readers. */
	title?: ReactNode
	description?: ReactNode
	/** Keeps the title and description for assistive technology and hides them. */
	hideHeader?: boolean
	showCloseButton?: boolean
	initialFocusRef?: RefObject<HTMLElement | null>
	/** Escape dismisses. Off for destructive or in-progress work. */
	closeOnEscape?: boolean
	closeOnBackdropClick?: boolean
	/** Inline styles on the surface itself, e.g. CSS variables a theme editor previews. */
	surfaceStyle?: CSSProperties
	className?: string
	contentClassName?: string
	strings?: Partial<OverlayActionStrings>
}

/**
 * The footer, and what confirm does. Exactly one confirm path runs, first match wins:
 *
 *   1. `formId`: the button calls `requestSubmit()` on that form; neither callback fires.
 *   2. `onConfirm`: runs, then the overlay closes.
 *   3. `onAsyncConfirm`: awaited with a spinner; closes on success, stays open on
 *      rejection and reports through `onError`.
 *   4. none: the overlay just closes.
 *
 * Passing `onConfirm` alongside `onAsyncConfirm` therefore skips the async one.
 */
export interface OverlayActionProps {
	showCancel?: boolean
	showConfirm?: boolean
	onCancel?: () => void
	onConfirm?: () => void
	onAsyncConfirm?: () => Promise<void>
	/** Receives a rejected async confirm, so a consumer can toast or report it. */
	onError?: (error: unknown) => void
	/** `false` keeps the overlay open after a resolved async confirm (multi-step flows). */
	closeOnAsyncComplete?: boolean
	confirmTone?: OverlayButtonTone
	confirmStyle?: OverlayButtonStyle
	/** Forces the pending presentation, for confirm work owned outside the overlay. */
	loading?: boolean
	formId?: string
	/** Replaces the generated footer. Every prop above stops applying. */
	footer?: ReactNode
}

export interface OverlayEmphasisProps {
	/**
	 * Lets `tone` drive the header glyph and the confirm button's colour. Without it the
	 * tone is presentational only (a warning notice with an ordinary primary confirm).
	 */
	emphasis?: boolean
	tone?: OverlayTone
	showIcon?: boolean
	/** A notice between the header and the body: the consequence, before committing. */
	alertMessage?: ReactNode
}

/** A named step or any CSS length. */
export type OverlayWidth = "sm" | "md" | "lg" | "xl" | "full" | (string & {})

export interface ActionDialogProps
	extends OverlayBaseProps,
		OverlayActionProps,
		OverlayEmphasisProps {
	/** Maximum width. A CSS length, or one of the kit's steps. */
	width?: OverlayWidth
	/** The element that opens it. Supply this OR `open`, not both. */
	trigger?: ReactNode
}

export interface ActionSheetProps
	extends OverlayBaseProps,
		OverlayActionProps,
		OverlayEmphasisProps {
	side?: SheetSide
	/** Cross-axis extent: a side panel's width. */
	size?: string
	/** How far it runs along its edge; `inset` sets the gap from the viewport. See base/sheet. */
	length?: string
	inset?: boolean | string
	showFooter?: boolean
	/**
	 * `modal` traps focus, locks scroll and makes the page inert; `non-modal` sits beside
	 * the app (inspectors, filter rails); `trap-focus` is in between. A non-modal panel is
	 * not announced as a dialog, so never use it for a question that must be answered.
	 */
	modality?: "modal" | "trap-focus" | "non-modal"
	trigger?: ReactNode
}

export interface ConfirmDialogProps extends OverlayBaseProps, OverlayActionProps {
	tone?: OverlayTone
	showIcon?: boolean
	alertMessage?: ReactNode
	trigger?: ReactNode
	/** Shorthand for the destructive presentation: tone, icon and confirm colour. */
	destructive?: boolean
}
