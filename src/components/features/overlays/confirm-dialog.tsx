/**
 * ConfirmDialog: a question and two answers, over `base/alert-dialog` (no outside-click or
 * Escape dismissal: the decision must be answered). Sized for a sentence; use
 * `ActionDialog` for real content. Shares its frame with ActionDialog and ActionSheet.
 */
import { AlertDialogContent } from "@/components/base/alert-dialog"

import { ActionOverlayFrame, type ActionOverlayParts } from "./action-overlay-frame"
import { defaultConfirmStrings } from "./overlays.strings"
import type { ConfirmDialogProps } from "./overlays.types"

const PARTS = {
	Content: AlertDialogContent as ActionOverlayParts["Content"],
} satisfies ActionOverlayParts

export function ConfirmDialog({ tone: toneProp, confirmTone, destructive = false, ...props }: ConfirmDialogProps) {
	/* `destructive` sets tone, glyph and confirm colour together. */
	const tone = toneProp ?? (destructive ? "destructive" : "neutral")

	return (
		<ActionOverlayFrame
			{...props}
			parts={PARTS}
			hook="confirm-dialog"
			tone={tone}
			confirmTone={confirmTone ?? (destructive ? "destructive" : "primary")}
			// The tone always drives the button: a confirmation has one decision.
			emphasis
			showIconByDefault
			defaultStrings={defaultConfirmStrings}
			// Neither route dismisses an alert dialog, and it has no close button to show.
			dismissible={false}
			// It always answers: the footer stays even if a caller hides both buttons.
			showFooter
		/>
	)
}
