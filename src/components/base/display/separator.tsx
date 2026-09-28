"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import * as React from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./display.module.css"

/** How the rule is drawn — structural, so a `variant`. Dashed and dotted read as provisional. */
export type SeparatorVariant = "solid" | "dashed" | "dotted"

export interface SeparatorProps
	extends SeparatorPrimitive.Props,
		Pick<SeparatorPrimitive.Props, "aria-hidden"> {
	/**
	 * How the rule is drawn. Structural, not semantic — a dashed rule is the same divider,
	 * drawn as provisional.
	 */
	variant?: SeparatorVariant
	/**
	 * The rule's thickness: a CSS length, or a number in pixels. Overrides the hairline for
	 * this rule, e.g. a seam between panels.
	 */
	thickness?: string | number
	/**
	 * Text set into a gap in the rule — "OR", "More options". Horizontal only. It drops the
	 * separator role, because the rule is then decoration around real text.
	 */
	label?: React.ReactNode
}

const length = (value: string | number | undefined) =>
	typeof value === "number" ? `${value}px` : value

/**
 * A rule between content, horizontal or vertical; a vertical separator needs a height from
 * its container. An unlabelled separator exposes separator semantics: set `aria-hidden` to
 * hide a decorative rule from assistive technology.
 */
export function Separator({
	className,
	orientation = "horizontal",
	variant = "solid",
	thickness,
	label,
	style,
	...props
}: SeparatorProps) {
	const sized = {
		...(thickness === undefined ? null : { "--_separator-thickness": length(thickness) }),
		...style,
	} as React.CSSProperties

	/* A labelled rule is decoration around real text, so it drops the separator role. */
	if (label && orientation === "horizontal") {
		return (
			<div
				data-slot="separator"
				data-orientation="horizontal"
				data-variant={variant}
				className={cx("separator--component", styles.separatorLabelled, className)}
				style={sized}
			>
				<Text tag="span" type="secondary" size="xs">
					{label}
				</Text>
			</div>
		)
	}

	return (
		<SeparatorPrimitive
			data-slot="separator"
			orientation={orientation}
			data-variant={variant}
			className={cx("separator--component", styles.separator, className)}
			style={sized}
			{...props}
		/>
	)
}
