/**
 * ActivityRow — one entry on the rail. Density changes how much is drawn, not the data.
 *
 * `onActivityClick` makes the row a keyboard `button` only when nothing inside it is
 * focusable; otherwise it stays a pointer affordance so nested controls remain reachable.
 */
import { useId, type ComponentType, type ReactNode } from "react"

import { resolveContextActions, splitActions } from "@/components/base/action-menu"
import { Button } from "@/components/base/buttons"
import { MetadataList } from "@/components/base/display"
import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import {
	ActivityActionsMenu, ActivityChanges, ActivityExpandToggle, ActivityMarker,
	ActivityResourceTag,
} from "./activity-parts"
import { defaultActivitiesStrings } from "./activities.strings"
import { ActivityHeadline } from "./activity-headline"
import type {
	ActivityAction, ActivityActor, ActivityDensity, ActivityEventConfig, ActivityItem,
	ActivityItemSpacing, ActivityResourceConfig, ActivityResourceRef, ActivityTone,
} from "./activities.types"
import styles from "./activities.module.css"

/** How many metadata entries the collapsed preview shows before "+n more". */
const METADATA_PREVIEW = 3

export interface ActivityRowProps<TData = unknown> {
	activity: ActivityItem<TData>
	density: ActivityDensity
	itemSpacing: ActivityItemSpacing
	eventConfig: ActivityEventConfig
	tone: ActivityTone
	last: boolean
	expanded: boolean
	onExpandedChange: (expanded: boolean) => void
	detailsCollapsible?: boolean
	/** Captions for the expanded detail groups. */
	detailLabels?: { changes?: string; metadata?: string; resources?: string }
	relativeTime: string | null
	/** Shown on hover of the relative time — the exact moment. */
	absoluteTime: string | null
	sourceLabel: string | null
	youLabel: string
	showChangesLabel: string
	hideChangesLabel: string
	moreLabel: string
	actionsLabel: string
	currentUserId?: string
	actions: readonly ActivityAction<TData>[]
	onActivityClick?: (activity: ActivityItem<TData>) => void
	onActorClick?: (actor: ActivityActor, activity: ActivityItem<TData>) => void
	onResourceClick?: (
		resource: ActivityResourceRef,
		config: ActivityResourceConfig | undefined,
		activity: ActivityItem<TData>,
	) => void
	onAction?: (actionId: string, activity: ActivityItem<TData>) => void
	getResourceConfig?: (ref: ActivityResourceRef) => ActivityResourceConfig | undefined
	headlineOverride?: ReactNode
	markerOverride?: ReactNode
	customDetails?: ReactNode
	rowClassName?: string
	markerClassName?: string
	contentClassName?: string
	detailsClassName?: string
}

function MetadataPreview({
	metadata,
	moreLabel,
}: {
	metadata: NonNullable<ActivityItem["metadata"]>
	moreLabel: string
}) {
	const visible = metadata.slice(0, METADATA_PREVIEW)
	const hidden = metadata.length - visible.length

	return (
		<div className={styles.metaPreview}>
			<MetadataList
				layout="inline"
				density="compact"
				itemSeparator
				items={visible.map((entry) => ({ id: entry.label, label: entry.label, value: entry.value }))}
			/>
			{hidden > 0 && (
				<Text tag="span" size="xs" type="secondary">
					{`+${hidden} ${moreLabel}`}
				</Text>
			)}
		</div>
	)
}

/** The expanded facts. `MetadataList` is the description list, so this only picks a shape. */
function MetadataGrid({ metadata }: { metadata: NonNullable<ActivityItem["metadata"]> }) {
	return (
		<MetadataList
			columns={{ base: 2 }}
			density="compact"
			className={styles.metaGrid}
			items={metadata.map((entry) => ({
				id: entry.label,
				label: entry.label,
				value: entry.value,
			}))}
		/>
	)
}

