/**
 * ActivityLog — events and comments on one rail, built on ActivityFeed: a comment is an
 * activity whose row is a `CommentItem`, so both share markers, date groups and ordering.
 *
 * `mapEventToActivity` builds headline segments only from actor/action/target; it never
 * parses a plain headline back into segments.
 */
import { useCallback, useMemo, type ReactNode } from "react"
import { MessageCircleIcon } from "lucide-react"
import { formatDistanceToNow, isValid, parseISO } from "date-fns"

import { ContentBlock } from "@/components/base/display"
import {
	CommentComposer, CommentItem, useComments, type CommentUser,
} from "@/components/features/comments"
import { MentionContent } from "@/components/features/mentions"
import { useDatesConfig } from "@/lib/ui-provider"
import { cx } from "@/lib/cx"

import { ActivityFeed } from "./activities-feed"
import { ActivityMarker } from "./activity-parts"
import { resolveActivitiesStrings } from "./activities.strings"
import type {
	ActivityAction, ActivityFeedSlots, ActivityItem, ActivityLogActivityEntry,
	ActivityLogClassNameValue, ActivityLogCommentEntry, ActivityLogEntry, ActivityLogProps,
	ActivityLogRenderer,
	ActivityRowClassNames,
} from "./activities.types"
import styles from "./activities.module.css"

function sortEntries<T extends { timestamp?: string }>(
	entries: ReadonlyArray<T>,
	order: "asc" | "desc",
): T[] {
	return [...entries].sort((a, b) => {
		// An entry with no timestamp sorts to the far end rather than shuffling.
		const left = a.timestamp ? new Date(a.timestamp).getTime() : Number.NaN
		const right = b.timestamp ? new Date(b.timestamp).getTime() : Number.NaN
		const leftMissing = !Number.isFinite(left)
		const rightMissing = !Number.isFinite(right)
		if (leftMissing || rightMissing) {
			if (leftMissing && rightMissing) return 0
			return leftMissing ? 1 : -1
		}
		return order === "asc" ? left - right : right - left
	})
}

function toActor(actor: ActivityLogActivityEntry["actor"]) {
	if (!actor) return undefined
	return typeof actor === "string" ? { name: actor } : actor
}

function isRenderable(value: ReactNode) {
	return value !== null && value !== undefined && value !== false
}

function resolveEventClass<TUser extends CommentUser, TMeta, TResource extends string>(
	value: ActivityLogClassNameValue<TResource> | undefined,
	entry: ActivityLogEntry<TUser, TMeta, TResource> | undefined,
) {
	// Comment rows are not event rows; the event class hooks do not apply to them.
	if (!value || !entry || entry.kind === "comment") return undefined
	return typeof value === "function" ? value(entry as ActivityLogActivityEntry<TResource>) : value
}

function mapEventToActivity<TResource extends string>(
	entry: ActivityLogActivityEntry<TResource>,
	resources: ActivityLogProps<CommentUser, unknown, TResource>["resources"],
): ActivityItem<ActivityLogActivityEntry<TResource>> {
	const actor = toActor(entry.actor)

	/* Stored markup wins, rendered through MentionContent so references become chips, as in comments. */
	const description = entry.descriptionHtml ? (
		<MentionContent
			html={entry.descriptionHtml}
			mentions={entry.mentions}
			resources={resources}
		/>
	) : (
		entry.description
	)

	// Only build segments when there are actual parts. Otherwise the headline stands.
	const hasParts = !!(actor || entry.action || isRenderable(entry.target))
	const segments = hasParts
		? [
				...(actor ? [{ type: "actor" as const, text: actor.name, actorId: actor.id }] : []),
				...(entry.action ? [{ type: "text" as const, text: entry.action }] : []),
				...(isRenderable(entry.target) ? [{ type: "value" as const, text: String(entry.target) }] : []),
			]
		: undefined

	return {
		id: entry.id,
		event: entry.event ?? entry.kind,
		source: typeof entry.label === "string" ? entry.label : entry.kind,
		actor,
		createdAt: entry.timestamp,
		iconOverride: entry.icon,
		toneOverride: entry.tone,
		headline: typeof entry.headline === "string" ? entry.headline : undefined,
		description,
		metadata: entry.metadata,
		changes: entry.changes,
		details: entry.details,
		collapsible: entry.collapsible,
		defaultExpanded: entry.defaultExpanded,
		segments,
		// The original, so every callback can hand it back untouched.
		data: entry,
	}
}

