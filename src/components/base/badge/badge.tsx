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
	/**
	 * The element this becomes — an anchor, a router link, a label (docs/adr/0005).
	 * `children` stays the content.
	 */
	render?: React.ReactElement
	/** A leading status dot in the badge's own tone. */
	dot?: boolean
	/** Draws the dot hollow, for a state that hasn't happened yet ("queued", not "failed"). */
	pending?: boolean
	/** Animates the dot, for a state that is actively changing. */
	pulse?: boolean
}

function Badge({
	className,
	tone,
	variant,
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
			data-tone={tone ?? "neutral"}
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
