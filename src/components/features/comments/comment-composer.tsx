/**
 * CommentComposer — the editor, the mention picker, and the attachment tray as one form.
 *
 * New, reply and edit modes differ in the eyebrow and submit label; submit sits in a footer
 * row in all three (`inlineSubmit` moves it to the toolbar for a new comment).
 *
 * The mention list is re-derived from the body, so deleting a chip drops its mention;
 * known mentions are merged back so `href` and `data` survive.
 */
import {
	useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState,
	type FormEvent, type ReactNode, type Ref,
} from "react"
import { AtSignIcon, PaperclipIcon, SendIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Popover, PopoverTrigger } from "@/components/base/popover"
import { Spinner } from "@/components/base/spinner"
import { Stack } from "@/components/base/structure"
import { VisuallyHidden } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import {
	MentionInlineSuggestions, MentionPicker, parseMentionsFromHtml, useMentions,
} from "@/components/features/mentions"
import {
	RichTextEditor, type RichTextEditorHandle, type RichTextEditorToolbarItem,
} from "@/components/features/rich-text-editor"
import { cx } from "@/lib/cx"

import { CommentAttachmentChip } from "./comment-attachment-chip"
import { useAttachmentUpload } from "./use-attachment-upload"
import { defaultCommentsStrings } from "./comments.strings"
import type {
	CommentAttachmentRejection, CommentComposerProps, CommentFormValues,
} from "./comments.types"
import styles from "./comments.module.css"

export interface CommentComposerHandle {
	focus(): void
	clear(): void
	setBody(html: string): void
}

/** Whether there is anything but markup. `<p><br></p>` is an empty comment. */
function hasContent(html: string): boolean {
	return typeof html === "string" && html.replace(/<[^>]*>/g, "").trim().length > 0
}

/** What the draft is for: "Replying to Maria", "Editing comment". A line only; Cancel is in the footer. */
function ComposerEyebrow({ label }: { label: string }) {
	return (
		<div className={styles.eyebrow}>
			<Text tag="span" size="xs" weight="medium" type="secondary">
				{label}
			</Text>
		</div>
	)
}

