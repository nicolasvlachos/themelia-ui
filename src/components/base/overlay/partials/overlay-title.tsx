import * as React from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { useOptionalOverlayContext } from "../overlay-context"

import styles from "../overlay.module.css"

/** The overlay's heading. A bare string is wrapped in `Text`; other nodes pass through. */
export const OverlayTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<"h2">>(
	function OverlayTitle({ children, className, id, ...props }, ref) {
		const overlay = useOptionalOverlayContext()
		const generatedId = React.useId()
		const resolvedId = id ?? generatedId
		const register = overlay?.setTitleId
		/* Registers while mounted, so the dialog points at this element only when it exists. */
		React.useEffect(() => {
			if (!register) return
			register(resolvedId)
			return () => register(undefined)
		}, [register, resolvedId])
		const simple = typeof children === "string" || typeof children === "number"
		return (
			<h2
				ref={ref}
				id={resolvedId}
				data-slot="overlay-title"
				className={cx("overlay--title", styles.title, className)}
				{...props}
			>
				{simple ? (
					<Text tag="span" size="inherit" weight="semibold">
						{children}
					</Text>
				) : (
					children
				)}
			</h2>
		)
	},
)
