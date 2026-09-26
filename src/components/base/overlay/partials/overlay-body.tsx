import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "../overlay.module.css"

/** Scroll-owning region between the fixed header and footer. */
export const OverlayBody = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
	function OverlayBody({ className, ...props }, ref) {
		return (
			<div
				ref={ref}
				data-slot="overlay-body"
				className={cx("overlay--body", styles.body, className)}
				{...props}
			/>
		)
	},
)