export function CommentComposer<TResource extends string = string>({
	context,
	canComment = true,
	submitting = false,
	errors,
	resetKey = 0,
	onSubmit,
	onCancel,
	editingComment,
	replyingTo,
	strings,
	resources,
	onResourceSearch,
	attachments: attachmentsConfig,
	maxAttachments,
	allowAttachments = true,
	initialValues,
	autoFocus = false,
	inlineSubmit = false,
	placeholder,
	className,
	ref,
}: CommentComposerProps<TResource> & { ref?: Ref<CommentComposerHandle> }) {
	const copy = { ...defaultCommentsStrings, ...strings }

	const editor = useRef<RichTextEditorHandle>(null)
	const fileInput = useRef<HTMLInputElement>(null)
	const [body, setBody] = useState(initialValues?.content ?? "")
	const [contentError, setContentError] = useState<string | null>(null)

	const mentions = useMentions<TResource>({ resources, onResourceSearch, editorRef: editor })

	const [rejection, setRejection] = useState<CommentAttachmentRejection | null>(null)
	const upload = useAttachmentUpload({
		...attachmentsConfig,
		// The per-mount cap wins over the shared config, which is the thread's default.
		maxFiles: maxAttachments ?? attachmentsConfig?.maxFiles,
		initialAttachments: initialValues?.attachments,
		onReject: (next) => {
			setRejection(next)
			attachmentsConfig?.onReject?.(next)
		},
	})

	const isEditing = !!editingComment
	const isReplying = !isEditing && !!replyingTo

	/* Cleared on `resetKey` and when the record changes, so a draft never carries across records. */
	const clearDraft = useCallback(() => {
		editor.current?.clear()
		setBody("")
		mentions.reset()
		upload.reset()
		setContentError(null)
		setRejection(null)
		// `mentions` and `upload` are new each render; depending on them clears every keystroke.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		clearDraft()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [context.id, context.type, resetKey])

	/** Loads the comment being edited into the draft, once per comment. */
	useEffect(() => {
		if (!editingComment) return
		editor.current?.setHTML(editingComment.content ?? "")
		setBody(editingComment.content ?? "")
		mentions.setMentions(editingComment.references ?? [])
		upload.setAttachments(
			(editingComment.attachments ?? []).filter((attachment) => !!attachment),
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editingComment?.id])

	/** A server-side validation message replaces the local one. */
	useEffect(() => {
		if (errors?.content) setContentError(errors.content)
	}, [errors])

	useImperativeHandle(
		ref,
		() => ({
			focus: () => editor.current?.focus(),
			clear: clearDraft,
			setBody: (html: string) => {
				editor.current?.setHTML(html)
				setBody(html)
			},
		}),
		[clearDraft],
	)

	const handleBodyChange = useCallback(
		(html: string) => {
			setBody(html)

			/* Only when the set of ids changed, or the picker's search would restart every keystroke. */
			const parsed = parseMentionsFromHtml<TResource>(html)
			const nextIds = parsed.map((mention) => mention.id).join("|")
			mentions.setMentions((previous) => {
				if (previous.map((mention) => mention.id).join("|") === nextIds) return previous
				// Merge, so href and data survive a round trip through HTML.
				const known = new Map(previous.map((mention) => [mention.id, mention]))
				return parsed.map((mention) => known.get(mention.id) ?? mention)
			})
		},
		[mentions],
	)

	const handleSubmit = useCallback(
		(event?: FormEvent) => {
			event?.preventDefault()
			// A file still uploading has no url yet.
			if (submitting || upload.isUploading) return

			const html = editor.current?.getHTML() ?? body
			if (!hasContent(html)) {
				setContentError(copy.invalidContent)
				return
			}
			setContentError(null)

			const values: CommentFormValues<TResource> = {
				content: html,
				commentableId: context.id,
				commentableType: context.type,
				moduleKey: context.moduleKey,
				contentType: "html",
				references: mentions.mentions,
				attachments: upload.uploadedAttachments,
				replyToId: replyingTo?.commentId ?? initialValues?.replyToId,
				editingId: editingComment?.id,
			}

			void onSubmit(values)
		},
		[body, context, copy.invalidContent, editingComment?.id, initialValues?.replyToId, mentions.mentions, onSubmit, replyingTo?.commentId, submitting, upload.isUploading, upload.uploadedAttachments],
	)

	const toolbarItems = useMemo<ReadonlyArray<RichTextEditorToolbarItem>>(() => {
		const items: RichTextEditorToolbarItem[] = []
		// The picker is offered only when there is a registry to search.
		if (resources && Object.keys(resources).length > 0) {
			items.push({
				id: "reference",
				icon: AtSignIcon,
				label: copy.composerReferenceLabel,
				onClick: () => mentions.setPickerOpen(true),
			})
		}
		// And the attachment control only when there is an uploader.
		if (allowAttachments && attachmentsConfig?.onUpload && !attachmentsConfig.disabled) {
			items.push({
				id: "attachment",
				icon: PaperclipIcon,
				label: copy.composerAttachmentLabel,
				onClick: () => fileInput.current?.click(),
			})
		}
		return items
	}, [allowAttachments, attachmentsConfig?.disabled, attachmentsConfig?.onUpload, copy.composerAttachmentLabel, copy.composerReferenceLabel, mentions, resources])

	if (!canComment) return null

	const submitLabel = submitting
		? copy.composerSubmitting
		: isEditing
			? copy.composerSave
			: isReplying
				? copy.composerReply
				: copy.composerSubmit

	const submitButton = (
		<Button type="button" onClick={() => handleSubmit()} disabled={submitting || upload.isUploading}>
			{submitting ? <Spinner /> : <SendIcon />}
			{submitLabel}
		</Button>
	)

	/* Footer row unless `inlineSubmit` on a new comment; reply and edit always need Cancel beside submit. */
	const footerRow = inlineSubmit === false || isEditing || isReplying

	const rejectionMessage = rejection
		? rejection.code === "too-large"
			? copy.formatTooLarge(rejection.limit)
			: copy.formatTooMany(rejection.limit)
		: null

	const eyebrow: ReactNode = isEditing ? (
		<ComposerEyebrow label={copy.composerEditingEyebrow} />
	) : isReplying ? (
		<ComposerEyebrow label={copy.formatReplyingEyebrow(replyingTo.authorName ?? copy.fallbackAuthor)} />
	) : null

	return (
		<form onSubmit={handleSubmit} className={cx("comment-composer--component", styles.composer, className)}>
			{eyebrow}

			<input
				ref={fileInput}
				type="file"
				multiple
				hidden
				accept={attachmentsConfig?.accept}
				onChange={(event) => {
					if (event.target.files) upload.addFiles(event.target.files)
					// Cleared, so picking the same file twice fires change twice.
					event.target.value = ""
				}}
			/>

			{/* The toolbar button opens the picker by state; the popover anchors to a hidden, untabbable trigger. */}
			{!mentions.triggerActive && (
				<Popover open={mentions.pickerOpen} onOpenChange={mentions.setPickerOpen}>
					{/* A hidden real <button>: Base UI renders the outer element as the trigger. */}
					<PopoverTrigger
						render={<VisuallyHidden render={<button type="button" tabIndex={-1} aria-hidden />} />}
					/>
					<MentionPicker
						open={mentions.pickerOpen}
						activeKind={mentions.activeKind}
						setActiveKind={mentions.setActiveKind}
						kinds={mentions.kinds}
						resources={resources}
						suggestionsByKind={mentions.suggestionsByKind}
						query={mentions.query}
						setQuery={mentions.setQuery}
						suggestions={mentions.suggestions}
						loading={mentions.isLoading}
						onSelect={mentions.pickSuggestion}
					/>
				</Popover>
			)}

			<div className={styles.composerEditor}>
				<RichTextEditor
					ref={editor}
					compact
					value={body}
					onValueChange={handleBodyChange}
					placeholder={placeholder ?? copy.composerPlaceholder}
					strings={{ editorLabel: placeholder ?? copy.composerPlaceholder }}
					autoFocus={autoFocus || isEditing || isReplying}
					hideSourceToggle
					extraToolbarItems={toolbarItems}
					toolbarTrailing={footerRow ? undefined : submitButton}
					footerSlot={
						upload.attachments.length > 0 ? (
							<Stack direction="horizontal" wrap align="center" gap="sm">
								{upload.attachments.map((attachment) => (
									<CommentAttachmentChip
										key={attachment.id}
										attachment={attachment}
										editable
										onRemove={upload.removeAttachment}
										onRetry={upload.retryAttachment}
										strings={strings}
									/>
								))}
							</Stack>
						) : undefined
					}
					onCaretChange={mentions.handleCaretChange}
				/>

				<MentionInlineSuggestions
					onDismiss={() => mentions.setPickerOpen(false)}
					open={mentions.triggerActive && mentions.pickerOpen}
					activeKind={mentions.activeKind}
					setActiveKind={mentions.setActiveKind}
					onManualKindChange={() => mentions.setManualKindOverride(true)}
					kinds={mentions.kinds}
					resources={resources}
					query={mentions.query}
					suggestions={mentions.suggestions}
					suggestionsByKind={mentions.suggestionsByKind}
					loading={mentions.isLoading}
					onSelect={mentions.pickSuggestion}
				/>
			</div>

			{!!contentError && (
				<Text size="xs" type="error" role="alert" aria-live="polite">
					{contentError}
				</Text>
			)}
			{!!rejectionMessage && (
				<Text size="xs" type="error" role="alert" aria-live="polite">
					{rejectionMessage}
				</Text>
			)}

			{footerRow && (
				<Stack direction="horizontal" align="center" justify="end" gap="md">
					{!!onCancel && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onCancel} disabled={submitting}>
							{copy.composerCancel}
						</Button>
					)}
					{submitButton}
				</Stack>
			)}
		</form>
	)
}
