/**
 * Heading — a titled region's heading, with an optional supporting line. `level` picks the
 * element (document outline), `size` the appearance; `size` defaults from `level`.
 */
import * as React from "react"

import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"

import { Text } from "../text"
import styles from "./heading.module.css"

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingSize = "2xl" | "xl" | "lg" | "base" | "sm"

const headingVariants = cvm(styles.root, {
	variants: {
		size: {
			"2xl": styles.size2Xl,
			xl: styles.sizeXl,
			lg: styles.sizeLg,
			base: styles.sizeBase,
			sm: styles.sizeSm,
		},
	},
	defaultVariants: { size: "lg" },
})

/** Visual size defaults to the one conventionally paired with the semantic level. */
const SIZE_FOR_LEVEL: Record<HeadingLevel, HeadingSize> = {
	1: "2xl",
	2: "xl",
	3: "lg",
	4: "base",
	5: "sm",
	6: "sm",
}

export interface HeadingProps extends Omit<React.ComponentProps<"h2">, "children"> {
	level?: HeadingLevel
	size?: HeadingSize
	/** Supporting line under the heading. Inherits the provider text size. */
	subHeading?: React.ReactNode
	/**
	 * Ellipsises the heading at one line. Sets `min-width: 0`; every intermediate flex box
	 * needs it too, as with `Text`.
	 */
	truncate?: boolean
	children?: React.ReactNode
}

export function Heading({
	level = 2,
	size,
	subHeading,
	truncate = false,
	className,
	children,
	...props
}: HeadingProps) {
	const Tag = `h${level}` as const
	const heading = (
		<Tag
			data-typography="heading"
			className={cx(
				headingVariants({ size: size ?? SIZE_FOR_LEVEL[level] }),
				truncate && styles.truncate,
				className,
			)}
			{...props}
		>
			{children}
		</Tag>
	)

	if (!subHeading) return heading

	return (
		<div className={cx("heading--component", styles.group)}>
			{heading}
			<Text tag="p" type="secondary" className={styles.sub}>
				{subHeading}
			</Text>
		</div>
	)
}
