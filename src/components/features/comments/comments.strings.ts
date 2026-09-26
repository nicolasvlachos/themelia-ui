/* Keys added after 1.0.4 are optional in the type so older complete translations compile; defaults fill them. */
export interface CommentsStrings {
	/** Attribution under a quoted block — "— Ada Lovelace". The dash is part of the translatable string. */
	formatQuoteAttribution: (caption: string) => string
	title: string
	subtitle: string
	empty: string
	emptyHint: string

	/* ── Composer ─────────────────────────────────────────────────────────────── */
	composerPlaceholder: string
	composerSubmit: string
	composerSubmitting: string
	/** The submit label in edit mode — "Save changes", not "Post". */
	composerSave: string
	composerCancel: string
	invalidContent: string
	composerEditingEyebrow: string
	/** Takes the author's name, so word order is the translator's to decide. */
	formatReplyingEyebrow: (name: string) => string
	composerAttachmentLabel: string
	composerReferenceLabel: string
	/** The placeholder (and accessible name) of the reply composer; distinct so two open editors have different names. */
	replyPlaceholder?: string
	/** The same, for the editor that replaces a comment while it is being edited. */
	editPlaceholder?: string
	/** The submit label under a reply — "Post reply", so it is not a second "Reply" button. */
	composerReply?: string

	/* ── Item ─────────────────────────────────────────────────────────────────── */
	/** Accessible name of the moderation menu. */
	actionsLabel?: string
	fallbackAuthor: string
	pinned: string
	edited: string
	deleteLabel: string
	editLabel: string
	replyLabel: string
	pinLabel: string
	unpinLabel: string
	confirmDeleteTitle: string
	confirmDeleteDescription: string
	confirmDeleteLabel: string
	confirmRemoveAttachmentTitle: string
	confirmRemoveAttachmentDescription: string
	/** Takes the count, because a plural is a language's business. */
	formatShowReplies: (count: number) => string
	hideRepliesLabel: string
	/** Above an open thread longer than the preview — the replies still folded away. */
	formatShowEarlierReplies?: (count: number) => string
	/** Names a thread's list of replies after the comment it answers. */
	formatRepliesLabel?: (name: string) => string
	/** Unfolds a body clamped to its first lines. */
	seeMoreLabel?: string
	seeLessLabel?: string

	/* ── Attachments ──────────────────────────────────────────────────────────── */
	attachmentFallback: string
	attachmentRemoveLabel: string
	attachmentUploadingLabel: string
	attachmentFailedLabel: string
	attachmentRetryLabel: string
	attachmentDownloadLabel: string
	/** Unfolds the attachments past the first few. */
	formatShowMoreAttachments?: (count: number) => string
	showFewerAttachmentsLabel?: string
	/** The two refusals, as sentences built from the limit the hook reports. */
	formatTooLarge: (maximumBytes: number) => string
	formatTooMany: (maximumFiles: number) => string

	/* ── Reactions ────────────────────────────────────────────────────────────── */
	addReactionLabel: string
	/** Names the picker that opens when more than one reaction is offered. */
	reactionPickerLabel?: string
}

/** Bytes as a short, readable size. Used only by the default refusal copy. */
function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	const units = ["KB", "MB", "GB"]
	let value = bytes / 1024
	let unit = 0
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024
		unit += 1
	}
	return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}

export const defaultCommentsStrings: Required<CommentsStrings> = {
	formatQuoteAttribution: (caption) => `\u2014 ${caption}`,
	title: "Comments",
	subtitle: "",
	empty: "No comments yet.",
	emptyHint: "Start the conversation — your team will see it straight away.",

	composerPlaceholder: "Write a comment…",
	composerSubmit: "Post comment",
	composerSubmitting: "Posting…",
	composerSave: "Save changes",
	composerCancel: "Cancel",
	invalidContent: "A comment cannot be empty.",
	composerEditingEyebrow: "Editing comment",
	formatReplyingEyebrow: (name) => `Replying to ${name}`,
	composerAttachmentLabel: "Attach a file",
	composerReferenceLabel: "Mention or link",
	replyPlaceholder: "Write a reply…",
	editPlaceholder: "Edit your comment…",
	composerReply: "Post reply",

	actionsLabel: "Comment actions",
	fallbackAuthor: "Anonymous",
	pinned: "Pinned",
	edited: "edited",
	deleteLabel: "Delete",
	editLabel: "Edit",
	replyLabel: "Reply",
	pinLabel: "Pin",
	unpinLabel: "Unpin",
	confirmDeleteTitle: "Delete this comment?",
	confirmDeleteDescription: "The comment and its replies are removed for everyone. This cannot be undone.",
	confirmDeleteLabel: "Delete comment",
	confirmRemoveAttachmentTitle: "Remove this attachment?",
	confirmRemoveAttachmentDescription: "The file is detached from the comment for everyone. This cannot be undone.",
	formatShowReplies: (count) => `Show ${count} ${count === 1 ? "reply" : "replies"}`,
	hideRepliesLabel: "Hide replies",
	formatShowEarlierReplies: (count) => `Show ${count} earlier ${count === 1 ? "reply" : "replies"}`,
	formatRepliesLabel: (name) => `Replies to ${name}`,
	seeMoreLabel: "See more",
	seeLessLabel: "See less",

	attachmentFallback: "Attachment",
	attachmentRemoveLabel: "Remove attachment",
	attachmentUploadingLabel: "Uploading…",
	attachmentFailedLabel: "Upload failed",
	attachmentRetryLabel: "Retry",
	attachmentDownloadLabel: "Download",
	formatShowMoreAttachments: (count) => `Show ${count} more`,
	showFewerAttachmentsLabel: "Show fewer",
	formatTooLarge: (maximumBytes) => `Files must be under ${formatBytes(maximumBytes)}.`,
	formatTooMany: (maximumFiles) => `You can attach at most ${maximumFiles}.`,

	addReactionLabel: "Add reaction",
	reactionPickerLabel: "Choose a reaction",
}
