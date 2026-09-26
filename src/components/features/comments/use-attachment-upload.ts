/**
 * useAttachmentUpload — the files staged on a draft, and their uploads.
 * - Removing a chip mid-upload aborts its request.
 * - Failed uploads are retryable: the original `File` is cached by attachment id.
 * - Over-limit files are refused before upload, with a code and the limit (never a sentence).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type {
	CommentAttachment, CommentAttachmentRejection, CommentsAttachmentsConfig,
} from "./comments.types"

export interface UseAttachmentUploadOptions extends CommentsAttachmentsConfig {
	/** Files already on the record, when editing a posted comment. */
	initialAttachments?: ReadonlyArray<CommentAttachment>
	onValueChange?: (attachments: ReadonlyArray<CommentAttachment>) => void
}

export interface UseAttachmentUploadReturn {
	/** Everything staged — uploading, uploaded, and failed. */
	attachments: ReadonlyArray<CommentAttachment>
	/** The subset safe to submit. */
	uploadedAttachments: ReadonlyArray<CommentAttachment>
	isUploading: boolean
	addFiles: (files: ReadonlyArray<File> | FileList) => void
	removeAttachment: (id: string) => void
	retryAttachment: (id: string) => void
	setAttachments: (attachments: ReadonlyArray<CommentAttachment>) => void
	reset: () => void
}

/** A local id for a file that has no server id yet. */
function draftId() {
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `attachment-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useAttachmentUpload(
	options: UseAttachmentUploadOptions = {},
): UseAttachmentUploadReturn {
	const { onUpload, maxSize, maxFiles, disabled, initialAttachments, onValueChange, onReject } =
		options

	const [attachments, setAttachmentsState] = useState<CommentAttachment[]>(
		() => (initialAttachments ? [...initialAttachments] : []),
	)
	const attachmentsRef = useRef(attachments)

	/** In-flight controllers, so a removal can abort the right one. */
	const inFlight = useRef(new Map<string, AbortController>())
	/** The original files, so a failure is retryable. */
	const files = useRef(new Map<string, File>())

	const onValueChangeRef = useRef(onValueChange)
	const onRejectRef = useRef(onReject)
	useEffect(() => {
		onValueChangeRef.current = onValueChange
		onRejectRef.current = onReject
	})

	const replaceAttachments = useCallback((next: CommentAttachment[]) => {
		attachmentsRef.current = next
		setAttachmentsState(next)
	}, [])

	const patch = useCallback((id: string, changes: Partial<CommentAttachment>) => {
		replaceAttachments(
			attachmentsRef.current.map((attachment) =>
				attachment.id === id ? { ...attachment, ...changes } : attachment,
			),
		)
	}, [replaceAttachments])

	const setAttachments = useCallback(
		(next: ReadonlyArray<CommentAttachment>) => replaceAttachments([...next]),
		[replaceAttachments],
	)

	const beginUpload = useCallback(
		(id: string, file: File) => {
			if (!onUpload || inFlight.current.has(id)) return

			const controller = new AbortController()
			inFlight.current.set(id, controller)
			patch(id, { status: "uploading", progress: 0, error: undefined })

			onUpload({
				file,
				onProgress: (progress) => patch(id, { progress }),
				signal: controller.signal,
			})
				.then((uploaded) => {
					inFlight.current.delete(id)
					/* Keep the local id: the chip is keyed by it, and a changed key would remount (flash) on completion. */
					patch(id, { ...uploaded, id, status: "uploaded", progress: 100, error: undefined })
				})
				.catch((error: unknown) => {
					inFlight.current.delete(id)
					// The writer removed the chip. That is not a failure to report back to them.
					if (controller.signal.aborted) return
					patch(id, {
						status: "failed",
						error: error instanceof Error ? error.message : undefined,
					})
				})
		},
		[onUpload, patch],
	)

	const addFiles = useCallback(
		(input: ReadonlyArray<File> | FileList) => {
			if (disabled || !onUpload) return
			const incoming = Array.from(input)
			if (incoming.length === 0) return

			const next = [...attachmentsRef.current]
			const reject = (rejection: CommentAttachmentRejection) => onRejectRef.current?.(rejection)

			for (const file of incoming) {
				if (typeof maxFiles === "number" && next.length >= maxFiles) {
					// The count is full: every remaining file is refused for the same reason.
					reject({ code: "too-many", file, limit: maxFiles })
					break
				}
				if (typeof maxSize === "number" && file.size > maxSize) {
					// One oversized file does not stop the rest.
					reject({ code: "too-large", file, limit: maxSize })
					continue
				}

				const id = draftId()
				files.current.set(id, file)
				next.push({
					id,
					name: file.name,
					size: file.size,
					mimeType: file.type,
					status: "uploading",
					progress: 0,
				})
			}
			replaceAttachments(next)
		},
		[disabled, maxFiles, maxSize, onUpload, replaceAttachments],
	)

	/* Uploads start from committed state (updaters may run twice in Strict Mode); the in-flight map makes it idempotent. */
	useEffect(() => {
		for (const attachment of attachments) {
			if (attachment.status !== "uploading" || inFlight.current.has(attachment.id)) continue
			const file = files.current.get(attachment.id)
			if (file) beginUpload(attachment.id, file)
		}
	}, [attachments, beginUpload])

	const removeAttachment = useCallback((id: string) => {
		inFlight.current.get(id)?.abort()
		inFlight.current.delete(id)
		files.current.delete(id)
		replaceAttachments(attachmentsRef.current.filter((attachment) => attachment.id !== id))
	}, [replaceAttachments])

	const retryAttachment = useCallback(
		(id: string) => {
			const file = files.current.get(id)
			// Nothing to retry: this attachment arrived from the server, not from a picker.
			if (!file) return
			beginUpload(id, file)
		},
		[beginUpload],
	)

	const reset = useCallback(() => {
		for (const controller of inFlight.current.values()) controller.abort()
		inFlight.current.clear()
		files.current.clear()
		replaceAttachments([])
	}, [replaceAttachments])

	useEffect(() => {
		onValueChangeRef.current?.(attachments)
	}, [attachments])

	/** Unmounting mid-upload aborts. A composer that closed has nowhere to put the result. */
	useEffect(() => {
		const pending = inFlight.current
		return () => {
			for (const controller of pending.values()) controller.abort()
		}
	}, [])

	const uploadedAttachments = useMemo(
		// No status at all means it came from the server already uploaded.
		() => attachments.filter((attachment) => attachment.status === "uploaded" || !attachment.status),
		[attachments],
	)

	const isUploading = useMemo(
		() => attachments.some((attachment) => attachment.status === "uploading"),
		[attachments],
	)

	return {
		attachments,
		uploadedAttachments,
		isUploading,
		addFiles,
		removeAttachment,
		retryAttachment,
		setAttachments,
		reset,
	}
}
