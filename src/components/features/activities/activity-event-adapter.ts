/**
 * Maps a domain record to a log entry through an object of accessors, so the mapping can
 * be composed and partially overridden. Pure (no React), so it runs on a server or worker.
 */
import type { ReactNode } from "react"

import type { CommentData, CommentUser } from "@/components/features/comments"
import type { Mention } from "@/components/features/mentions"

import type {
	ActivityActor, ActivityChange, ActivityLogActivityEntry, ActivityLogCommentEntry,
	ActivityLogEntry, ActivityLogEventAction, ActivityTone,
} from "./activities.types"

export interface ActivityEventAdapterAccessors<
	TRaw,
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> {
	id: (record: TRaw) => string
	timestamp: (record: TRaw) => string
	kind?: (record: TRaw) => string
	event?: (record: TRaw) => string | undefined
	actor?: (record: TRaw) => string | ActivityActor | undefined
	title?: (record: TRaw) => ReactNode
	action?: (record: TRaw) => string | undefined
	target?: (record: TRaw) => ReactNode
	description?: (record: TRaw) => ReactNode
	descriptionHtml?: (record: TRaw) => string | undefined
	mentions?: (record: TRaw) => ReadonlyArray<Mention<TResource>> | undefined
	/** Names the system it came from. Becomes the source badge. */
	source?: (record: TRaw) => ReactNode
	/** Falls back into `target` when there is no explicit one. */
	status?: (record: TRaw) => ReactNode
	tone?: (record: TRaw) => ActivityTone | undefined
	metadata?: (record: TRaw) => ReadonlyArray<{ label: string; value: ReactNode }> | undefined
	changes?: (record: TRaw) => readonly ActivityChange[] | undefined
	details?: (record: TRaw) => ReactNode
	rowActions?: (record: TRaw) => ReadonlyArray<ActivityLogEventAction<TResource>> | undefined
	/** Returning a comment makes this a comment entry rather than an event. */
	comment?: (record: TRaw) => CommentData<TUser, TMeta, TResource> | undefined
	data?: (record: TRaw) => unknown
}

/** Reads a `kind` field off the record when no accessor says otherwise. */
function defaultKind(record: unknown): string {
	if (typeof record === "object" && record !== null && "kind" in record) {
		const kind = (record as { kind?: unknown }).kind
		if (typeof kind === "string") return kind
	}
	return "event"
}

export function toActivityLogEntry<
	TRaw,
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
>(
	record: TRaw,
	accessors: ActivityEventAdapterAccessors<TRaw, TUser, TMeta, TResource>,
): ActivityLogEntry<TUser, TMeta, TResource> {
	const kind = accessors.kind?.(record) ?? defaultKind(record)
	const id = accessors.id(record)
	const timestamp = accessors.timestamp(record)
	const comment = accessors.comment?.(record)

	/* Both conditions: a `comment` kind with no comment body stays an event. */
	if (kind === "comment" && comment) {
		return { id, kind: "comment", timestamp, comment } satisfies ActivityLogCommentEntry<
			TUser,
			TMeta,
			TResource
		>
	}

	return {
		id,
		kind,
		timestamp,
		event: accessors.event?.(record),
		actor: accessors.actor?.(record),
		action: accessors.action?.(record),
		// A status is a target when the record does not name one — "moved to Published".
		target: accessors.target?.(record) ?? accessors.status?.(record),
		label: accessors.source?.(record),
		headline: accessors.title?.(record),
		description: accessors.description?.(record),
		descriptionHtml: accessors.descriptionHtml?.(record),
		mentions: accessors.mentions?.(record),
		tone: accessors.tone?.(record),
		metadata: accessors.metadata?.(record),
		changes: accessors.changes?.(record),
		details: accessors.details?.(record),
		actions: accessors.rowActions?.(record),
		// The record itself, so a callback can reach fields the mapping did not name.
		data: accessors.data?.(record) ?? record,
	} satisfies ActivityLogActivityEntry<TResource>
}

/** Binds the accessors once, giving back a mapper to hand straight to `.map()`. */
export function createActivityEventAdapter<
	TRaw,
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
>(accessors: ActivityEventAdapterAccessors<TRaw, TUser, TMeta, TResource>) {
	return (record: TRaw) => toActivityLogEntry<TRaw, TUser, TMeta, TResource>(record, accessors)
}
