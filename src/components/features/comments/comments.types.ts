/**
 * Comments — a thread attached to any record. Generic over `TUser` (author shape),
 * `TMeta` (opaque per-comment payload) and `TResource` (mention kinds).
 *
 * Owns the composer, timeline, item and their states; fetching, routing, permissions and
 * copy arrive as callbacks and strings.
 */
import type { ComponentType, ReactNode } from "react"

import type { ContextActionSource } from "@/components/base/action-menu"
import type {
	Mention, MentionResource, MentionsResourceSearch,
} from "@/components/features/mentions"

import type { CommentsStrings } from "./comments.strings"

export interface CommentUser {
	id?: string | number
	name?: string
	avatar?: string
}

export type CommentAttachmentStatus = "uploading" | "uploaded" | "failed"

export interface CommentAttachment {
	id: string
	name: string
	/** Absent while uploading — there is nothing to link to yet. */
	url?: string
	size?: number
	mimeType?: string
	thumbnailUrl?: string
	status?: CommentAttachmentStatus
	/** 0–100 while in flight. */
	progress?: number
	/** Why the upload failed, as the consumer's message. Kit-side rejections use `CommentAttachmentRejection` codes. */
	error?: string
}

/** Why the composer refused a file before any upload started: a code plus the limit, never a sentence. */
export type CommentAttachmentRejectionCode = "too-large" | "too-many"

export interface CommentAttachmentRejection {
	code: CommentAttachmentRejectionCode
	file: File
	/** The limit that was exceeded — bytes for `too-large`, a count for `too-many`. */
	limit: number
}

export interface CommentReaction {
	/** An emoji or a short token. */
	emoji: string
	count: number
	/** Whether the viewer is one of them. */
	mine?: boolean
	/** Names behind the count, for the tooltip. */
	users?: string[]
}

/** `string & {}` keeps the union open: an app may store a format the kit does not know. */
export type CommentContentType = "text" | "html" | "rich" | (string & {})

export interface CommentData<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> {
	id?: string
	content?: string
	contentType?: CommentContentType
	createdAt?: string
	updatedAt?: string
	user?: TUser
	/** A moderation or workflow state, shown beside the timestamp. */
	status?: string
	isPinned?: boolean
	isEdited?: boolean
	/** Per-comment permission override. `undefined` defers to the thread's `canModerate`; `false` refuses regardless. */
	canDelete?: boolean
	canEdit?: boolean
	tagsArray?: string[] | Record<string, string>
	/** `null` entries survive a sparse array from an API and are skipped. */
	attachments?: Array<CommentAttachment | null>
	/** The mentions in the body, stored beside it. See features/mentions. */
	references?: ReadonlyArray<Mention<TResource>>
	reactions?: ReadonlyArray<CommentReaction>
	/** Threading. The id of the comment this replies to. */
	replyToId?: string
	meta?: TMeta
}

/** What the comment is attached to. */
export interface CommentableContext {
	id: string
	type: string
	/** A discriminator for an app that threads several kinds against one record. */
	moduleKey?: string
}

export interface CommentFormValues<TResource extends string = string> {
	content: string
	commentableId: string
	commentableType: string
	moduleKey?: string
	contentType?: CommentContentType
	references?: ReadonlyArray<Mention<TResource>>
	/** Already uploaded. The composer does not submit a file still in flight. */
	attachments?: ReadonlyArray<CommentAttachment>
	replyToId?: string
	editingId?: string
}

/** Handed to `onSubmit` so the consumer drives the composer from their own result (a resolved promise may still carry errors). */
export interface CommentSubmitHelpers {
	setErrors: (errors: Record<string, string>) => void
	reset: () => void
	setSubmitting: (submitting: boolean) => void
}

export type CommentMutationKind = "create" | "update" | "delete"

export interface CommentDeleteMutationPayload {
	commentId: string
}

export type CommentMutationPayload<TResource extends string = string> =
	| CommentFormValues<TResource>
	| CommentDeleteMutationPayload

/** Where the composer sits: `top` for a newest-first feed, `bottom` for a chat-like conversation. */
export type CommentsComposerPosition = "top" | "bottom"

/** The domain mapping. Each has a default; each exists for a shape the kit cannot guess. */
export interface CommentsAccessors {
	getMediaUrl?: (media: CommentAttachment | null | undefined) => string | undefined
	getMediaName?: (media: CommentAttachment | null | undefined) => string | undefined
	/** Turns `comment.status` into something a reader recognises. */
	getStatusLabel?: (status: string) => string | undefined
}

export interface CommentAttachmentUploadContext {
	file: File
	/** Call as the upload progresses. Throttling is the uploader's business. */
	onProgress: (progress: number) => void
	/** Aborted when the chip is removed mid-upload. Pass it to fetch. */
	signal: AbortSignal
}

