/**
 * Activities types. `ActivityFeed` is a timeline of events; `ActivityLog` interleaves events
 * and comments on the same rail (built on the feed), with a composer.
 *
 * Headlines are segments rather than a string so each part (actor, field, value, status,
 * resource) gets its own treatment while staying data.
 */
import type { ContextAction } from "@/components/base/action-menu"
import type { ComponentType, ReactNode } from "react"
import type { Locale } from "date-fns"

import type {
	CommentData, CommentFormValues, CommentSubmitHelpers, CommentUser, CommentsAccessors,
	CommentsConfig, CommentsStrings,
} from "@/components/features/comments"
import type { Mention, MentionsConfig } from "@/components/features/mentions"
import type { SemanticTone } from "@/lib/component-vocabulary"

import type { ActivitiesStrings } from "./activities.strings"

export type ActivityTone = SemanticTone

/**
 * How much of a row is drawn.
 *
 * `compact` a dot and one line, for an audit trail read by scanning.
 * `default` an icon and a second line, for a record's own history.
 * `rich`    the whole row: metadata, changes, resources, actions.
 */
export type ActivityDensity = "compact" | "default" | "rich"

/** The rhythm between rows, independent of how much each row draws. */
export type ActivityItemSpacing = "compact" | "default" | "relaxed"

export interface ActivityActor {
	/** Compared against `currentUserId` to render "You" instead of a name. */
	id?: string
	name: string
	avatarUrl?: string
	initials?: string
	href?: string
}

/** A pointer. The registry holds what it points AT. */
export interface ActivityResourceRef {
	/** Domain-scoped, conventionally `order:1234`. */
	key: string
	type?: string
	/** Used when the registry has no entry for the key. */
	label?: string
}

/** What a resource looks like, held once in the registry and looked up by every row that references it. */
export interface ActivityResourceConfig {
	label: string
	href?: string
	icon?: ComponentType<{ className?: string }>
	/**
	 * The record type's colour, drawn on the chip's glyph only — chip colour is reserved for
	 * state (`badge`). See the vocabulary note in activities.module.css.
	 */
	tone?: ActivityTone
	/** The record's own state, as toned text inside the chip. Colour here IS the meaning. */
	badge?: { label: string; tone?: ActivityTone }
	tags?: readonly string[]
	/** Shown on hover. */
	note?: string
}

export type ActivityHeadlineSegment =
	| { type: "text"; text: string }
	| { type: "actor"; text: string; actorId?: string; href?: string }
	| { type: "field"; text: string }
	| { type: "value"; text: string }
	| { type: "status"; text: string; tone?: ActivityTone }
	| { type: "resource"; text?: string; resource: ActivityResourceRef }

export interface ActivityChange {
	key: string
	label: string
	/** `null` means there was no prior value; `undefined` means it is not reported. */
	old?: ReactNode | null
	/** `null` means the value was cleared. */
	new?: ReactNode | null
	/** Used when neither side is given — "recalculated", "re-indexed". */
	description?: ReactNode
}

export interface ActivityItem<TData = unknown> {
	id: string
	/** The domain event key. Looked up in the event registry for an icon and a tone. */
	event: string
	/** Which system it came from. Drives the source badge. */
	source?: string
	actor?: ActivityActor
	/**
	 * The headline as typed parts: actor, field, value, status, resource, text. Preferred over
	 * `headline`: “Maria changed Status from Draft to Published” is a person, a field, and two
	 * values, and a template string cannot express that.
	 */
	segments?: readonly ActivityHeadlineSegment[]
	/**
	 * The fallback when there are no segments. The actor's name is split out of it, so a feed
	 * migrated from a system that only stored sentences still gets a clickable actor.
	 */
	headline?: string
	description?: ReactNode
	createdAt?: string
	/** A pre-formatted time, bypassing the formatters entirely. */
	timestamp?: string
	metadata?: ReadonlyArray<{ label: string; value: ReactNode }>
	changes?: readonly ActivityChange[]
	details?: ReactNode
	collapsible?: boolean
	defaultExpanded?: boolean
	resources?: readonly ActivityResourceRef[]
	data?: TData
	iconOverride?: ComponentType<{ className?: string }>
	toneOverride?: ActivityTone
}

export interface ActivityEventConfig {
	icon: ComponentType<{ className?: string }>
	tone: ActivityTone
	label?: string
	sourceLabel?: string
}

