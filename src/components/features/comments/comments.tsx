/**
 * Comments — the composer and the timeline, wired together.
 *
 * A control appears only when its callback is supplied (`onDelete`, `onUpdate`, …); the
 * flags `canComment`, `canModerate` and `allowReplies` cover viewer permission and thread shape.
 *
 * The top composer and the in-thread composer (reply/edit) are separate `useComments`
 * instances, so their drafts, errors and submits never cross.
 */
import { useCallback, useEffect, useRef, useState } from "react"

import { ContentBlock } from "@/components/base/display"
import { Stack } from "@/components/base/structure"
import { ConfirmDialog, useOverlayVisibility } from "@/components/features/overlays"
import { cx } from "@/lib/cx"

import { CommentComposer } from "./comment-composer"
import { CommentInlineComposerContext, type CommentInlineComposer } from "./comment-thread-context"
import { CommentTimeline } from "./comment-timeline"
import { useComments } from "./use-comments"
import { defaultCommentsStrings } from "./comments.strings"
import type { CommentUser, CommentsProps } from "./comments.types"
import styles from "./comments.module.css"

export function Comments<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
>(props: CommentsProps<TUser, TMeta, TResource>) {
	const {
		context,
		comments,
		canComment = true,
		canModerate = false,
		composerPosition = "top",
		maxAttachments,
		allowAttachments = true,
		allowReactions = true,
		allowReplies = true,
		bare = false,
		confirmDelete = true,
		className,
		strings,
	} = props

	const copy = { ...defaultCommentsStrings, ...strings }
	const title = props.title ?? copy.title
	const contextKey = `${context.type}\u0000${context.id}\u0000${context.moduleKey ?? ""}`
	const previousContextKey = useRef(contextKey)

	const callbacks = {
		onSubmit: props.onSubmit,
		onUpdate: props.onUpdate,
		onDelete: props.onDelete,
		onAfterMutate: props.onAfterMutate,
		onError: props.onError,
		scopeKey: contextKey,
	}
	/** The composer at the top: always a new thread, never a reply or an edit. */
	const state = useComments<TUser, TMeta, TResource>(callbacks)
	/** The composer inside the thread: a reply under a comment, or an edit in its place. */
	const thread = useComments<TUser, TMeta, TResource>(callbacks)

	/* Opt-out confirmation: deleting a comment removes its replies too. */
	const deleteConfirm = useOverlayVisibility()
	const [pendingDelete, setPendingDelete] = useState<string | null>(null)
	useEffect(() => {
		if (previousContextKey.current === contextKey) return
		previousContextKey.current = contextKey
		setPendingDelete(null)
		deleteConfirm.hide()
	}, [contextKey, deleteConfirm])

	const requestDelete = useCallback(
		(id: string) => {
			if (!confirmDelete) {
				void state.deleteComment(id)
				return
			}
			setPendingDelete(id)
			deleteConfirm.show()
		},
		[confirmDelete, deleteConfirm, state],
	)

	const { startReply, cancelComposerMode: closeThreadComposer } = thread
	const { onReply } = props
	const handleReply = useCallback(
		(commentId: string) => {
			const comment = comments.find((item) => item.id === commentId)
			if (comment) startReply(comment)
			// The consumer hears about it too — a route change, a scroll, an analytic.
			onReply?.(commentId)
		},
		[comments, onReply, startReply],
	)

	const mode = thread.composerMode
	const editingComment = mode.kind === "editing" ? mode.comment : undefined
	const replyingTo =
		mode.kind === "replying" ? { commentId: mode.commentId, authorName: mode.authorName } : undefined
	const targetId = editingComment?.id ?? replyingTo?.commentId

	/* Close the in-thread composer if its target comment disappears. */
	useEffect(() => {
		if (targetId && !comments.some((comment) => comment.id === targetId)) closeThreadComposer()
	}, [closeThreadComposer, comments, targetId])

	const composer =
		props.composerSlot ??
		(canComment ? (
			<CommentComposer<TResource>
				context={context}
				canComment={canComment}
				submitting={state.isSubmitting}
				errors={state.formErrors}
				resetKey={state.resetKey}
				onSubmit={state.submit}
				strings={strings}
				resources={props.resources}
				onResourceSearch={props.onResourceSearch}
				attachments={props.attachments}
				maxAttachments={maxAttachments}
				allowAttachments={allowAttachments}
			/>
		) : null)

	/* Keyed by its target, so switching reply/edit targets starts a clean draft. */
	const inlineComposer =
		canComment && targetId ? (
			<CommentComposer<TResource>
				key={`${mode.kind}:${targetId}`}
				context={context}
				canComment={canComment}
				submitting={thread.isSubmitting}
				errors={thread.formErrors}
				resetKey={thread.resetKey}
				editingComment={editingComment}
				replyingTo={replyingTo}
				onCancel={thread.cancelComposerMode}
				onSubmit={thread.submit}
				placeholder={editingComment ? copy.editPlaceholder : copy.replyPlaceholder}
				strings={strings}
				resources={props.resources}
				onResourceSearch={props.onResourceSearch}
				attachments={props.attachments}
				maxAttachments={maxAttachments}
				allowAttachments={allowAttachments}
				className={styles.inlineComposer}
			/>
		) : undefined

	// Not memoised: the composer element is new on every render, so the items re-render anyway.
	const inline: CommentInlineComposer = {
		composer: inlineComposer,
		editingId: editingComment?.id,
		replyingToId: replyingTo?.commentId,
	}

	const timeline = (
		<CommentTimeline<TUser, TMeta, TResource>
			comments={comments}
			canModerate={canModerate}
			// Each control appears only if there is something for it to call.
			onDelete={props.onDelete ? requestDelete : undefined}
			onAttachmentRemove={props.onAttachmentRemove}
			onEdit={canComment && props.onUpdate ? thread.startEdit : undefined}
			onPinToggle={props.onPinToggle}
			onReact={props.onReact}
			onReply={canComment && allowReplies ? handleReply : undefined}
			allowReactions={allowReactions}
			allowReplies={allowReplies}
			commentActions={props.commentActions}
			maxVisibleReplies={props.maxVisibleReplies}
			clampLines={props.clampLines}
			maxVisibleAttachments={props.maxVisibleAttachments}
			reactionChoices={props.reactionChoices}
			sanitizer={props.sanitizer}
			strings={strings}
			getMediaUrl={props.getMediaUrl}
			getMediaName={props.getMediaName}
			getStatusLabel={props.getStatusLabel}
			resources={props.resources}
			renderItem={props.renderItem}
			renderAttachment={props.renderAttachment}
			renderReference={props.renderReference}
			emptySlot={props.emptySlot}
		/>
	)

	const body = (
		<Stack gap="xl" className={styles.body}>
			{props.headerSlot}
			{composerPosition === "top" && composer}
			<CommentInlineComposerContext.Provider value={inline}>{timeline}</CommentInlineComposerContext.Provider>
			{composerPosition === "bottom" && composer}
			{props.footerSlot}
		</Stack>
	)

	const confirmation = !!(confirmDelete && props.onDelete) && (
		<ConfirmDialog
			{...deleteConfirm.overlayProps}
			destructive
			title={copy.confirmDeleteTitle}
			description={copy.confirmDeleteDescription}
			strings={{ confirm: copy.confirmDeleteLabel }}
			// Async, so the overlay holds its spinner until the delete actually lands.
			onAsyncConfirm={async () => {
				if (pendingDelete) await state.deleteComment(pendingDelete)
			}}
			onError={props.onError}
		/>
	)

	if (bare) {
		return (
			<>
				{body}
				{confirmation}
			</>
		)
	}

	return (
		<section
			data-slot="comments"
			aria-label={typeof title === "string" ? title : undefined}
			className={cx("comments--component", styles.root, className)}
		>
			{title !== false && !!(title || copy.subtitle) && (
				<ContentBlock
					title={title || undefined}
					description={copy.subtitle || undefined}
					className={styles.header}
				/>
			)}
			{body}
			{confirmation}
		</section>
	)
}
