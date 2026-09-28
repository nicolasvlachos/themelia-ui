import * as React from "react"

import { Stack } from "@/components/base/structure"
import { cx } from "@/lib/cx"

import styles from "../overlay.module.css"

/**
 * The fixed header region: its own inset, a full-bleed divider, clearance for the close
 * control. It holds its edge while the body scrolls, so a long surface never scrolls its own
 * title away.
 */
export const OverlayHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
	function OverlayHeader({ className, ...props }, ref) {
		return (
			<Stack
				gap="sm"
				ref={ref}
				data-slot="overlay-header"
				className={cx("overlay--header", styles.header, className)}
				{...props}
			/>
		)
	},
)
