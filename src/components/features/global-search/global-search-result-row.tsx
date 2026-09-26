/** A search result composed from the shared Item, media, typography, and badge parts. */
import type { ReactNode } from "react"
import { ArrowRightIcon, FileIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import { IconBadge } from "@/components/base/display"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/base/item"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import type { GlobalSearchResult } from "./global-search.types"
import styles from "./global-search.module.css"

export interface GlobalSearchResultRowProps<TGroup extends string = string> {
	result: GlobalSearchResult<TGroup>
	/** The keyboard highlight. At most one row in the list has it. */
	active?: boolean
	/** The text to mark inside the title and subtitle. */
	query?: string
	onSelect?: () => void
	onMouseEnter?: () => void
	onFocus?: () => void
	className?: string
}

/* Marks every occurrence, as the combobox does. */
function highlight(text: string, query: string): ReactNode {
	const needle = query.trim()
	if (!needle) return text
	const parts = text.split(new RegExp(`(${needle.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&")})`, "gi"))
	if (parts.length === 1) return text
	return parts.map((part, index) =>
		// Odd indices are the captured matches; parts never move, so the index is a stable key.
		index % 2 === 1
			? <mark key={`m${index}`}>{part}</mark>
			: part && <span key={`t${index}`}>{part}</span>,
	)
}

export function GlobalSearchResultRow<TGroup extends string = string>({
	result, active = false, query = "", onSelect, onMouseEnter, onFocus, className,
}: GlobalSearchResultRowProps<TGroup>) {
	const { avatar, thumbnail } = result
	const media = avatar ? (
		<Avatar data-tone={avatar.tone ?? "neutral"} className={styles.avatar}>
			{!!avatar.src && <AvatarImage src={avatar.src} alt="" />}
			<AvatarFallback className={styles.avatarFallback}>{avatar.initials}</AvatarFallback>
		</Avatar>
	) : thumbnail?.src ? (
		<Avatar className={styles.imageThumbnail}>
			<AvatarImage src={thumbnail.src} alt="" />
			<AvatarFallback>{thumbnail.icon ?? <FileIcon />}</AvatarFallback>
		</Avatar>
	) : thumbnail ? (
		<IconBadge tone={thumbnail.tone ?? "neutral"} icon={thumbnail.icon ?? <FileIcon />} className={styles.thumbnail} />
	) : null

	const hasFigure = result.rightValue != null || result.rightLabel != null
	const hasDetails = result.badge || result.subtitle || result.meta?.length || result.timestamp || result.tags?.length

	return (
		<Item
			render={<button type="button" onClick={onSelect} onMouseEnter={onMouseEnter} onFocus={onFocus} />}
			data-slot="global-search-result-row"
			data-active={active || undefined}
			aria-current={active || undefined}
			className={cx("global-search-result-row--component", styles.row, className)}
		>
			{media && <ItemMedia aria-hidden>{media}</ItemMedia>}
			<ItemContent className={styles.rowContent}>
				<ItemTitle className={styles.resultTitle}>{highlight(result.title, query)}</ItemTitle>
				{!!hasDetails && (
					<div className={styles.secondaryLine}>
						{result.badge && <Badge tone={result.badge.tone}>{result.badge.label}</Badge>}
						{/* The subtitle is one fact on the line, at the line's size. */}
						{result.subtitle && (
							<Text tag="span" size="xs" type="secondary">{highlight(result.subtitle, query)}</Text>
						)}
						{result.meta?.map((meta, index) => (
							<Text key={index} tag="span" size="xs" type="secondary" className={cx(styles.meta, meta.mono && styles.metaMono)}>
								{meta.icon && <span aria-hidden className={styles.metaIcon}>{meta.icon}</span>}
								{meta.label}
							</Text>
						))}
						{result.timestamp && <Text tag="span" size="xs" type="secondary">{result.timestamp}</Text>}
						{result.tags?.map((tag) => <Badge key={tag} variant="outline" tone="neutral">{tag}</Badge>)}
					</div>
				)}
				{hasFigure && (
					<span className={styles.inlineFigure}>
						<Text tag="span" weight="semibold">{result.rightValue}</Text>
						{result.rightLabel != null && <Text tag="span" size="xs" type="secondary">{result.rightLabel}</Text>}
					</span>
				)}
			</ItemContent>
			{hasFigure && (
				<span className={styles.figure}>
					{result.rightValue != null && <Text tag="span" weight="semibold" className={styles.figureValue}>{result.rightValue}</Text>}
					{result.rightLabel != null && <Text tag="span" size="xs" type="secondary">{result.rightLabel}</Text>}
				</span>
			)}
			{/* Only when nothing trails the content, so rows share one right edge. */}
			{!hasFigure && <span aria-hidden className={styles.chevron}><ArrowRightIcon /></span>}
		</Item>
	)
}
