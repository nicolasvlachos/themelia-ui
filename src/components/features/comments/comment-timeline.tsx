/**
 * CommentTimeline — a flat, display-ordered `comments` array nested by `replyToId`. A reply
 * whose parent is absent (e.g. paged out) is promoted to the top level. Replies keep array
 * order; an open thread shows the last `maxVisibleReplies`.
 *
 * Rendered as a list of articles, each named by its author.
 */
import { useMemo } from "react"
import { MessageCircleIcon } from "lucide-react"

import { Empty } from "@/components/base/feedback"
import { cx } from "@/lib/cx"

import { CommentThreadContext } from "./comment-thread-context"
import { CommentItem } from "./comment-item"
import { defaultCommentsStrings } from "./comments.strings"
import type { CommentData, CommentTimelineProps, CommentUser } from "./comments.types"
import styles from "./comments.module.css"

export function CommentTimeline<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
>({
	comments,
	canModerate,
	onDelete,
	onAttachmentRemove,
	onEdit,
	onPinToggle,
	onReact,
	onReply,
	allowReactions,
	allowReplies,
	commentActions,
	maxVisibleReplies,
	clampLines,
	maxVisibleAttachments,
	reactionChoices,
	sanitizer,
	strings,
	getMediaUrl,
	getMediaName,
	getStatusLabel,
	resources,
	renderItem,
	renderAttachment,
	renderReference,
	emptySlot,
	className,
}: CommentTimelineProps<TUser, TMeta, TResource>) {
	const copy = { ...defaultCommentsStrings, ...strings }

	const { roots, repliesByParent } = useMemo(() => {
		const present = new Set(comments.map((comment) => comment.id).filter(Boolean))
		const byParent = new Map<string, CommentData<TUser, TMeta, TResource>[]>()
		const top: CommentData<TUser, TMeta, TResource>[] = []

		for (const comment of comments) {
			// A reply whose parent is not here is a top-level comment, not a lost one.
			if (comment.replyToId && present.has(comment.replyToId)) {
				const siblings = byParent.get(comment.replyToId) ?? []
				siblings.push(comment)
				byParent.set(comment.replyToId, siblings)
			} else {
				top.push(comment)
			}
		}

		return { roots: top, repliesByParent: byParent }
	}, [comments])

	if (comments.length === 0) {
		return (
			<>
				{emptySlot ?? (
					<Empty
						padding="sm"
						media={<MessageCircleIcon />}
						mediaVariant="icon"
						title={copy.empty}
						description={copy.emptyHint}
					/>
				)}
			</>
		)
	}

	return (
		<CommentThreadContext.Provider value={repliesByParent}>
		<ul role="list" data-slot="comment-timeline" className={cx("comment-timeline--component", styles.timeline, className)}>
			{roots.map((comment, index) => {
				const item = (
					<CommentItem<TUser, TMeta, TResource>
						comment={comment}
						replies={allowReplies === false ? undefined : repliesByParent.get(comment.id ?? "")}
						canModerate={canModerate}
						onDelete={onDelete}
						onAttachmentRemove={onAttachmentRemove}
						onEdit={onEdit}
						onPinToggle={onPinToggle}
						onReact={onReact}
						onReply={onReply}
						allowReactions={allowReactions}
						allowReplies={allowReplies}
						commentActions={commentActions}
						maxVisibleReplies={maxVisibleReplies}
						clampLines={clampLines}
						maxVisibleAttachments={maxVisibleAttachments}
						reactionChoices={reactionChoices}
						sanitizer={sanitizer}
						strings={strings}
						getMediaUrl={getMediaUrl}
						getMediaName={getMediaName}
						getStatusLabel={getStatusLabel}
						resources={resources}
						renderAttachment={renderAttachment}
						renderReference={renderReference}
					/>
				)

				return (
					<li key={comment.id ?? `comment-${index}`} className={styles.timelineEntry}>
						{renderItem
							? renderItem({
									comment,
									canModerate: canModerate ?? false,
									onDelete,
									onAttachmentRemove,
									onEdit,
									// Handed over so a consumer can wrap rather than rebuild.
									defaultItem: item,
								})
							: item}
					</li>
				)
			})}
		</ul>
		</CommentThreadContext.Provider>
	)
}
