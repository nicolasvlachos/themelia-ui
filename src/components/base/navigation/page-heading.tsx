/**
 * PageHeading — the heading block a page, section or record opens with, in a fixed order.
 * The layout `PageHeader` builds on it (back control, title icon, routing).
 *
 * Slot map, top to bottom and outside in:
 *
 *   breadcrumbs
 *   leading │ eyebrow
 *           │ beforeTitle
 *           │ titlePrefix │ title  badges  titleSuffix  …  actions
 *           │             │ description
 *           │             │ afterDescription
 *   children
 *   ───────────────────────────────────────────────────  (withSeparator)
 */
import type { ComponentProps, Key, ReactNode } from "react"

import { Badge, type BadgeTone } from "@/components/base/badge"
import { Separator } from "@/components/base/display"
import { DisplayLabel, Heading, Text, type HeadingLevel } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./navigation.module.css"

export interface PageHeadingBadge {
	label: ReactNode
	tone?: BadgeTone
	key?: Key
}

export interface PageHeadingProps extends Omit<ComponentProps<"header">, "title"> {
	/** Small label above the title. Plain text is rendered as a DisplayLabel. */
	eyebrow?: ReactNode
	/** The title. Plain text becomes a Heading; pass an element to own the markup. */
	title: ReactNode
	/** One sentence under the title, capped at a reading measure. */
	description?: ReactNode
	/** Heading level for a plain-text title; set it so the document outline is right. */
	level?: HeadingLevel
	/** Convenience for a single badge. Ignored when `badges` is set. */
	badge?: PageHeadingBadge
	/** Badges beside the title, in order. Data, so their tone comes from the kit. */
	badges?: PageHeadingBadge[]
	/** Trail above the block. */
	breadcrumbs?: ReactNode
	/** Left of the whole column — an avatar, a back control. Top-aligned. */
	leading?: ReactNode
	/** Between the eyebrow and the title row — a banner or status strip. */
	beforeTitle?: ReactNode
	/**
	 * Immediately left of the title, aligned to the title line alone. Unlike `leading`, the
	 * description still aligns with the title, not with this slot.
	 */
	titlePrefix?: ReactNode
	/** After the title and its badges, on the same line. */
	titleSuffix?: ReactNode
	/** Directly beneath the description, sharing its alignment — a metadata line. */
	afterDescription?: ReactNode
	/** Controls at the far end of the title row; drops below the title when narrow. */
	actions?: ReactNode
	/** Below the whole block, above the separator. */
	children?: ReactNode
	/** Draws the rule beneath the header. */
	withSeparator?: boolean
	contentClassName?: string
	titleRowClassName?: string
	actionsClassName?: string
}

const isSimpleText = (value: ReactNode): value is string | number =>
	typeof value === "string" || typeof value === "number"

export function PageHeading({
	eyebrow,
	title,
	description,
	level = 1,
	badge,
	badges,
	breadcrumbs,
	leading,
	beforeTitle,
	titlePrefix,
	titleSuffix,
	afterDescription,
	actions,
	children,
	withSeparator = false,
	className,
	contentClassName,
	titleRowClassName,
	actionsClassName,
	...props
}: PageHeadingProps) {
	const resolvedBadges = badges ?? (badge ? [badge] : [])

	return (
		<header
			data-slot="page-heading"
			className={cx("page-heading--component", styles.pageHeading, className)}
			{...props}
		>
			{!!breadcrumbs && <div className={styles.pageHeadingCrumbs}>{breadcrumbs}</div>}

			<div className={styles.pageHeadingRow}>
				{leading != null && <div className={styles.pageHeadingLeading}>{leading}</div>}

				<div className={cx(styles.pageHeadingMain, contentClassName)}>
					{eyebrow != null &&
						(isSimpleText(eyebrow) ? (
							<DisplayLabel className="page-heading--eyebrow">
								{eyebrow}
							</DisplayLabel>
						) : (
							eyebrow
						))}

					{beforeTitle}

					{/*
					  * A grid, so the prefix aligns to the title row alone and the description
					  * starts at the title's edge. Actions sit inside the first row, so a wide
					  * description never pushes them below it.
					  */}
					<div
						data-has-prefix={titlePrefix ? "" : undefined}
						className={cx(styles.pageHeadingGrid, titleRowClassName)}
					>
						{!!titlePrefix && (
							/* Shares the headline's first baseline, even when badges and actions wrap. */
							<span className={styles.pageHeadingPrefix}>{titlePrefix}</span>
						)}

						<div className={styles.pageHeadingHeadline}>
							<div className={styles.pageHeadingTitleRow}>
								{isSimpleText(title) ? (
									<Heading level={level} className={styles.pageHeadingTitle}>
										{title}
									</Heading>
								) : (
									title
								)}
								{resolvedBadges.length > 0 && (
									<div className={styles.pageHeadingBadges}>
										{resolvedBadges.map((item, index) => (
											<Badge key={item.key ?? index} tone={item.tone ?? "neutral"}>
												{item.label}
											</Badge>
										))}
									</div>
								)}
								{titleSuffix}
							</div>

							{!!actions && (
								<div className={cx(styles.pageHeadingActions, actionsClassName)}>{actions}</div>
							)}
						</div>

						{(description != null || afterDescription != null) && (
							<div className={styles.pageHeadingBlock}>
								{description != null &&
									(isSimpleText(description) ? (
										<Text type="secondary" className={styles.pageHeadingDescription}>
											{description}
										</Text>
									) : (
										description
									))}
								{afterDescription}
							</div>
						)}
					</div>
				</div>
			</div>

			{!!children && <div className={styles.pageHeadingChildren}>{children}</div>}
			{!!withSeparator && <Separator className={styles.pageHeadingSeparator} />}
		</header>
	)
}
