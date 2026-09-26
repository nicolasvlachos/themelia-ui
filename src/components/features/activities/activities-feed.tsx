/**
 * ActivityFeed — the timeline of events. `isLast` means the last row rendered across all
 * groups, so the rail runs unbroken past date headings.
 */
import { useMemo, type ReactNode } from "react"
import { format, formatDistanceToNow, isValid, parseISO, type Locale } from "date-fns"

import { Alert, AlertAction, AlertDescription, AlertTitle, ErrorState, LoadingState } from "@/components/base/feedback"
import { Button } from "@/components/base/buttons"
import { useDatesConfig } from "@/lib/ui-provider"
import { cx } from "@/lib/cx"

import { ActivityDateLabel, ActivityEmptyState } from "./activity-parts"
import { ActivityRow } from "./activity-row"
import { defaultActivityEventConfig, resolveEventConfig } from "./activities.config"
import { resolveActivitiesStrings } from "./activities.strings"
import { useActivityFeed } from "./use-activity-feed"
import { useActivityResources } from "./use-activity-resources"
import type {
	ActivityAction, ActivityFeedProps, ActivityItem, ActivityRenderRowContext,
	ActivityRowClassNameValue, ActivityTone,
} from "./activities.types"
import styles from "./activities.module.css"

function defaultAbsolute(iso: string, locale?: Locale) {
	try {
		const date = new Date(iso)
		return isValid(date) ? format(date, "PP p", locale ? { locale } : undefined) : iso
	} catch {
		return iso
	}
}

function resolveRowClass<TData>(
	value: ActivityRowClassNameValue<TData> | undefined,
	activity: ActivityItem<TData>,
) {
	return typeof value === "function" ? value(activity) : value
}

