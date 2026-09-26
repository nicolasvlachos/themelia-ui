/**
 * Split — a fixed column beside a fluid one (a sidebar beside content, a form beside a
 * preview). Collapses by breakpoint, not container width, so it stays a plain grid with no
 * containment context. Children are placed by CSS; `side` never changes DOM order.
 */
import * as React from "react"

import { cx } from "@/lib/cx"
import { mergeVars, responsiveVars } from "@/lib/responsive"

import { GAP, width } from "./structure.maps"
import styles from "./structure.module.css"
import type { ResponsiveValue, SplitSide, StructureGap, StructureWidth } from "./structure.types"

export interface SplitProps extends React.ComponentProps<"div"> {
	/**
	 * Which visual column is the fixed one. The DOM order never changes with it: the first
	 * child is the main content and the second the side on both settings, so a reader
	 * tabbing through reaches the content first either way.
	 */
	side?: SplitSide
	/**
	 * The fixed column's width — a step or any CSS length. A maximum rather than an exact
	 * size, so a narrow viewport shrinks the rail instead of squeezing the content beside it
	 * to nothing.
	 * @default "18rem"
	 */
	sideWidth?: ResponsiveValue<StructureWidth | (string & {})>
	/**
	 * Space between the two columns.
	 * @default "md"
	 */
	gap?: ResponsiveValue<StructureGap>
	/**
	 * Below this breakpoint the two columns become one. `never` keeps them side by side at
	 * every width.
	 */
	collapseBelow?: "sm" | "md" | "lg" | "xl" | "never"
}

export const Split = React.forwardRef<HTMLDivElement, SplitProps>(function Split(
	{ side = "end", sideWidth, gap, collapseBelow = "md", className, style, ...props },
	ref,
) {
	return (
		<div
			ref={ref}
			data-slot="split"
			data-side={side}
			data-collapse={collapseBelow}
			className={cx("split--component", styles.split, className)}
			style={mergeVars(
				responsiveVars("split-width", sideWidth, width),
				responsiveVars("split-gap", gap, (v) => GAP[v]),
				style ?? {},
			)}
			{...props}
		/>
	)
})