export function ActivityRow<TData = unknown>({
	activity,
	density,
	itemSpacing,
	eventConfig,
	tone,
	last,
	expanded,
	onExpandedChange,
	detailsCollapsible,
	detailLabels,
	relativeTime,
	absoluteTime,
	sourceLabel,
	youLabel,
	showChangesLabel,
	hideChangesLabel,
	moreLabel,
	actionsLabel,
	currentUserId,
	actions,
	onActivityClick,
	onActorClick,
	onResourceClick,
	onAction,
	getResourceConfig,
	headlineOverride,
	markerOverride,
	customDetails,
	rowClassName,
	markerClassName,
	contentClassName,
	detailsClassName,
}: ActivityRowProps<TData>) {
	const Icon = activity.iconOverride ?? eventConfig.icon
	const panelId = useId()
	const headlineResources = (activity.segments ?? []).flatMap(segment => segment.type === "resource" ? [segment.resource] : [])
	const resources = [...new Map([...(activity.resources ?? []), ...headlineResources].map(resource => [resource.key, resource])).values()]

	const metadata = activity.metadata ?? []
	const hasMetadata = metadata.length > 0
	const hasChanges = (activity.changes?.length ?? 0) > 0
	const hasResources = resources.length > 0
	const hasDetails = activity.details !== undefined && activity.details !== null && activity.details !== false
	const hasCustomDetails = customDetails !== undefined && customDetails !== null && customDetails !== false
	const hasPanel = hasMetadata || hasChanges || hasDetails || hasCustomDetails || hasResources
	const hasDescription = activity.description !== undefined && activity.description !== null && activity.description !== ""

	const rich = density === "rich"
	/* Collapsible by default only for metadata/changes; a lone details node is the point of the row. */
	const collapsible = detailsCollapsible ?? (hasMetadata || hasChanges || hasResources)
	const showPanel = rich && hasPanel && (!collapsible || expanded)
	const showPreview = rich && hasMetadata && collapsible && !expanded

	/*
	 * `placement` wins over `presentation`; neither means menu. Inline actions are resolved and
	 * bound here; menu ones go to ActivityActionsMenu, which resolves its own.
	 */
	const placed = actions.map((action) => ({
		...action,
		placement: action.placement ?? (action.presentation === "inline" ? ("inline" as const) : ("menu" as const)),
	}))
	const { inline: inlinePlaced, overflow: menuActions } = splitActions(placed)
	const inlineActions = resolveContextActions(inlinePlaced, activity, {
		onAction: (id) => onAction?.(id, activity),
	})

	const interactive = typeof onActivityClick === "function"
	const nestedInteractive =
		(rich && hasPanel && collapsible) ||
		hasResources ||
		menuActions.length > 0 ||
		inlineActions.length > 0 ||
		typeof onActorClick === "function" ||
		typeof onResourceClick === "function"
	// No button role when the row contains controls (see header).
	const keyboardRow = interactive && !nestedInteractive

	return (
		<div
			data-slot="activity-row"
			data-activity-density={density}
			data-spacing={itemSpacing}
			data-last={last || undefined}
			data-interactive={interactive || undefined}
			className={cx("activity-row--component", styles.row, rowClassName)}
			onClick={interactive ? () => onActivityClick?.(activity) : undefined}
			role={keyboardRow ? "button" : undefined}
			tabIndex={keyboardRow ? 0 : undefined}
			onKeyDown={
				keyboardRow
					? (event) => {
							if (event.key !== "Enter" && event.key !== " ") return
							event.preventDefault()
							onActivityClick?.(activity)
						}
					: undefined
			}
		>
			{markerOverride ?? (
				<ActivityMarker
					icon={<Icon />}
					tone={tone}
					density={density}
					last={last}
					className={markerClassName}
				/>
			)}

			<div className={cx(styles.content, contentClassName)}>
				<div className={styles.summary}>
					<div className={styles.summaryMain}>
						<div className={styles.headlineRow}>
							{headlineOverride ?? (
								<ActivityHeadline<TData>
									activity={activity}
									currentUserId={currentUserId}
									youLabel={youLabel}
									onActorClick={onActorClick}
									onResourceClick={onResourceClick}
									getResourceConfig={getResourceConfig}
								/>
							)}
						</div>

						{(relativeTime || sourceLabel) && (
							<div className={styles.eventMeta}>
								{!!relativeTime && (
									<Text tag="span" size="xs" type="secondary" className={styles.time}>
										<time dateTime={activity.createdAt} title={absoluteTime ?? undefined}>{relativeTime}</time>
									</Text>
								)}
								{!!sourceLabel && <Text tag="span" size="xs" type="secondary" className={styles.source}>{sourceLabel}</Text>}
							</div>
						)}

					</div>

					<div className={styles.summaryTrailing}>
						{rich && menuActions.length > 0 && (
							<ActivityActionsMenu<TData>
								activity={activity}
								actions={menuActions}
								onAction={onAction}
								label={actionsLabel}
							/>
						)}
					</div>
				</div>

				{/* A compact row is one line by definition, so the description is dropped. */}
				{density !== "compact" && hasDescription && (
					<Text tag="div" type="secondary" lineHeight="relaxed" className={styles.description}>
						{activity.description}
					</Text>
				)}

				{showPreview && <MetadataPreview metadata={metadata} moreLabel={moreLabel} />}

				{rich && hasPanel && collapsible && (
					<div className={styles.disclosure}>
							<ActivityExpandToggle
								controls={panelId}
								expanded={expanded}
								showLabel={showChangesLabel}
								hideLabel={hideChangesLabel}
								onToggle={() => onExpandedChange(!expanded)}
							/>
					</div>
				)}

				{showPanel && (
					<div id={panelId} className={cx(styles.panel, detailsClassName)}>
						{hasChanges && !!activity.changes && (
							<div className={styles.detailSection} role="group" aria-label={detailLabels?.changes ?? defaultActivitiesStrings.changesTitle}>
								<DisplayLabel>{detailLabels?.changes ?? defaultActivitiesStrings.changesTitle}</DisplayLabel>
								<ActivityChanges changes={activity.changes} bare />
							</div>
						)}
						{hasMetadata && (
							<div className={styles.detailSection} role="group" aria-label={detailLabels?.metadata ?? defaultActivitiesStrings.metadataTitle}>
								<DisplayLabel>{detailLabels?.metadata ?? defaultActivitiesStrings.metadataTitle}</DisplayLabel>
								<MetadataGrid metadata={metadata} />
							</div>
						)}
						{hasResources && (
							<div className={styles.detailSection} role="group" aria-label={detailLabels?.resources ?? defaultActivitiesStrings.resourcesTitle}>
								<DisplayLabel>{detailLabels?.resources ?? defaultActivitiesStrings.resourcesTitle}</DisplayLabel>
								<div className={styles.resources}>
								{resources.map((resource) => {
									const config = getResourceConfig?.(resource)
									return (
										<ActivityResourceTag
											key={resource.key}
											resource={resource}
											config={config}
											onClick={
												onResourceClick
													? () => onResourceClick(resource, config, activity)
													: undefined
											}
										/>
									)
								})}
								</div>
							</div>
						)}

						{hasDetails && <div className={styles.detailSection}>{activity.details}</div>}
						{hasCustomDetails && <div className={styles.detailSection}>{customDetails}</div>}
					</div>
				)}
				{rich && inlineActions.length > 0 && (
					<div className={styles.rowFooter}>
						{rich && inlineActions.length > 0 && (
							<div className={styles.inlineActions}>
								{inlineActions.map((action) => {
									const ActionIcon = action.icon as ComponentType | undefined
									return (
										<Button
											key={action.id}
											type="button"
											tone={action.tone === "destructive" ? "destructive" : "neutral"}
											buttonStyle="ghost"
											disabled={action.disabled}
											onClick={(event) => {
												event.stopPropagation()
												action.onClick?.()
											}}
										>
											{!!ActionIcon && <ActionIcon />}
											{action.label}
										</Button>
									)
								})}
							</div>
						)}

					</div>
				)}

			</div>
		</div>
	)
}
