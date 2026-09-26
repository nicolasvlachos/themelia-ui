/**
 * Dialog — a centred modal: `base/overlay` with `placement="center"` and default modality
 * and dismissal. The other parts are Overlay's own, imported from `base/overlay`.
 */
import * as React from "react"

import { OverlayContent, type OverlayContentProps } from "@/components/base/overlay"
import { cx } from "@/lib/cx"

export type DialogContentProps = Omit<OverlayContentProps, "placement"> &
	Omit<React.ComponentProps<"dialog">, "children" | "className" | "title">

/**
 * OverlayContent with `placement` fixed to centre, and that is the whole of the dialog.
 * `modality`, `surface`, `dismissal`, `initialFocusRef` and `showCloseButton` are
 * OverlayContent's props, with the same defaults.
 *
 * The rest of a dialog is Overlay's own parts, imported from `base/overlay` under their own
 * names. There is no second name for them, so nothing about them can drift.
 */
export function DialogContent({ className, ...props }: DialogContentProps) {
	return (
		<OverlayContent
			placement="center"
			className={cx("dialog--component", className)}
			{...props}
		/>
	)
}
