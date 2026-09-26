/**
 * AspectRatio — a box that keeps its proportion and makes its media child fill it. The
 * ratio is responsive, and a raw number rather than a token: it is the framed content's
 * shape, not a theme decision.
 */
import type { ComponentProps } from "react"

import { cx } from "@/lib/cx"
import { mergeVars, responsiveVars, type ResponsiveValue } from "@/lib/responsive"

import styles from "./aspect-ratio.module.css"

export interface AspectRatioProps extends ComponentProps<"div"> {
	/** Width divided by height — `16 / 9`, `1`, `4 / 3` — as a number, never parsed. */
	ratio?: ResponsiveValue<number>
	/**
	 * How a media child fills the box: `cover` crops to fill (the usual frame); `contain` fits
	 * inside, for artwork whose edges matter (a logo, a diagram, a screenshot).
	 */
	fit?: "cover" | "contain"
}

export function AspectRatio({ ratio = 1, fit = "cover", className, style, ...props }: AspectRatioProps) {
	return (
		<div
			data-slot="aspect-ratio"
			data-fit={fit}
			className={cx("aspect-ratio--component", styles.root, className)}
			style={mergeVars(responsiveVars("aspect-ratio", ratio), style ?? {})}
			{...props}
		/>
	)
}