export type ActivityEventConfigMap = Readonly<Record<string, ActivityEventConfig>>

/** An activity's action: the kit's `ContextAction`, bound to the activity. */
export interface ActivityAction<TData = unknown> extends ContextAction<ActivityItem<TData>> {
	id: string
	label: string
	icon?: ComponentType<{ className?: string }>
	tone?: ActivityTone
	/** `inline` renders a button under the row; `menu` keeps it in the overflow. `placement` wins when both are set. */
	presentation?: "inline" | "menu"
}

/** Everything a custom renderer needs about where its row sits. */
export interface ActivityRenderRowContext<TData = unknown> {
	density: ActivityDensity
	isLast: boolean
	isFirstInGroup: boolean
	activity: ActivityItem<TData>
	eventConfig: ActivityEventConfig
	tone: ActivityTone
	relativeTime: string | null
	absoluteTime: string | null
	sourceLabel: string | null
	expanded: boolean
	itemSpacing: ActivityItemSpacing
	setExpanded: (expanded: boolean) => void
	toggleExpanded: () => void
}

export interface ActivityFeedSlots<TData = unknown> {
	renderRow?: (activity: ActivityItem<TData>, context: ActivityRenderRowContext<TData>) => ReactNode
	renderHeadline?: (activity: ActivityItem<TData>, context: ActivityRenderRowContext<TData>) => ReactNode
	renderMarker?: (activity: ActivityItem<TData>, context: ActivityRenderRowContext<TData>) => ReactNode
	renderDetails?: (activity: ActivityItem<TData>, context: ActivityRenderRowContext<TData>) => ReactNode
	renderDateLabel?: (label: string, isFirst: boolean) => ReactNode
	empty?: ReactNode
	loading?: ReactNode
	/** Above the first row — usually a composer. */
	header?: ReactNode
	footer?: ReactNode
}

/** A class, or a function of the row — for styling one kind of event differently. */
export type ActivityRowClassNameValue<TData = unknown> =
	| string
	| ((activity: ActivityItem<TData>) => string | undefined)

export interface ActivityRowClassNames<TData = unknown> {
	row?: ActivityRowClassNameValue<TData>
	marker?: ActivityRowClassNameValue<TData>
	content?: ActivityRowClassNameValue<TData>
	details?: ActivityRowClassNameValue<TData>
}

export interface ActivityFeedAccessors<TData = unknown> {
	formatRelativeTime?: (iso: string) => string
	formatAbsoluteTime?: (iso: string) => string
	formatDateGroupLabel?: (iso: string | null, strings: ActivitiesStrings) => string
	getEventLabel?: (event: string) => string | undefined
	getSourceLabel?: (source: string) => string | undefined
	actionsForActivity?: (activity: ActivityItem<TData>) => readonly ActivityAction<TData>[] | undefined
}

export interface ActivityFeedCallbacks<TData = unknown> {
	onActivityClick?: (activity: ActivityItem<TData>) => void
	onActorClick?: (actor: ActivityActor, activity: ActivityItem<TData>) => void
	onResourceClick?: (
		resource: ActivityResourceRef,
		config: ActivityResourceConfig | undefined,
		activity: ActivityItem<TData>,
	) => void
	onAction?: (actionId: string, activity: ActivityItem<TData>) => void
	onActivityExpandedChange?: (activity: ActivityItem<TData>, expanded: boolean) => void
}

export interface ActivityResourcesProps {
	/**
	 * The registry rows look their resources up in, by key. A hundred rows referencing
	 * `order:1234` follow when it is renamed, and none of them stores the name. This is the
	 * registry's seed, re-seeded whenever this reference changes.
	 */
	resources?: Readonly<Record<string, ActivityResourceConfig>>
	/** Fires on every mutation, so the registry can be persisted. */
	onResourcesChange?: (registry: Readonly<Record<string, ActivityResourceConfig>>) => void
}

