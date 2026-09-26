/**
 * ActionDialog — a `base/dialog` with a generated footer: cancel and confirm in a fixed
 * order, async- and form-aware confirm, and a tone for the glyph and confirm colour. Use
 * the primitive when the body owns its actions. Shares ActionOverlayFrame; only the
 * centred surface and its width are its own.
 */
import type { CSSProperties } from "react"

import { DialogContent } from "@/components/base/dialog"

import { ActionOverlayFrame, type ActionOverlayParts } from "./action-overlay-frame"
import type { ActionDialogProps } from "./overlays.types"

/** Named widths; any other string passes through as a CSS length. */
const WIDTH: Record<string, string> = {
	sm: "24rem",
	md: "32rem",
	lg: "42rem",
	xl: "56rem",
	/* The dialog's own cap keeps the kit's edge inset on either side. */
	full: "100vw",
}

const PARTS = {
	Content: DialogContent as ActionOverlayParts["Content"],
} satisfies ActionOverlayParts

export function ActionDialog({ width = "md", surfaceStyle, ...props }: ActionDialogProps) {
	return (
		<ActionOverlayFrame
			{...props}
			parts={PARTS}
			hook="action-dialog"
			surfaceStyle={{ "--overlay-max-width": WIDTH[width] ?? width, ...surfaceStyle } as CSSProperties}
		/>
	)
}
