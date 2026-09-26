/**
 * The pieces a row is assembled from: the marker, the date label, the changes, the
 * resource chip, and the overflow menu. Tones are `data-tone` attributes resolved in CSS.
 */
import type { ReactNode } from "react"
import { ActivityIcon, ChevronDownIcon, ChevronRightIcon, CircleDotIcon } from "lucide-react"

import { ActionMenu, resolveContextActions } from "@/components/base/action-menu"
import { MetadataList } from "@/components/base/display"
import { Empty } from "@/components/base/feedback"
import { DisplayLabel, Text, TextLink } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import type {
	ActivityAction, ActivityChange, ActivityDensity, ActivityItem,
	ActivityResourceConfig, ActivityResourceRef, ActivityTone,
} from "./activities.types"
import styles from "./activities.module.css"

/* ── Marker ──────────────────────────────────────────────────────────────────────── */

export interface ActivityMarkerProps {
	icon: ReactNode
	tone: ActivityTone
	density: ActivityDensity
	/** The rail stops at the last row rather than running into nothing. */
	last: boolean
	className?: string
}

export function ActivityMarker({ icon, tone, density, last, className }: ActivityMarkerProps) {
	return (
		<div
			data-slot="activity-marker"
			data-tone={tone}
			data-activity-density={density}
			className={cx("activity-marker--component", styles.marker, className)}
		>
			{density === "compact" ? (
				// A dot: an audit trail read by scanning does not need an icon per row.
				<span aria-hidden className={styles.markerDot} />
			) : (
				<span aria-hidden className={styles.markerDisc}>{icon}</span>
			)}
			{!last && <span aria-hidden className={styles.markerRail} />}
		</div>
	)
}

/* ── Date group label ────────────────────────────────────────────────────────────── */

export function ActivityDateLabel({
	label,
	first,
	className,
}: {
	label: string
	first: boolean
	className?: string
}) {
	// An ungrouped feed passes "", and an eyebrow with no words is a gap.
	if (label === "") return null
	return (
		<DisplayLabel
			data-first={first || undefined}
			className={cx("activity-date-label--component", styles.dateLabel, className)}
		>
			{label}
		</DisplayLabel>
	)
}

/* ── Changes ─────────────────────────────────────────────────────────────────────── */

function ChangeValue({ change }: { change: ActivityChange }) {
	const hasOld = change.old !== null && change.old !== undefined
	const hasNew = change.new !== null && change.new !== undefined

	// Neither side reported: only the description says what happened.
	if (!hasOld && !hasNew) return <Text tag="span">{change.description}</Text>

	return (
		<span className={styles.changeValues}>
			{hasOld && (
				<Text tag="span" size="inherit" type="inherit" className={styles.changeOld}>
					{change.old}
				</Text>
			)}
			{/* The arrow only when there are two sides for it to sit between. */}
			{hasOld && hasNew && (
				<Text tag="span" size="inherit" type="secondary" aria-hidden>
					→
				</Text>
			)}
			{hasNew && (
				<Text tag="span" size="inherit" type="inherit" className={styles.changeNew}>
					{change.new}
				</Text>
			)}
		</span>
	)
}

export function ActivityChanges({
	changes,
	bare = false,
	className,
}: {
	changes: readonly ActivityChange[]
	/** Drops the frame, for use inside a panel that already has one. */
	bare?: boolean
	className?: string
}) {
	if (changes.length === 0) return null
	return (
		<MetadataList
			layout="rows"
			density="compact"
			className={cx("activity-changes--component", !bare && styles.changes, className)}
			items={changes.map(change => ({
				id: change.key,
				label: change.label,
				render: () => <ChangeValue change={change} />,
			}))}
		/>
	)
}

/* ── Resource chip ───────────────────────────────────────────────────────────────── */

export interface ActivityResourceTagProps {
	resource: ActivityResourceRef
	config?: ActivityResourceConfig
	/** Used when the registry has no entry and the ref has no label. */
	fallbackText?: string
	onClick?: () => void
	/** Compact references inside a headline omit their secondary facts. */
	showDetails?: boolean
}