export interface CommentsAttachmentsConfig {
	/**
	 * The uploader; without it the attachment control does not appear. Must resolve to a
	 * `CommentAttachment` with a permanent `url` — that, not the file, is what gets submitted.
	 */
	onUpload?: (context: CommentAttachmentUploadContext) => Promise<CommentAttachment>
	/** In bytes. */
	maxSize?: number
	maxFiles?: number
	/** Passed straight to the file input. */
	accept?: string
	disabled?: boolean
	/** Receives a refusal before any upload starts. */
	onReject?: (rejection: CommentAttachmentRejection) => void
}

export interface CommentsConfig<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> extends CommentsAccessors {
	composerPosition?: CommentsComposerPosition
	strings?: Partial<CommentsStrings>
	resources?: Partial<Record<TResource, MentionResource<TResource>>>
	onResourceSearch?: MentionsResourceSearch<TResource>
	attachments?: CommentsAttachmentsConfig
	canComment?: boolean
	canModerate?: boolean
	onSubmit?: (
		values: CommentFormValues<TResource>,
		helpers: CommentSubmitHelpers,
	) => void | Promise<void>
	onDelete?: (commentId: string) => void | Promise<void>
	onUpdate?: (
		commentId: string,
		values: CommentFormValues<TResource>,
		helpers: CommentSubmitHelpers,
	) => void | Promise<void>
	/** Fires after a mutation callback settles without throwing. */
	onAfterMutate?: (
		kind: CommentMutationKind,
		payload: CommentMutationPayload<TResource>,
	) => void
	/** Receives a rejected mutation, so a failure never escapes through a DOM event. */
	onError?: (error: unknown) => void
	onPinToggle?: (comment: CommentData<TUser, TMeta, TResource>) => void
	onReact?: (commentId: string, emoji: string) => void
	onReply?: (commentId: string) => void
	/** Replaces the kit's allow-list. There is no way to render unsanitised HTML. */
	sanitizer?: (html: string) => string
}

export interface CommentRenderItemContext<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> {
	comment: CommentData<TUser, TMeta, TResource>
	canModerate: boolean
	onDelete?: (commentId: string) => void
	onAttachmentRemove?: (commentId: string, attachmentId: string) => void
	onEdit?: (comment: CommentData<TUser, TMeta, TResource>) => void
	/** The item the kit would have rendered — for wrapping rather than replacing. */
	defaultItem: ReactNode
}

export interface CommentsSlots<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> {
	composerSlot?: ReactNode
	emptySlot?: ReactNode
	headerSlot?: ReactNode
	footerSlot?: ReactNode
	renderItem?: (context: CommentRenderItemContext<TUser, TMeta, TResource>) => ReactNode
	renderAttachment?: (attachment: CommentAttachment) => ReactNode
	/** Overrides the mention registry's own `renderChip`. */
	renderReference?: (reference: Mention<TResource>) => ReactNode
}

/** How a thread reads: what folds away and what a reader can do beyond reply and react. Shared by `Comments`, `CommentTimeline` and `CommentItem`. */
export interface CommentThreadOptions<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> {
	/**
	 * Extra entries for each comment's overflow menu, bound to the comment (`visible`,
	 * `disabled` and `onClick` receive it). Listed above pin, edit and delete; `destructive` sorts last.
	 */
	commentActions?: ContextActionSource<CommentData<TUser, TMeta, TResource>>
	/**
	 * Latest replies shown before earlier ones fold behind "Show N earlier replies". `0` shows all.
	 * @default 3
	 */
	maxVisibleReplies?: number
	/**
	 * Lines of a long body shown before "See more" (measured, so short bodies get no control). `0` never clamps.
	 * @default 6
	 */
	clampLines?: number
	/**
	 * Attachments shown before the rest fold behind "Show N more". `0` shows every file.
	 * @default 3
	 */
	maxVisibleAttachments?: number
	/**
	 * The reactions "Add reaction" offers. One reacts immediately; more open a picker.
	 * @default ["👍"]
	 */
	reactionChoices?: readonly string[]
}

/** Everything a rendered comment needs, shared by the timeline and one item. */
interface CommentDisplayProps<
	TUser extends CommentUser,
	TMeta,
	TResource extends string,
