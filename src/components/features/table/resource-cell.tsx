/**
 * ResourceCell: the first column of an index table (thumbnail, linked title, subtitle,
 * chips, facts), built once so every list aligns the same way. The title is a plain anchor
 * unless `renderLink` routes it through the app's router.
 */
import type { ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { Badge, type BadgeTone } from "@/components/base/badge"
import { EmptyValue } from "@/components/primitives"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./table.module.css"

export interface ResourceCellMetadataItem {
	id?: string
	label?: ReactNode
	value: ReactNode
}

export type ResourceCellBadge =
	| ReactNode
	| { id?: string; label: ReactNode; tone?: BadgeTone; icon?: ReactNode }

export interface ResourceCellLinkProps {
	href: string
	children: ReactNode
	className?: string
	"aria-label"?: string
}

export interface ResourceCellProps {
	title?: ReactNode
	subtitle?: ReactNode
	/** Facts under the subtitle, separated by a middot. */
	metadata?: ReactNode | readonly ResourceCellMetadataItem[]
	badges?: readonly ResourceCellBadge[]
	/** Falls back to `fallback`, then to nothing, when absent or broken. */
	imageUrl?: string
	fallback?: ReactNode
	href?: string
	/** Routes the title through the app's router instead of a plain anchor. */
	renderLink?: (props: ResourceCellLinkProps) => ReactNode
	emptyLabel?: ReactNode
	className?: string
}

function isBadgeObject(badge: ResourceCellBadge): badge is {
	id?: string
	label: ReactNode
	tone?: BadgeTone
	icon?: ReactNode
} {
	return typeof badge === "object" && badge !== null && "label" in badge
}

export function ResourceCell({
	title,
	subtitle,
	metadata,
	badges,
	imageUrl,
	fallback,
	href,
	renderLink,
	emptyLabel,
	className,
}: ResourceCellProps) {
	if (title === null || title === undefined || title === "") {
		return <EmptyValue label={emptyLabel} />
	}

	const titleNode = <Text tag="span" weight="medium" truncate>{title}</Text>

	const linked = href
		? (renderLink?.({ href, children: titleNode, className: styles.resourceLink }) ?? (
				<a href={href} className={styles.resourceLink}>{titleNode}</a>
			))
		: titleNode

	const facts = Array.isArray(metadata)
		? (metadata as readonly ResourceCellMetadataItem[])
		: null

	return (
		<span className={cx("resource-cell--component", styles.resourceCell, className)}>
			{(!!imageUrl || !!fallback) && (
				<Avatar size="sm" className={styles.resourceMedia}>
					{!!imageUrl && <AvatarImage src={imageUrl} alt="" />}
					<AvatarFallback>{fallback}</AvatarFallback>
				</Avatar>
			)}

			<span className={styles.resourceBody}>
				<span className={styles.resourceTitleLine}>
					{linked}
					{badges?.map((badge, index) =>
						isBadgeObject(badge) ? (
							<Badge key={badge.id ?? index} tone={badge.tone ?? "neutral"}>
								{badge.icon}
								{badge.label}
							</Badge>
						) : (
							<span key={index}>{badge}</span>
						),
					)}
				</span>

				{!!subtitle && (
					<Text tag="span" size="xs" type="secondary" truncate>
						{subtitle}
					</Text>
				)}

				{facts
					? facts.length > 0 && (
							<span className={styles.resourceFacts}>
								{facts.map((fact, index) => (
									<span key={fact.id ?? index} className={styles.resourceFact}>
										{index > 0 && (
											<Text tag="span" size="xs" type="secondary" aria-hidden>·</Text>
										)}
										{!!fact.label && (
											<Text tag="span" size="xs" type="secondary">{fact.label}</Text>
										)}
										<Text tag="span" size="xs" type="secondary">{fact.value}</Text>
									</span>
								))}
							</span>
						)
					: (metadata as ReactNode)}
			</span>
		</span>
	)
}
