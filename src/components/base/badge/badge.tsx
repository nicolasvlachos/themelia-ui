/**
 * Badge — a short status mark. Takes `tone` (semantic colour) like the rest of the kit.
 * The status dot is built in, so status isn't carried by colour alone.
 */
import * as React from "react"

import { Slot } from "@/components/base/slot"
import { type VariantProps } from "@/lib/cvm"
import { cx } from "@/lib/cx"

import { badgeVariants } from "./badge.variants"
import styles from "./badge.module.css"

export type BadgeTone =
	| "neutral"
	| "primary"
	| "secondary"
	| "success"
	| "info"
	| "warning"
	| "destructive"

/** Structural presentation. The tone supplies the hue; this decides how it is applied. */
export type BadgeVariant = "soft" | "solid" | "outline"


export interface BadgeProps
	extends React.ComponentProps<"span">,
		VariantProps<typeof badgeVariants> {
	/** Semantic colour: what the badge means. `variant` decides how much of it is applied. */
	tone?: BadgeTone
	/** How much of the tone is applied. Structural, not semantic. */
	variant?: BadgeVariant
	/** A leading status dot in the badge's own tone. */
	dot?: boolean
	/** Draws the dot hollow, for a state that has not happened yet: "queued", not "failed". */
	pending?: boolean
	/** Animates the dot, for a state that is actively changing. */
	pulse?: boolean
	/**
	 * The element the badge becomes — an anchor or a router link, for a badge that links.
	 * The dot and `children` go inside it.
	 */
	render?: React.ReactElement
}

function Badge({
	className,
	tone = "neutral",
	variant = "soft",
	render,
	dot = false,
	pending = false,
	pulse = false,
	children,
	...props
}: BadgeProps) {
	const Comp = render !== undefined ? Slot : "span"

	const content = (
		<>
			{!!dot && (
				<span
					aria-hidden
					className={cx(styles.dot, pending && styles.dotPending, pulse && styles.dotPulse)}
				/>
			)}
			{children}
		</>
	)

	/* `render` receives the dot and label as its children, so a linked badge keeps its dot. */
	return (
		<Comp
			data-slot="badge"
			data-tone={tone}
			className={cx("badge--component", badgeVariants({ tone, variant, className }))}
			{...props}
		>
			{render
				? children === undefined || children === null
					? render
					: React.cloneElement(render, undefined, content)
				: content}
		</Comp>
	)
}

export { Badge }