export interface ActivityFeedProps<TData = unknown>
	extends ActivityFeedAccessors<TData>,
		ActivityFeedCallbacks<TData>,
		ActivityResourcesProps {
	/**
	 * In display order. Grouped by date as they come, not bucketed — bucketing would silently
	 * reorder a feed sorted by something other than date.
	 */
	activities?: ReadonlyArray<ActivityItem<TData>>
	/** How much of a row is drawn. `rich` adds metadata, changes, resources, and actions. */
	density?: ActivityDensity
	/** The rhythm between rows, independent of how much each row draws. */
	itemSpacing?: ActivityItemSpacing
	groupByDate?: boolean
	expandedByDefault?: boolean
	detailsCollapsible?: boolean
	/** Uncontrolled: the rows expanded at first. */
	defaultExpandedIds?: ReadonlyArray<string>
	/** Controlled. Supplying it hands expansion to the caller. */
	expandedIds?: ReadonlyArray<string>
	/**
	 * Always gets the full id list, controlled or not, because a consumer persisting the set
	 * needs the set.
	 */
	onExpandedIdsChange?: (ids: string[]) => void
	/**
	 * Turns this person's own name into “You”. Both ids must be defined for the match, or a
	 * feed with no ids anywhere would call every actor “You”.
	 */
	currentUserId?: string
	/**
	 * Shows initial loading for an empty feed, or an update status above existing rows. Keeps
	 * loaded details and composer drafts mounted.
	 */
	loading?: boolean
	/**
	 * Failure feedback for a load or refresh, with an optional retry action through `onRetry`.
	 * A failed refresh keeps existing history visible; the consumer owns the request and its
	 * loading state.
	 */
	error?: ReactNode
	/** The retry action offered with `error`. */
	onRetry?: () => void
	/**
	 * Merged over the kit's defaults, so one event can be redefined without restating the rest.
	 * Every `status_changed` in an application should look the same; deciding per call site
	 * guarantees it eventually does not.
	 */
	eventConfig?: ActivityEventConfigMap
	strings?: Partial<ActivitiesStrings>
	/**
	 * `renderRow`, `renderHeadline`, `renderMarker` and `renderDetails` replace a row's parts;
	 * `renderDateLabel`, `empty`, `loading`, `header` and `footer` the feed's own regions.
	 * `renderRow` returning `undefined` hands the row back to the feed — which is how
	 * ActivityLog replaces only its comment rows.
	 */
	slots?: ActivityFeedSlots<TData>
	rowClassNames?: ActivityRowClassNames<TData>
	className?: string
	/** Overrides the scope's dates locale, for a feed rendered in another language. */
	locale?: Locale
}

/* ── ActivityLog: the mixed surface ───────────────────────────────────────────────── */

export interface ActivityLogCommentEntry<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> {
	id: string
	kind: "comment"
	timestamp: string
	comment: CommentData<TUser, TMeta, TResource>
}

export interface ActivityLogEventAction<TResource extends string = string> {
	id: string
	label: string
	icon?: ComponentType<{ className?: string }>
	tone?: ActivityTone
	href?: string
	disabled?: boolean
	presentation?: "inline" | "menu"
	onSelect?: (entry: ActivityLogActivityEntry<TResource>) => void
}

export interface ActivityLogActivityEntry<TResource extends string = string> {
	id: string
	/** `event`, `system`, `audit`, or whatever the app calls its own. */
	kind: "event" | "system" | "audit" | (string & {})
	timestamp: string
	event?: string
	icon?: ComponentType<{ className?: string }>
	tone?: ActivityTone
	/** A name, or the whole actor when there is an avatar or a link. */
	actor?: string | ActivityActor
	/** The verb — "changed", "assigned". */
	action?: string
	/** What it acted on. */
	target?: ReactNode
	/** Names the source, shown as a badge. */
	label?: ReactNode
	headline?: ReactNode
	description?: ReactNode
	/** Stored markup, rendered with its mentions as live chips. Wins over `description`. */
	descriptionHtml?: string
	mentions?: ReadonlyArray<Mention<TResource>>
	metadata?: ReadonlyArray<{ label: string; value: ReactNode }>
	changes?: ReadonlyArray<ActivityChange>
	details?: ReactNode
	collapsible?: boolean
	defaultExpanded?: boolean
	actions?: ReadonlyArray<ActivityLogEventAction<TResource>>
	data?: unknown
}

export type ActivityLogEntry<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> = ActivityLogCommentEntry<TUser, TMeta, TResource> | ActivityLogActivityEntry<TResource>

export interface ActivityLogEventRenderContext<TResource extends string = string> {
	expanded: boolean
	setExpanded: (expanded: boolean) => void
	relativeTime: string | null
	isLast: boolean
	resources?: MentionsConfig<TResource>["resources"]
}

