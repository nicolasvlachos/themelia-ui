import * as React from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { useOptionalOverlayContext } from "../overlay-context"

import styles from "../overlay.module.css"

/** Supporting line under the title. Wraps bare strings the way OverlayTitle does. */
export const OverlayDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<"p">>(
	function OverlayDescription({ children, className, id, ...props }, ref) {
		const overlay = useOptionalOverlayContext()
		const generatedId = React.useId()
		const resolvedId = id ?? generatedId
		const register = overlay?.setDescriptionId
		/* Registers while mounted, so the dialog points at this element only when it exists. */
		React.useEffect(() => {
			if (!register) return
			register(resolvedId)
			return () => register(undefined)
		}, [register, resolvedId])
		const simple = typeof children === "string" || typeof children === "number"
		return (
			<p
				ref={ref}
				id={resolvedId}
				data-slot="overlay-description"
				className={cx("overlay--description", styles.description, className)}
				{...props}
			>
				{simple ? (
					<Text tag="span" size="inherit" type="secondary">
						{children}
					</Text>
				) : (
					children
				)}
			</p>
		)
	},
)
