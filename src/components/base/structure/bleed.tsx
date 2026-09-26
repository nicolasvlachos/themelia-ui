/**
 * Bleed — lets a child escape the padding it sits in (a full-width image in a padded card).
 * The amount is a spacing step, not a length, so it tracks the padding through density.
 */
import * as React from "react"

import { cx } from "@/lib/cx"
import { mergeVars, responsiveVars } from "@/lib/responsive"

import { GAP } from "./structure.maps"
import styles from "./structure.module.css"
import type { BleedAxis, ResponsiveValue, StructureGap } from "./structure.types"

export interface BleedProps extends React.ComponentProps<"div"> {
	/** How far to escape, on the spacing scale; match the padding being cancelled. */
	amount?: ResponsiveValue<StructureGap>
	/** Which way (`both` covers every direction). Defaults to `inline`. */
	axis?: BleedAxis
}

export const Bleed = React.forwardRef<HTMLDivElement, BleedProps>(function Bleed(
	{ amount, axis = "inline", className, style, ...props },
	ref,
) {
	return (
		<div
			ref={ref}
			data-slot="bleed"
			data-axis={axis}
			className={cx("bleed--component", styles.bleed, className)}
			style={mergeVars(
				responsiveVars("bleed-amount", amount, (v) => GAP[v]),
				style ?? {},
			)}
			{...props}
		/>
	)
})
