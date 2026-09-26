/**
 * useComments — the thread's state machine, with no UI attached. The mode is one union
 * (idle | replying | editing), not three booleans.
 *
 * A submit does not clear the composer by itself: the consumer calls `helpers.reset()`,
 * since a resolved promise may still carry validation errors.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type {
	CommentData, CommentFormValues, CommentSubmitHelpers, CommentUser, CommentsConfig,
} from "./comments.types"

export type ComposerMode<
	TResource extends string = string,
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
> =
	| { kind: "idle" }
	| { kind: "editing"; comment: CommentData<TUser, TMeta, TResource> }
	| { kind: "replying"; commentId: string; authorName?: string }

export interface UseCommentsOptions<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> {
	onSubmit?: CommentsConfig<TUser, TMeta, TResource>["onSubmit"]
	onUpdate?: CommentsConfig<TUser, TMeta, TResource>["onUpdate"]
	onDelete?: CommentsConfig<TUser, TMeta, TResource>["onDelete"]
	onAfterMutate?: CommentsConfig<TUser, TMeta, TResource>["onAfterMutate"]
	onError?: CommentsConfig<TUser, TMeta, TResource>["onError"]
	/** Invalidates submission-bound helpers when the composer moves to another record. */
	scopeKey?: string
}

export interface UseCommentsReturn<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
> {
	composerMode: ComposerMode<TResource, TUser, TMeta>
	isSubmitting: boolean
	formErrors: Record<string, string>
	/** Bumped to clear the composer, which is otherwise uncontrolled. */
	resetKey: number

	startReply: (comment: CommentData<TUser, TMeta, TResource>) => void
	startEdit: (comment: CommentData<TUser, TMeta, TResource>) => void
	cancelComposerMode: () => void

	submit: (values: CommentFormValues<TResource>) => Promise<void>
	deleteComment: (id: string) => Promise<void>

	resetComposer: () => void
	/** Passed to `onSubmit` and `onUpdate`. */
	helpers: CommentSubmitHelpers
}

export function useComments<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
>(
	options: UseCommentsOptions<TUser, TMeta, TResource> = {},
): UseCommentsReturn<TUser, TMeta, TResource> {
	const { onSubmit, onUpdate, onDelete, onAfterMutate, onError, scopeKey } = options

	const [composerMode, setComposerMode] = useState<ComposerMode<TResource, TUser, TMeta>>({
		kind: "idle",
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formErrors, setFormErrors] = useState<Record<string, string>>({})
	const [resetKey, setResetKey] = useState(0)

	/* A ref beside the state: the double-submit guard must be read synchronously, before a re-render. */
	const submittingRef = useRef(false)
	const scopeRef = useRef(scopeKey)
	const generationRef = useRef(0)
	const activeSubmissionRef = useRef(0)

	const setSubmitting = useCallback((submitting: boolean) => {
		submittingRef.current = submitting
		setIsSubmitting(submitting)
	}, [])

	const resetComposer = useCallback(() => {
		setResetKey((key) => key + 1)
		setComposerMode({ kind: "idle" })
		setFormErrors({})
	}, [])

	const helpers = useMemo<CommentSubmitHelpers>(
		() => ({ setErrors: setFormErrors, reset: resetComposer, setSubmitting }),
		[resetComposer, setSubmitting],
	)

	useEffect(() => {
		if (scopeRef.current === scopeKey) return
		scopeRef.current = scopeKey
		generationRef.current += 1
		activeSubmissionRef.current += 1
		submittingRef.current = false
		setIsSubmitting(false)
		resetComposer()
	}, [resetComposer, scopeKey])

	/** A failing error handler must not take the mutation down with it. */
	const reportError = useCallback(
		(error: unknown) => {
			try {
				onError?.(error)
			} catch {
				/* The consumer's reporter threw. There is nothing left to report it to. */
			}
		},
		[onError],
	)

	const startReply = useCallback((comment: CommentData<TUser, TMeta, TResource>) => {
		if (!comment.id) return
		setFormErrors({})
		setComposerMode({ kind: "replying", commentId: comment.id, authorName: comment.user?.name })
	}, [])

	const startEdit = useCallback((comment: CommentData<TUser, TMeta, TResource>) => {
		if (!comment.id) return
		setFormErrors({})
		setComposerMode({ kind: "editing", comment })
	}, [])

	const cancelComposerMode = useCallback(() => resetComposer(), [resetComposer])

	const submit = useCallback(
		async (values: CommentFormValues<TResource>) => {
			if (submittingRef.current) return
			const generation = generationRef.current
			const submission = activeSubmissionRef.current + 1
			activeSubmissionRef.current = submission
			const isCurrent = () =>
				generationRef.current === generation && activeSubmissionRef.current === submission
			const submissionHelpers: CommentSubmitHelpers = {
				setErrors: (errors) => {
					if (isCurrent()) setFormErrors(errors)
				},
				reset: () => {
					if (isCurrent()) resetComposer()
				},
				setSubmitting: (submitting) => {
					if (isCurrent()) setSubmitting(submitting)
				},
			}

			const editing = composerMode.kind === "editing" ? composerMode.comment : null
			const handler = editing ? onUpdate : onSubmit
			if (!handler) return

			// The mode decides which id rides along; the composer never has to know.
			const payload: CommentFormValues<TResource> = editing
				? { ...values, editingId: editing.id }
				: composerMode.kind === "replying"
					? { ...values, replyToId: composerMode.commentId }
					: values

			setSubmitting(true)
			setFormErrors({})
			try {
				if (editing && onUpdate) await onUpdate(editing.id!, payload, submissionHelpers)
				else if (onSubmit) await onSubmit(payload, submissionHelpers)
				onAfterMutate?.(editing ? "update" : "create", payload)
			} catch (error) {
				reportError(error)
			} finally {
				if (isCurrent()) setSubmitting(false)
			}
		},
		[composerMode, onAfterMutate, onSubmit, onUpdate, reportError, resetComposer, setSubmitting],
	)

	const deleteComment = useCallback(
		async (id: string) => {
			if (!onDelete || !id) return
			try {
				await onDelete(id)
				onAfterMutate?.("delete", { commentId: id })
			} catch (error) {
				reportError(error)
			}
		},
		[onAfterMutate, onDelete, reportError],
	)

	return {
		composerMode,
		isSubmitting,
		formErrors,
		resetKey,
		startReply,
		startEdit,
		cancelComposerMode,
		submit,
		deleteComment,
		resetComposer,
		helpers,
	}
}
