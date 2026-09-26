import * as React from "react"

import { Stack } from "@/components/base/structure"
import { cx } from "@/lib/cx"

import styles from "../overlay.module.css"

/** Fixed footer region: trailing actions on a tinted surface. */
export const OverlayFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
	function OverlayFooter({ className, ...props }, ref) {
		return (
			<Stack
				direction="horizontal"
				align="center"
				wrap
				gap="md"
				justify="end"
				ref={ref}
				data-slot="overlay-footer"
				className={cx("overlay--footer", styles.footer, className)}
				{...props}
			/>
		)
	},
)
