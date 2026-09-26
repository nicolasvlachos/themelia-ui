/**
 * ContentBlock — a titled region inside a panel, not a panel itself; use it instead of
 * nesting Cards.
 */
import type { ComponentProps, ReactNode } from "react"

import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { cx } from "@/lib/cx"

import styles from "./display.module.css"

/**
 * `plain`: a heading and its content, no chrome. `bordered`: a ruled region the page shows
 * through. `muted`: a tinted region. `card`: `bordered` on the card ground.
 */
export type ContentBlockSurface = "plain" | "bordered" | "muted" | "card"

export interface ContentBlockProps extends Omit<ComponentProps<"div">, "title"> {
	title?: ReactNode
	description?: ReactNode
	/** Glyph on the title line. */
	icon?: ReactNode
	/** Content immediately after the title — a badge, a count. */
	titleSuffix?: ReactNode
	/** Controls at the end of the title line. */
	headerEnd?: ReactNode
	surface?: ContentBlockSurface
	/**
	 * Drops the surface's inset and clips to its radius, for content that runs to the edge
	 * (divided cells, ruled rows); children pay their own inset. Only meaningful on a surface.
	 */
	flush?: boolean
	children?: ReactNode
}

export function ContentBlock({
	title,
	description,
	icon,
	titleSuffix,
	headerEnd,
	surface = "plain",
	flush = false,
	className,
	children,
	...props
}: ContentBlockProps) {
	const hasTitleRow = !!(title || titleSuffix || icon || headerEnd)
	const hasHeader = hasTitleRow || description != null

	return (
		<div
			className={cx(
				"content-block--component",
				styles.contentBlock,
				surface === "bordered" && styles.contentBlockBordered,
				surface === "muted" && styles.contentBlockMuted,
				surface === "card" && styles.contentBlockCard,
				flush && styles.contentBlockFlush,
				className,
			)}
			{...props}
		>
			{hasHeader && (
				<Stack gap="xs" className="content-block--heading">
					{hasTitleRow && (
						<div className={styles.contentBlockHeader}>
							{icon != null && <span className={styles.contentBlockIcon}>{icon}</span>}
							<Text tag="span" size="inherit" weight="semibold"
								className={styles.contentBlockTitle}
								data-suffixed={titleSuffix != null || undefined}
							>
								{title}
								{titleSuffix}
							</Text>
							{headerEnd}
						</div>
					)}
					{description != null && (
						<Text tag="div" type="secondary" className={styles.contentBlockDescription}>{description}</Text>
					)}
				</Stack>
			)}
			{children}
		</div>
	)
}