> extends CommentsAccessors,
		CommentThreadOptions<TUser, TMeta, TResource>,
		Pick<CommentsSlots<TUser, TMeta, TResource>, "renderAttachment" | "renderReference"> {
	canModerate?: boolean
	onDelete?: (commentId: string) => void
	/** Supplying it reveals the remove control on each attachment. */
	onAttachmentRemove?: (commentId: string, attachmentId: string) => void
	onEdit?: (comment: CommentData<TUser, TMeta, TResource>) => void
	onPinToggle?: (comment: CommentData<TUser, TMeta, TResource>) => void
	onReact?: (commentId: string, emoji: string) => void
	onReply?: (commentId: string) => void
	allowReactions?: boolean
	allowReplies?: boolean
	sanitizer?: (html: string) => string
	strings?: Partial<CommentsStrings>
	resources?: Partial<Record<TResource, MentionResource<TResource>>>
}

export interface CommentItemProps<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> extends CommentDisplayProps<TUser, TMeta, TResource> {
	comment: CommentData<TUser, TMeta, TResource>
	/** Replies to this comment, when the thread is nested. */
	replies?: ReadonlyArray<CommentData<TUser, TMeta, TResource>>
	className?: string
}

export interface CommentTimelineProps<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> extends CommentDisplayProps<TUser, TMeta, TResource>,
		Pick<CommentsSlots<TUser, TMeta, TResource>, "renderItem" | "emptySlot"> {
	comments: ReadonlyArray<CommentData<TUser, TMeta, TResource>>
	className?: string
}

export interface CommentComposerProps<TResource extends string = string> {
	context: CommentableContext
	canComment?: boolean
	/** Shows the pending state and refuses a second submission. */
	submitting?: boolean
	errors?: Record<string, string>
	/** Bumping it clears the draft. The composer is otherwise uncontrolled. */
	resetKey?: number
	onSubmit: (values: CommentFormValues<TResource>) => void | Promise<void>
	onCancel?: () => void
	/** Puts the composer in edit mode for that comment. */
	editingComment?: CommentData<CommentUser, unknown, TResource>
	/** Names the comment being replied to. */
	replyingTo?: { commentId: string; authorName?: string }
	strings?: Partial<CommentsStrings>
	resources?: Partial<Record<TResource, MentionResource<TResource>>>
	onResourceSearch?: MentionsResourceSearch<TResource>
	attachments?: CommentsAttachmentsConfig
	maxAttachments?: number
	allowAttachments?: boolean
	initialValues?: Partial<CommentFormValues<TResource>>
	autoFocus?: boolean
	/** Puts submit on the toolbar instead of a footer row, for a new comment only (reply and edit keep the footer). Off by default. */
	inlineSubmit?: boolean
	placeholder?: string
	className?: string
}

export interface CommentsProps<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> extends CommentsAccessors,
		CommentThreadOptions<TUser, TMeta, TResource>,
		CommentsSlots<TUser, TMeta, TResource> {
	context: CommentableContext
	/** In display order. Replies are nested by `replyToId`, not by position. */
	comments: ReadonlyArray<CommentData<TUser, TMeta, TResource>>
	canComment?: boolean
	canModerate?: boolean
	composerPosition?: CommentsComposerPosition
	maxAttachments?: number
	allowAttachments?: boolean
	allowReactions?: boolean
	allowReplies?: boolean
	/** Drops the card chrome, for a thread already inside a panel. */
	bare?: boolean
	/** `false` hides the title outright. */
	title?: ReactNode | false
	onSubmit?: CommentsConfig<TUser, TMeta, TResource>["onSubmit"]
	onDelete?: CommentsConfig<TUser, TMeta, TResource>["onDelete"]
	/** Asks before deleting. Off when the app already confirms upstream. */
	confirmDelete?: boolean
	onAttachmentRemove?: (commentId: string, attachmentId: string) => void | Promise<void>
	onUpdate?: CommentsConfig<TUser, TMeta, TResource>["onUpdate"]
	onAfterMutate?: CommentsConfig<TUser, TMeta, TResource>["onAfterMutate"]
	onError?: CommentsConfig<TUser, TMeta, TResource>["onError"]
	onPinToggle?: CommentsConfig<TUser, TMeta, TResource>["onPinToggle"]
	onReact?: CommentsConfig<TUser, TMeta, TResource>["onReact"]
	onReply?: CommentsConfig<TUser, TMeta, TResource>["onReply"]
	resources?: CommentsConfig<TUser, TMeta, TResource>["resources"]
	onResourceSearch?: CommentsConfig<TUser, TMeta, TResource>["onResourceSearch"]
	attachments?: CommentsAttachmentsConfig
	sanitizer?: CommentsConfig<TUser, TMeta, TResource>["sanitizer"]
	strings?: Partial<CommentsStrings>
	className?: string
	/** Replaces the generated avatar — for an app whose authors have presence or a badge. */
	avatarComponent?: ComponentType<{ user: TUser | undefined }>
}