export function ActivityFeed<TData = unknown>({
	activities = [],
	density = "default",
	itemSpacing = "default",
	groupByDate = true,
	expandedByDefault = false,
	detailsCollapsible,
	defaultExpandedIds,
	expandedIds,
	onExpandedIdsChange,
	currentUserId,
	loading = false,
	error,
	onRetry,
	eventConfig,
	strings,
	slots,
	rowClassNames,
	className,
	locale,
	formatRelativeTime,
	formatAbsoluteTime,
	formatDateGroupLabel,
	getSourceLabel,
	actionsForActivity,
	onActivityClick,
	onActorClick,
	onResourceClick,
	onAction,
	onActivityExpandedChange,
	resources,
	onResourcesChange,
}: ActivityFeedProps<TData>) {
	const copy = resolveActivitiesStrings(strings)

	// Shallow-merged, so an unlisted event still falls back to the kit's own entry.
	const events = useMemo(
		() => ({ ...defaultActivityEventConfig, ...eventConfig }),
		[eventConfig],
	)

	const registry = useActivityResources({ resources, onResourcesChange })

	const dates = useDatesConfig()
	const resolvedLocale = locale ?? dates.locale

	const feed = useActivityFeed<TData>({
		activities,
		groupByDate,
		expandedByDefault,
		defaultExpandedIds,
		expandedIds,
		onExpandedIdsChange,
		locale: resolvedLocale,
		strings: copy,
		formatDateGroupLabel,
	})

	/*
	 * The prop, then the scope's formatter, then date-fns. The scope's formatter takes two
	 * Dates (shared with RelativeTime), so it is adapted here.
	 */
	const relative =
		formatRelativeTime ??
		((iso: string) => {
			const date = parseISO(iso)
			if (!isValid(date)) return iso
			if (dates.formatRelativeTime) return dates.formatRelativeTime(date, new Date())
			return formatDistanceToNow(date, {
				addSuffix: true,
				...(resolvedLocale ? { locale: resolvedLocale } : {}),
			})
		})
	const absolute = formatAbsoluteTime ?? ((iso: string) => defaultAbsolute(iso, resolvedLocale))

	const total = feed.groups.reduce((sum, group) => sum + group.items.length, 0)
	const hasError = error !== undefined && error !== null && error !== false
	let rendered = 0

	return (
		<div data-slot="activity-feed" aria-busy={loading || undefined} className={cx("activities-feed--component", styles.feed, className)}>
			{!!slots?.header && <div className={styles.feedHeader}>{slots.header}</div>}

			{loading && (
				<div className={slots?.loading != null ? styles.state : undefined}>
					{slots?.loading ?? <LoadingState label={activities.length > 0 ? copy.refreshing : copy.loading} className={activities.length > 0 ? styles.refreshing : styles.state} />}
				</div>
			)}
			{!loading && hasError && (activities.length > 0 ? (
				<Alert tone="warning" role="alert">
					<AlertTitle>{copy.refreshError}</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
					{onRetry && <AlertAction><Button tone="neutral" buttonStyle="outline" onClick={onRetry}>{copy.retry}</Button></AlertAction>}
				</Alert>
			) : <ErrorState title={copy.error} description={error} onRetry={onRetry} strings={{ retry: copy.retry }} />)}
			{!loading && !hasError && activities.length === 0 && (
				slots?.empty ?? <ActivityEmptyState title={copy.empty} hint={copy.emptyHint} />
			)}
			{activities.length > 0 && (
				<div className={styles.groups}>
					{feed.groups.map((group, groupIndex) => (
						<div key={`${group.label}-${groupIndex}`} className={styles.group}>
							{slots?.renderDateLabel
								? slots.renderDateLabel(group.label, groupIndex === 0)
								: <ActivityDateLabel label={group.label} first={groupIndex === 0} />}

							<div className={styles.rows}>
								{group.items.map(({ activity, key }, itemIndex) => {
									// Across every group, so the rail does not break at a date heading.
									const isLast = ++rendered === total
									const config = resolveEventConfig(activity.event, events)
									const tone: ActivityTone = activity.toneOverride ?? config.tone

									const relativeTime =
										activity.timestamp ?? (activity.createdAt ? relative(activity.createdAt) : null)
									const absoluteTime = activity.createdAt ? absolute(activity.createdAt) : null

									// Accessor, then strings map, then the event's label; "" hides the badge.
									const rawSource = activity.source
										? (getSourceLabel?.(activity.source) ??
											copy.sources[activity.source] ??
											config.sourceLabel ??
											null)
										: (config.sourceLabel ?? null)
									const sourceLabel = rawSource && rawSource.trim().length > 0 ? rawSource : null

									const actions: readonly ActivityAction<TData>[] =
										actionsForActivity?.(activity) ?? []

									const context: ActivityRenderRowContext<TData> = {
										density,
										isLast,
										isFirstInGroup: itemIndex === 0,
										activity,
										eventConfig: config,
										tone,
										relativeTime,
										absoluteTime,
										sourceLabel,
										expanded: feed.isExpanded(activity.id),
										itemSpacing,
										setExpanded: (expanded) => feed.setExpanded(activity.id, expanded),
										toggleExpanded: () => feed.toggleExpanded(activity.id),
									}

									const customRow = slots?.renderRow?.(activity, context)
									if (customRow !== undefined) return <div key={key}>{customRow}</div>

									return (
										<ActivityRow<TData>
											key={key}
											activity={activity}
											density={density}
											itemSpacing={itemSpacing}
											eventConfig={config}
											tone={tone}
											last={isLast}
											expanded={context.expanded}
											onExpandedChange={(expanded) => {
												feed.setExpanded(activity.id, expanded)
												onActivityExpandedChange?.(activity, expanded)
											}}
											// The row's own answer wins over the feed's default.
											detailsCollapsible={activity.collapsible ?? detailsCollapsible}
											relativeTime={relativeTime}
											absoluteTime={absoluteTime}
											sourceLabel={sourceLabel}
											youLabel={copy.you}
											showChangesLabel={copy.showChanges}
											hideChangesLabel={copy.hideChanges}
											moreLabel={copy.moreLabel}
											actionsLabel={copy.actionsLabel}
											detailLabels={{ changes: copy.changesTitle, metadata: copy.metadataTitle, resources: copy.resourcesTitle }}
											currentUserId={currentUserId}
											actions={actions}
											onActivityClick={onActivityClick}
											onActorClick={onActorClick}
											onResourceClick={onResourceClick}
											onAction={onAction}
											getResourceConfig={(ref) => registry.get(ref)}
											headlineOverride={slots?.renderHeadline?.(activity, context) as ReactNode}
											markerOverride={slots?.renderMarker?.(activity, context) as ReactNode}
											customDetails={slots?.renderDetails?.(activity, context)}
											rowClassName={resolveRowClass(rowClassNames?.row, activity)}
											markerClassName={resolveRowClass(rowClassNames?.marker, activity)}
											contentClassName={resolveRowClass(rowClassNames?.content, activity)}
											detailsClassName={resolveRowClass(rowClassNames?.details, activity)}
										/>
									)
								})}
							</div>
						</div>
					))}
				</div>
			)}

			{!!slots?.footer && <div className={styles.feedFooter}>{slots.footer}</div>}
		</div>
	)
}
