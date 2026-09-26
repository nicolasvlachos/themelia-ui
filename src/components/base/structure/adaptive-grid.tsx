/**
 * AdaptiveGrid — columns follow the available width: `auto-fit` adds a track whenever
 * another fits at the minimum width, with no breakpoints.
 */
import * as React from "react"

import { cx } from "@/lib/cx"
import { mergeVars, responsiveVars } from "@/lib/responsive"

import { ADAPTIVE_MIN, ALIGN, GAP } from "./structure.maps"
import styles from "./structure.module.css"
import type { AdaptiveGridMinimum, ResponsiveValue, StructureAlign, StructureGap } from "./structure.types"

export interface AdaptiveGridProps extends React.ComponentProps<"div"> {
	/** Minimum column width before another track is added. */
	minColumnWidth?: AdaptiveGridMinimum
	gap?: ResponsiveValue<StructureGap>
	align?: ResponsiveValue<StructureAlign>
}

export const AdaptiveGrid = React.forwardRef<HTMLDivElement, AdaptiveGridProps>(
	function AdaptiveGrid({ minColumnWidth = "md", gap, align, className, style, ...props }, ref) {
		return (
			<div
				ref={ref}
				data-slot="adaptive-grid"
				className={cx("adaptive-grid--component", styles.adaptive, className)}
				style={mergeVars(
					{ "--adaptive-min": ADAPTIVE_MIN[minColumnWidth] } as React.CSSProperties,
					responsiveVars("grid-gap", gap, (v) => GAP[v]),
					responsiveVars("grid-align", align, (v) => ALIGN[v]),
					style ?? {},
				)}
				{...props}
			/>
		)
	},
)
