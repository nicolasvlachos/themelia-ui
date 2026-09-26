import * as React from "react"

import { Stack } from "@/components/base/structure"
import { cx } from "@/lib/cx"

import styles from "../overlay.module.css"

/** Fixed header region: its own inset, a full-bleed divider, clearance for the close control. */
export const OverlayHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
	function OverlayHeader({ className, ...props }, ref) {
		return (
			<Stack
				gap="xs"
				ref={ref}
				data-slot="overlay-header"
				className={cx("overlay--header", styles.header, className)}
				{...props}
			/>
		)
	},
)
