/** CardSkeleton — a placeholder in the real card's chrome, so the page doesn't reflow when content lands. */
import type { ComponentProps } from "react"

import { ContentSkeleton } from "@/components/base/skeleton"
import { cx } from "@/lib/cx"

import { Card } from "./card"
import type { CardSurface } from "./card.types"

export interface CardSkeletonProps extends Omit<ComponentProps<"div">, "title"> {
	/**
	 * Match the real card's surface. Unset, it takes the card's default (the provider's
	 * `defaults.card.surface`, framed out of the box).
	 */
	surface?: CardSurface
	/** Reserves the header's height. */
	showHeader?: boolean
	lines?: number
	label?: string
}

export function CardSkeleton({
	surface,
	showHeader = true,
	lines = 3,
	/* No default: ContentSkeleton owns it. */
	label,
	className,
	...props
}: CardSkeletonProps) {
	return (
		<Card surface={surface} className={cx("card-skeleton--component", className)} {...props}>
			<ContentSkeleton lines={lines} showTitle={showHeader} label={label} />
		</Card>
	)
}