export function ActivityResourceTag({
	resource,
	config,
	fallbackText,
	onClick,
	showDetails = true,
}: ActivityResourceTagProps) {
	const tone = config?.tone ?? "neutral"
	const Icon = config?.icon ?? CircleDotIcon
	// Registry, then the segment's own text, then the ref, then the raw key.
	const label = config?.label ?? fallbackText ?? resource.label ?? resource.key

	const content = (
		<>
			<span className={styles.tagIdentity}>
				<Icon className={styles.tagIcon} />
				<Text tag="span" size="inherit" type="inherit" weight="medium" lineHeight="tight" className={styles.tagLabel}>
					{label}
				</Text>
			</span>
			{showDetails && !!config?.tags?.length && (
				<Text tag="span" size="xs" type="secondary" className={styles.tagTags}>
					{config.tags.join(" · ")}
				</Text>
			)}
			{/* Toned Text, not a Badge: a pill inside the pill would outline the same fact twice. */}
			{showDetails && !!config?.badge && (
				<Text
					tag="span"
					size="xs"
					type="inherit"
					weight="medium"
					data-tone={config.badge.tone ?? "neutral"}
					className={styles.tagBadge}
				>
					{config.badge.label}
				</Text>
			)}
		</>
	)

	const shared = {
		"data-slot": "activity-resource",
		"data-tone": tone,
		title: config?.note,
		className: cx("activity-resource-tag--component", styles.tag),
	}

	if (onClick) {
		return (
			<button
				type="button"
				{...shared}
				// The row itself may be clickable; a chip inside it means something else.
				onClick={(event) => {
					event.stopPropagation()
					onClick()
				}}
			>
				{content}
			</button>
		)
	}

	return <span {...shared}>{content}</span>
}

/* ── Overflow menu ───────────────────────────────────────────────────────────────── */

export function ActivityActionsMenu<TData = unknown>({
	activity,
	actions,
	onAction,
	label,
}: {
	activity: ActivityItem<TData>
	actions: readonly ActivityAction<TData>[]
	onAction?: (actionId: string, activity: ActivityItem<TData>) => void
	label: string
}) {
	const definitions = resolveContextActions(actions, activity, {
		onAction: (id) => onAction?.(id, activity),
	}).map((action) => ({
		...action,
		// Only `destructive` carries through: the menu sorts and separates on it.
		tone: action.tone === "destructive" ? ("destructive" as const) : undefined,
	}))

	if (definitions.length === 0) return null

	return (
		<ActionMenu
			actions={definitions}
			strings={{ trigger: label }}
			align="end"
			buttonProps={{ iconOnly: true, buttonStyle: "ghost", tone: "neutral" }}
		/>
	)
}

/* ── Expand toggle ───────────────────────────────────────────────────────────────── */

export function ActivityExpandToggle({
	expanded,
	showLabel,
	hideLabel,
	onToggle,
	controls,
}: {
	expanded: boolean
	showLabel: string
	hideLabel: string
	onToggle: () => void
	controls?: string
}) {
	const label = expanded ? hideLabel : showLabel
	return (
		<TextLink
			render={<button type="button" />}
			variant="subtle"
			data-hit-area
			onClick={(event) => {
				event.stopPropagation()
				onToggle()
			}}
			aria-label={label}
			aria-expanded={expanded}
			aria-controls={expanded ? controls : undefined}
			title={label}
			className={cx("activity-expand-toggle--component", styles.expandToggle)}
		>
			{expanded ? <ChevronDownIcon aria-hidden /> : <ChevronRightIcon aria-hidden />}
			<Text tag="span" size="xs" weight="medium" type="secondary">{label}</Text>
		</TextLink>
	)
}

export interface ActivityEmptyStateProps {
	title: ReactNode
	/** A second line, for a feed that can say WHY it is empty. */
	hint?: ReactNode
	action?: ReactNode
	className?: string
}

/** The empty feed, with a glyph in the marker column so it reads as empty rather than broken. */
export function ActivityEmptyState({
	title,
	hint,
	action,
	className,
}: ActivityEmptyStateProps) {
	return (
		<Empty
			padding="md"
			title={title}
			description={hint ?? false}
			media={<ActivityIcon />}
			mediaVariant="icon-soft"
			action={action}
			className={cx("activity-empty-state--component", className)}
		/>
	)
}
