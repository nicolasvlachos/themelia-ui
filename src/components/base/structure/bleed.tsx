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
	/**
	 * How far to escape: one of the two gaps, which equal the two paddings. Match it to the
	 * padding being cancelled — a surface padded by `--padding-sm` bleeds `sm` — so the two
	 * move together under a density change.
	 * @default "none"
	 */
	amount?: ResponsiveValue<StructureGap>
	/**
	 * Which way to escape; `both` covers every direction. Sideways is the common case: an
	 * image bleeds across and keeps its vertical rhythm.
	 */
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
				responsiveVars("_bleed-amount", amount, (v) => GAP[v]),
				style ?? {},
			)}
			{...props}
		/>
	)
})
