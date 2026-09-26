/**
 * Grid — two-dimensional composition with an explicit column count. Use `AdaptiveGrid`
 * when the count should follow the available width.
 */
import * as React from "react"

import { cx } from "@/lib/cx"
import { mergeVars, responsiveVars } from "@/lib/responsive"

import { ALIGN, GAP, width } from "./structure.maps"
import styles from "./structure.module.css"
import type {
	GridColumns, GridSpan, ResponsiveValue, StructureAlign, StructureGap, StructureWidth,
} from "./structure.types"

export interface GridProps extends React.ComponentProps<"div"> {
	/** Defaults to one column, then two from the md breakpoint. */
	columns?: ResponsiveValue<GridColumns>
	gap?: ResponsiveValue<StructureGap>
	rowGap?: ResponsiveValue<StructureGap>
	columnGap?: ResponsiveValue<StructureGap>
	align?: ResponsiveValue<StructureAlign>
	/** Caps the grid's width — a content step, or any CSS length. Same scale as `Stack`. */
	maxWidth?: ResponsiveValue<StructureWidth | (string & {})>
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(function Grid(
	{ columns, gap, rowGap, columnGap, align, maxWidth, className, style, ...props },
	ref,
) {
	return (
		<div
			ref={ref}
			data-slot="grid"
			className={cx("grid--component", styles.grid, className)}
			style={mergeVars(
				responsiveVars("grid-columns", columns),
				responsiveVars("grid-gap", gap, (v) => GAP[v]),
				responsiveVars("grid-row-gap", rowGap, (v) => GAP[v]),
				responsiveVars("grid-column-gap", columnGap, (v) => GAP[v]),
				responsiveVars("grid-align", align, (v) => ALIGN[v]),
				responsiveVars("grid-max-width", maxWidth, width),
				style ?? {},
			)}
			{...props}
		/>
	)
})

export interface GridCellProps extends React.ComponentProps<"div"> {
	/** Columns occupied. `full` spans whatever the grid currently has. */
	span?: ResponsiveValue<GridSpan>
}

export const GridCell = React.forwardRef<HTMLDivElement, GridCellProps>(function GridCell(
	{ span, className, style, ...props },
	ref,
) {
	const isFull = span === "full"
	return (
		<div
			ref={ref}
			data-slot="grid-cell"
			className={cx("grid-cell--component", styles.cell, className)}
			style={mergeVars(
				// `full` cannot be a span count, because the track count is only known to CSS.
				isFull ? { gridColumn: "1 / -1" } : responsiveVars("cell-span", span as ResponsiveValue<number>),
				style ?? {},
			)}
			{...props}
		/>
	)
})