export type ActivityLogRenderer<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> = (
	entry: ActivityLogEntry<TUser, TMeta, TResource>,
	context: {
		resources?: MentionsConfig<TResource>["resources"]
		accessors?: CommentsAccessors
		strings?: Partial<CommentsStrings>
	},
) => ReactNode

export interface ActivityLogComposerConfig<TResource extends string = string> {
	enabled: boolean
	position?: "top" | "bottom"
	context: { id: string; type: string; moduleKey?: string }
	onSubmit?: NonNullable<CommentsConfig<CommentUser, unknown, TResource>["onSubmit"]>
	onAfterMutate?: CommentsConfig<CommentUser, unknown, TResource>["onAfterMutate"]
	onError?: CommentsConfig<CommentUser, unknown, TResource>["onError"]
	placeholder?: string
	autoFocus?: boolean
	/** Puts the submit on the toolbar instead of a footer row. Defaults to `false`. */
	inlineSubmit?: boolean
}

export type ActivityLogClassNameValue<TResource extends string = string> =
	| string
	| ((entry: ActivityLogActivityEntry<TResource>) => string | undefined)

export interface ActivityLogClassNames<TResource extends string = string> {
	list?: string
	eventRow?: ActivityLogClassNameValue<TResource>
	eventMarker?: ActivityLogClassNameValue<TResource>
	eventContent?: ActivityLogClassNameValue<TResource>
	eventDetails?: ActivityLogClassNameValue<TResource>
}

export interface ActivityLogProps<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> extends CommentsAccessors {
	/**
	 * A union of comment entries and activity entries, sorted here by `order`. An entry with no
	 * timestamp sorts to the far end rather than shuffling.
	 */
	entries: ReadonlyArray<ActivityLogEntry<TUser, TMeta, TResource>>
	/**
	 * Shows initial loading for an empty log, or an update status above existing entries. Keeps
	 * loaded entries and the composer mounted during a refresh.
	 */
	loading?: boolean
	/**
	 * Fetch failure feedback, independent of comment submission errors, with an optional retry
	 * action through `onRetry`. A failed refresh keeps existing history visible; the consumer
	 * owns the request and its loading state.
	 */
	error?: ReactNode
	/** The retry action offered with `error`. */
	onRetry?: () => void
	/** `desc` puts the newest first, which is what a log usually wants. */
	order?: "asc" | "desc"
	itemSpacing?: ActivityItemSpacing
	resources?: MentionsConfig<TResource>["resources"]
	onResourceSearch?: MentionsConfig<TResource>["onResourceSearch"]
	canModerate?: boolean
	onCommentDelete?: (commentId: string) => void
	onCommentReact?: (commentId: string, emoji: string) => void
	onCommentReply?: (commentId: string) => void
	onCommentPinToggle?: (comment: CommentData<TUser, TMeta, TResource>) => void
	strings?: Partial<CommentsStrings>
	/** Separate from the comment copy: the two vocabularies are unrelated. */
	activityStrings?: Partial<ActivitiesStrings>
	/** Keyed by entry kind, replacing the built-in row for that kind. */
	renderers?: Partial<Record<string, ActivityLogRenderer<TUser, TMeta, TResource>>>
	renderEventDetails?: (
		entry: ActivityLogActivityEntry<TResource>,
		context: ActivityLogEventRenderContext<TResource>,
	) => ReactNode
	eventDetailsCollapsible?: boolean
	defaultExpandedIds?: ReadonlyArray<string>
	expandedIds?: ReadonlyArray<string>
	onExpandedIdsChange?: (ids: string[]) => void
	onEventExpandedChange?: (entry: ActivityLogActivityEntry<TResource>, expanded: boolean) => void
	onEventAction?: (actionId: string, entry: ActivityLogActivityEntry<TResource>) => void
	classNames?: ActivityLogClassNames<TResource>
	/**
	 * The comment composer: `enabled`, the `context` it posts against, `onSubmit`, and its
	 * `position`. Omit to render the log read-only. Its `inlineSubmit` defaults to `false` here,
	 * unlike a standalone composer: a log's submit sits above a wall of history, and one hidden
	 * on the toolbar reads as formatting.
	 */
	composer?: ActivityLogComposerConfig<TResource>
	bare?: boolean
	title?: ReactNode
	className?: string
}

export type ActivityLogSubmit<TResource extends string = string> = (
	values: CommentFormValues<TResource>,
	helpers: CommentSubmitHelpers,
) => void | Promise<void>
