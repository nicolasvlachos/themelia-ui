/**
 * Dialog — a centred modal: `base/overlay` with `placement="center"` and default modality
 * and dismissal. The other parts are Overlay's own, imported from `base/overlay`.
 */
import * as React from "react"

import { OverlayContent, type OverlayContentProps } from "@/components/base/overlay"
import { cx } from "@/lib/cx"

export type DialogContentProps = Omit<OverlayContentProps, "placement"> &
	Omit<React.ComponentProps<"dialog">, "children" | "className" | "title">

export function DialogContent({ className, ...props }: DialogContentProps) {
	return (
		<OverlayContent
			placement="center"
			className={cx("dialog--component", className)}
			{...props}
		/>
	)
}
