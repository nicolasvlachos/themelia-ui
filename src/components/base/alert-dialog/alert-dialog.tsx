/**
 * AlertDialog — a centred modal that demands an answer: only an explicit choice dismisses
 * it, and it announces as `alertdialog`. Root, trigger, header, body, footer, title and
 * description are Overlay's parts (`base/overlay`); this adds the content, the named
 * answers (`Action`, `Cancel`) and a media slot.
 */
import * as React from "react"

import {
	OverlayClose,
	OverlayContent,
	type OverlayContentProps,
} from "@/components/base/overlay"
import { cx } from "@/lib/cx"

export function AlertDialogContent({
	className,
	...props
}: Omit<OverlayContentProps, "placement" | "dismissal">) {
	return (
		<OverlayContent
			placement="center"
			role="alertdialog"
			// Neither backdrop nor Escape dismisses: the user must answer.
			dismissal={{ backdrop: false, escape: false }}
			showCloseButton={false}
			className={cx("alert-dialog--component", className)}
			{...props}
		/>
	)
}

/** Media slot above the title — an illustration or icon carrying the alert's weight. */
export function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="alert-dialog-media" className={cx("alert-dialog--media", className)} {...props} />
}

type AnswerProps = React.ComponentProps<"button"> & {
	/** The element this answer becomes — a form submit, a router link. */
	render?: React.ReactElement
}

/** The affirmative answer. Closes on click unless the handler prevents it. */
export function AlertDialogAction({ className, ...props }: AnswerProps) {
	return <OverlayClose className={cx("alert-dialog--action", className)} {...props} />
}

export function AlertDialogCancel({ className, ...props }: AnswerProps) {
	return <OverlayClose className={cx("alert-dialog--cancel", className)} {...props} />
}