export function ActivityLog<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
>({
	entries,
	loading,
	error,
	onRetry,
	order = "desc",
	itemSpacing = "default",
	resources,
	onResourceSearch,
	canModerate,
	onCommentDelete,
	onCommentReact,
	onCommentReply,
	onCommentPinToggle,
	strings,
	activityStrings,
	renderers,
	renderEventDetails,
	eventDetailsCollapsible = true,
	defaultExpandedIds,
	expandedIds,
	onExpandedIdsChange,
	onEventExpandedChange,
	onEventAction,
	classNames,
	composer,
	bare = false,
	title,
	getMediaUrl,
	getMediaName,
	getStatusLabel,
	className,
}: ActivityLogProps<TUser, TMeta, TResource>) {
	const copy = resolveActivitiesStrings(activityStrings)
	const dates = useDatesConfig()

	const formatRelative = useCallback(
		(iso: string) => {
			const parsed = parseISO(iso)
			if (!isValid(parsed)) return iso
			if (dates.formatRelativeTime) return dates.formatRelativeTime(parsed, new Date())
			return formatDistanceToNow(parsed, {
				addSuffix: true,
				...(dates.locale ? { locale: dates.locale } : {}),
			})
		},
		[dates],
	)

	const composerState = useComments<CommentUser, unknown, TResource>({
		onSubmit: composer?.onSubmit,
		onAfterMutate: composer?.onAfterMutate,
		onError: composer?.onError,
	})

	const sorted = useMemo(() => sortEntries(entries, order), [entries, order])

	const activities = useMemo(
		() =>
			sorted.map((entry) => {
				if (entry.kind === "comment") {
					/* `renderRow` replaces the row, so only the fields the feed reads (id, event, timestamp) matter. */
					return {
						id: entry.id,
						event: "comment",
						source: "comment",
						createdAt: entry.timestamp,
						data: entry,
					} satisfies ActivityItem<ActivityLogEntry<TUser, TMeta, TResource>>
				}
				return mapEventToActivity(
					entry as ActivityLogActivityEntry<TResource>,
					resources,
				) as ActivityItem<ActivityLogEntry<TUser, TMeta, TResource>>
			}),
		[resources, sorted],
	)

	const rowClassNames = useMemo<ActivityRowClassNames<ActivityLogEntry<TUser, TMeta, TResource>>>(
		() => ({
			row: (activity) => resolveEventClass(classNames?.eventRow, activity.data),
			marker: (activity) => resolveEventClass(classNames?.eventMarker, activity.data),
			content: (activity) => resolveEventClass(classNames?.eventContent, activity.data),
			details: (activity) => resolveEventClass(classNames?.eventDetails, activity.data),
		}),
		[classNames],
	)

	const composerBlock = composer?.enabled ? (
		<CommentComposer<TResource>
			context={composer.context}
			canComment
			submitting={composerState.isSubmitting}
			errors={composerState.formErrors}
			resetKey={composerState.resetKey}
			onSubmit={composerState.submit}
			resources={resources}
			onResourceSearch={onResourceSearch}
			strings={strings}
			placeholder={composer.placeholder}
			autoFocus={composer.autoFocus}
			inlineSubmit={composer.inlineSubmit ?? false}
		/>
	) : null

	const composerPosition = composer?.position ?? "top"

	const actionsForActivity = useCallback(
		(
			activity: ActivityItem<ActivityLogEntry<TUser, TMeta, TResource>>,
		): readonly ActivityAction<ActivityLogEntry<TUser, TMeta, TResource>>[] => {
			const entry = activity.data
			// A comment carries its own controls; the row menu is for events.
			if (!entry || entry.kind === "comment") return []
			const event = entry as ActivityLogActivityEntry<TResource>
			return (event.actions ?? []).map((action) => ({
				id: action.id,
				label: action.label,
				icon: action.icon,
				href: action.href,
				disabled: action.disabled,
				tone: action.tone,
				presentation: action.presentation,
				onClick: () => action.onSelect?.(event),
			}))
		},
		[],
	)

	const slots: ActivityFeedSlots<ActivityLogEntry<TUser, TMeta, TResource>> = {
		header: composerPosition === "top" ? composerBlock : undefined,
		footer: composerPosition === "bottom" ? composerBlock : undefined,

		renderRow: (activity, context) => {
			const entry = activity.data
			if (!entry) return undefined

			// A consumer renderer for this kind replaces the row outright.
			const custom = renderers?.[entry.kind] as
				| ActivityLogRenderer<TUser, TMeta, TResource>
				| undefined
			if (custom) {
				return custom(entry, {
					resources,
					accessors: { getMediaUrl, getMediaName, getStatusLabel },
					strings,
				})
			}

			// `undefined` hands the row back to the feed's own renderer.
			if (entry.kind !== "comment") return undefined
			// TypeScript loses the `kind` discriminant through the generic `data` field.
			const commentEntry = entry as ActivityLogCommentEntry<TUser, TMeta, TResource>

			return (
				<div
					data-slot="activity-comment-row"
					data-spacing={context.itemSpacing}
					data-last={context.isLast || undefined}
					className={styles.commentRow}
				>
					<ActivityMarker
						icon={<MessageCircleIcon />}
						tone="neutral"
						density={context.density}
						last={context.isLast}
					/>
					<div className={styles.commentBody}>
						<CommentItem<TUser, TMeta, TResource>
							comment={commentEntry.comment}
							canModerate={canModerate}
							onDelete={onCommentDelete}
							onPinToggle={onCommentPinToggle}
							onReact={onCommentReact}
							onReply={onCommentReply}
							strings={strings}
							resources={resources}
							getMediaUrl={getMediaUrl}
							getMediaName={getMediaName}
							getStatusLabel={getStatusLabel}
						/>
					</div>
				</div>
			)
		},

		renderDetails: (activity, context) => {
			const entry = activity.data
			if (!entry || entry.kind === "comment") return null
			return renderEventDetails?.(entry as ActivityLogActivityEntry<TResource>, {
				expanded: context.expanded,
				setExpanded: context.setExpanded,
				relativeTime: context.relativeTime,
				isLast: context.isLast,
				resources,
			})
		},
	}

	const feed = (
		<ActivityFeed<ActivityLogEntry<TUser, TMeta, TResource>>
			activities={activities}
			loading={loading}
			error={error}
			onRetry={onRetry}
			// Always rich: only rich draws changes and metadata.
			density="rich"
			itemSpacing={itemSpacing}
			groupByDate
			strings={activityStrings}
			detailsCollapsible={eventDetailsCollapsible}
			defaultExpandedIds={defaultExpandedIds}
			expandedIds={expandedIds}
			onExpandedIdsChange={onExpandedIdsChange}
			formatRelativeTime={formatRelative}
			getSourceLabel={(source) => copy.sources[source] ?? source}
			actionsForActivity={actionsForActivity}
			rowClassNames={rowClassNames}
			onAction={(actionId, activity) => {
				const entry = activity.data
				if (entry && entry.kind !== "comment") {
					onEventAction?.(actionId, entry as ActivityLogActivityEntry<TResource>)
				}
			}}
			onActivityExpandedChange={(activity, expanded) => {
				const entry = activity.data
				if (entry && entry.kind !== "comment") {
					onEventExpandedChange?.(entry as ActivityLogActivityEntry<TResource>, expanded)
				}
			}}
			slots={slots}
			className={cx(classNames?.list, bare && className)}
		/>
	)

	if (bare) return feed

	const label = title ?? copy.title

	return (
		<section
			data-slot="activity-log"
			aria-label={typeof label === "string" ? label : undefined}
			className={cx("activity-log--component", styles.log, className)}
		>
			{!!label && <ContentBlock title={label} />}
			{feed}
		</section>
	)
}
