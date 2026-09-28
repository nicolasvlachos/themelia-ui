/**
 * Stack — one-dimensional composition with token-spaced defaults. Every prop takes a value
 * or a per-breakpoint object, e.g. `direction={{ base: "vertical", md: "horizontal" }}`.
 */
import * as React from "react"

import { cx } from "@/lib/cx"
import { mergeVars, responsiveVars } from "@/lib/responsive"

import { ALIGN, DIRECTION, GAP, JUSTIFY, width } from "./structure.maps"
import styles from "./structure.module.css"
import type {
	CssLength, ResponsiveValue, StructureAlign, StructureDirection, StructureGap, StructureJustify, StructureWidth,
} from "./structure.types"

export interface StackProps extends Omit<React.ComponentProps<"div">, "dir"> {
	/**
	 * Main axis.
	 * @default "vertical"
	 */
	direction?: ResponsiveValue<StructureDirection>
	/**
	 * Space between children: `default` between groups, `sm` inside one.
	 * @default "default"
	 */
	gap?: ResponsiveValue<StructureGap>
	/**
	 * Cross-axis alignment.
	 * @default "stretch"
	 */
	align?: ResponsiveValue<StructureAlign>
	/**
	 * Main-axis distribution.
	 * @default "start"
	 */
	justify?: ResponsiveValue<StructureJustify>
	/**
	 * Allows children to flow onto more than one line.
	 * @default false
	 */
	wrap?: ResponsiveValue<boolean>
	/**
	 * Caps the box's width — a content width (`default`, `sm`, `full`, `none`) or any CSS
	 * length, such as a form's `26rem`. A field measure is a control decision rather than a
	 * content one, which is why a raw length is allowed beside the scale.
	 */
	maxWidth?: ResponsiveValue<StructureWidth | CssLength>
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
	{ direction, gap, align, justify, wrap, maxWidth, className, style, ...props },
	ref,
) {
	return (
		<div
			ref={ref}
			data-slot="stack"
			className={cx("stack--component", styles.stack, className)}
			style={mergeVars(
				responsiveVars("_stack-direction", direction, (v) => DIRECTION[v]),
				responsiveVars("_stack-gap", gap, (v) => GAP[v]),
				responsiveVars("_stack-align", align, (v) => ALIGN[v]),
				responsiveVars("_stack-justify", justify, (v) => JUSTIFY[v]),
				responsiveVars("_stack-wrap", wrap, (v) => (v ? "wrap" : "nowrap")),
				responsiveVars("_stack-max-width", maxWidth, width),
				style ?? {},
			)}
			{...props}
		/>
	)
})
