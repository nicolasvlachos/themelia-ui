import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "../overlay.module.css"

/**
 * The region between the fixed header and footer, and the one that scrolls, so a long
 * surface never scrolls its own title or its buttons away.
 */
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
