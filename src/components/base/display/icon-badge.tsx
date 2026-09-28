/**
 * IconBadge — a glyph in a tinted medallion. `tone` sets the fill and glyph together, so
 * they can't come from different tones.
 */
import type { ComponentProps, ComponentType, ReactNode } from "react"
import { isValidElement } from "react"

import type { SemanticTone } from "@/lib/component-vocabulary"
import { cx } from "@/lib/cx"

import styles from "./display.module.css"

/** A medallion's tones: the kit's tone union, without secondary. */
export type IconBadgeTone = Extract<SemanticTone, "neutral" | "primary" | "success" | "warning" | "destructive" | "info">
export type IconBadgeShape = "rounded" | "circle"

export interface IconBadgeProps extends Omit<ComponentProps<"span">, "children"> {
	/**
	 * A component or a rendered node. A component is called with `aria-hidden`, because the
	 * badge is a mark beside a name that already says it.
	 */
	icon?: ComponentType<{ className?: string }> | ReactNode
	children?: ReactNode
	/** Sets the fill and the glyph together, so the two cannot come from different tones. */
	tone?: IconBadgeTone
	/** A rounded square, or a circle. */
	shape?: IconBadgeShape
	/** Fills with the tone and inverts the glyph — for the one badge that must stand out. */
	solid?: boolean
	/** A hairline outline, for a badge on a surface it would otherwise blend into. */
	bordered?: boolean
}

/**
 * A glyph in a tinted medallion. Its size comes from `--_icon-badge-size`, so a caller
 * needing a smaller mark re-points the variable instead of redrawing the badge.
 */
export function IconBadge({
	icon,
	children,
	tone = "neutral",
	shape = "rounded",
	solid = false,
	bordered = false,
	className,
	...props
}: IconBadgeProps) {
	const content = (() => {
		if (children) return children
		if (!icon) return null
		if (isValidElement(icon)) return icon
		const Icon = icon as ComponentType<{ "aria-hidden"?: boolean }>
		return <Icon aria-hidden />
	})()

	return (
		<span
			data-tone={tone}
			className={cx(
				"icon-badge--component",
				styles.iconBadge,
				shape === "circle" && styles.iconBadgeCircle,
				solid && styles.iconBadgeSolid,
				bordered && styles.iconBadgeBordered,
				className,
			)}
			{...props}
		>
			{content}
		</span>
	)
}
