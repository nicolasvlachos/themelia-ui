/**
 * CommentItem — one comment. Anatomy: gutter (avatar + thread rail), bubble (author, time,
 * body), extras (attachments, tags), actions (reactions, reply; the rest in ⋯), thread
 * (replies toggle, replies, inline composer). Replies hang off a rail that forks from the
 * parent's avatar rather than an indent.
 *
 * Long bodies, reply lists and attachment piles fold; each fold control appears only when
 * something is actually hidden.
 */
import {
	cloneElement, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef,
	useState, type ComponentProps, type Ref,
} from "react"
import {
	MoreHorizontalIcon, PencilIcon, PinIcon, SmilePlusIcon, Trash2Icon,
} from "lucide-react"
import { format as formatDate } from "date-fns"

import { ActionMenu, resolveContextActions, type ActionDefinition } from "@/components/base/action-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/base/tooltip"
import { Text, TextLink } from "@/components/base/typography"
import { ConfirmDialog, useOverlayVisibility } from "@/components/features/overlays"
import {
	InlineList, Number as NumberValue, RelativeTime, formatInitials, parseDateInput,
} from "@/components/primitives"
import { useDatesConfig } from "@/lib/ui-provider"
import { cx } from "@/lib/cx"

import { CommentAttachmentChip } from "./comment-attachment-chip"
import {
	CommentDepthContext, CommentInlineComposerContext, CommentThreadContext,
} from "./comment-thread-context"
import { CommentContent } from "./comment-content"
import { defaultCommentsStrings, type CommentsStrings } from "./comments.strings"
import type {
	CommentAttachment, CommentData, CommentItemProps, CommentReaction, CommentUser,
} from "./comments.types"
import styles from "./comments.module.css"

/** `active` is the absence of a state, so it is not worth a chip. */
const IMPLICIT_STATUS = "active"

/** Lines past the clamp a body may run without folding. */
const CLAMP_SLACK = 2

/** One choice reacts immediately, without a picker. */
const DEFAULT_REACTION_CHOICES: readonly string[] = ["👍"]

/** Turns `pending_review` into `Pending review`. Replaced by `getStatusLabel`. */
function defaultStatusLabel(status: string) {
	const spaced = status.replace(/_/g, " ")
	return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** The absolute moment behind a relative one, for the title a pointer can reveal. */
function useAbsoluteTime(value: string | undefined) {
	const { format, locale } = useDatesConfig()
	const date = parseDateInput(value)
	return date ? { iso: date.toISOString(), label: formatDate(date, `${format} HH:mm`, { locale }) } : null
}

/** A text-weight button (TextLink rendered as a button) for reply, "See more" and thread toggles. */
function QuietButton({
	children,
	className,
	buttonRef,
	...props
}: Omit<ComponentProps<"button">, "ref"> & { buttonRef?: Ref<HTMLButtonElement> }) {
	return (
		<TextLink
			render={<button type="button" ref={buttonRef} />}
			variant="subtle"
			data-hit-area
			className={cx(styles.quietAction, className)}
			{...(props as ComponentProps<typeof TextLink>)}
		>
			{/* Medium, matching the other quiet words around a comment. */}
			<Text tag="span" size="xs" weight="medium" type="inherit">
				{children}
			</Text>
		</TextLink>
	)
}

/** "Add reaction": one choice reacts at once; several open a picker that marks (and toggles) the reader's own. */
function ReactionAdd({
	choices,
	reactions,
	onPick,
	copy,
}: {
	choices: readonly string[]
	reactions: ReadonlyArray<CommentReaction>
	onPick: (emoji: string) => void
	copy: CommentsStrings
}) {
	const [open, setOpen] = useState(false)
	const single = choices.length <= 1

	if (single) {
		const [choice = DEFAULT_REACTION_CHOICES[0]!] = choices
		return (
			<button
				type="button"
				aria-label={copy.addReactionLabel}
				title={copy.addReactionLabel}
				onClick={() => onPick(choice)}
				className={styles.reactionAdd}
			>
				<SmilePlusIcon aria-hidden />
			</button>
		)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<button
						type="button"
						aria-label={copy.addReactionLabel}
						title={copy.addReactionLabel}
						className={styles.reactionAdd}
					/>
				}
			>
				<SmilePlusIcon aria-hidden />
			</PopoverTrigger>
			<PopoverContent
				width="auto"
				side="top"
				align="start"
				inset="flush"
				aria-label={copy.reactionPickerLabel}
				className={styles.reactionPicker}
			>
				{choices.map((emoji) => {
					const mine = reactions.some((reaction) => reaction.emoji === emoji && reaction.mine)
					return (
						<button
							key={emoji}
							type="button"
							aria-pressed={mine}
							data-mine={mine || undefined}
							onClick={() => {
								onPick(emoji)
								setOpen(false)
							}}
							className={styles.reactionChoice}
						>
							{emoji}
						</button>
					)
				})}
			</PopoverContent>
		</Popover>
	)
}

export function CommentItem<
	TUser extends CommentUser = CommentUser,
	TMeta = unknown,
	TResource extends string = string,
>({
	comment,
	replies: suppliedReplies,
	canModerate,
	onDelete,
	onAttachmentRemove,
	onEdit,
	onPinToggle,
	onReact,
	onReply,
	allowReactions = true,
	allowReplies = true,
	commentActions,
	maxVisibleReplies = 3,
	clampLines = 6,
	maxVisibleAttachments = 3,
	reactionChoices = DEFAULT_REACTION_CHOICES,
	sanitizer,
	strings,
	getMediaUrl,
	getMediaName,
	getStatusLabel,
	resources,
	renderAttachment,
	renderReference,
	className,
}: CommentItemProps<TUser, TMeta, TResource>) {
	const copy = { ...defaultCommentsStrings, ...strings }
	const depth = useContext(CommentDepthContext)
	const inline = useContext(CommentInlineComposerContext)
	const replyLookup = useContext(CommentThreadContext)
	const replies = allowReplies
		? (suppliedReplies ??
			(replyLookup.get(comment.id ?? "") as readonly CommentData<TUser, TMeta, TResource>[] | undefined) ??
			[])
		: []

	const authorName = comment.user?.name ?? copy.fallbackAuthor
	const statusLabel =
		comment.status && comment.status !== IMPLICIT_STATUS
			? (getStatusLabel?.(comment.status) ?? defaultStatusLabel(comment.status))
			: null
	const created = useAbsoluteTime(comment.createdAt)
	const updated = useAbsoluteTime(comment.updatedAt)

	/* `??`, not `||`: a comment's explicit `false` must beat the thread's `canModerate`. */
	const canDelete = comment.canDelete ?? canModerate === true
	const canEdit = comment.canEdit ?? canModerate === true

	const tags = useMemo(() => {
		const source = comment.tagsArray
		if (Array.isArray(source)) return source.filter((tag): tag is string => typeof tag === "string")
		if (source && typeof source === "object") {
			return Object.values(source).filter((tag): tag is string => typeof tag === "string")
		}
		return []
	}, [comment.tagsArray])

	/** A sparse array from an API is normal; a null attachment is not renderable. */
	const attachments = useMemo(
		() =>
			(comment.attachments ?? []).filter(
				(attachment): attachment is CommentAttachment => !!attachment && typeof attachment === "object",
			),
		[comment.attachments],
	)

	const reactions = allowReactions ? (comment.reactions ?? []) : []

	/* Detaching is irreversible, so it confirms first; one dialog serves every chip, so the id is held. */
	const attachmentConfirm = useOverlayVisibility()
	const [pendingAttachment, setPendingAttachment] = useState<string | null>(null)
	const requestRemoval = useCallback(
		(attachmentId: string) => {
			setPendingAttachment(attachmentId)
			attachmentConfirm.show()
		},
		[attachmentConfirm],
	)

	/* ── The inline composer, when `Comments` has opened one on this comment ─────────── */

	const isReplyTarget = !!comment.id && !!inline.composer && inline.replyingToId === comment.id
	const isEditTarget = !!comment.id && !!inline.composer && inline.editingId === comment.id

	/* ── Replies ─────────────────────────────────────────────────────────────────────── */

	const replyCount = replies.length
	const [repliesOpen, setRepliesOpen] = useState(false)
	const [earlierShown, setEarlierShown] = useState(false)

	/* Replying to a folded thread opens it — during render, so thread and composer appear in one frame. */
	const [wasReplyTarget, setWasReplyTarget] = useState(isReplyTarget)
	if (wasReplyTarget !== isReplyTarget) {
		setWasReplyTarget(isReplyTarget)
		if (isReplyTarget && replyCount > 0) setRepliesOpen(true)
	}

	const replyLimit = maxVisibleReplies > 0 && !earlierShown ? maxVisibleReplies : replyCount
	const hiddenReplies = repliesOpen ? Math.max(0, replyCount - replyLimit) : 0
	const shownReplies = repliesOpen ? replies.slice(hiddenReplies) : []
	const repliesId = useId()

	const threadComposer = isReplyTarget ? inline.composer : null
	const lastEntry = threadComposer
		? "composer"
		: shownReplies.length > 0
			? "reply"
			: hiddenReplies > 0
				? "earlier"
				: "toggle"
	const hasThread = replyCount > 0 || !!threadComposer

	/* ── The body clamp ─────────────────────────────────────────────────────────────── */

	const contentRef = useRef<HTMLDivElement>(null)
	const contentId = useId()
	const [bodyExpanded, setBodyExpanded] = useState(false)
	const [bodyOverflows, setBodyOverflows] = useState(false)
	const clamps = clampLines > 0
	const folded = clamps && bodyOverflows && !bodyExpanded

	/*
	 * Measured (and re-measured on resize) via `scrollHeight`, which is unaffected by the clamp
	 * itself. Folds only when more than CLAMP_SLACK lines would be hidden.
	 */
	useLayoutEffect(() => {
		const element = contentRef.current
		if (!element || !clamps) {
			setBodyOverflows(false)
			return
		}
		const measure = () => {
			const style = getComputedStyle(element)
			const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5
			if (!line) return
			setBodyOverflows(element.scrollHeight > (clampLines + CLAMP_SLACK) * line + 1)
		}
		measure()
		if (typeof ResizeObserver === "undefined") return
		const observer = new ResizeObserver(measure)
		observer.observe(element)
		if (element.firstElementChild) observer.observe(element.firstElementChild)
		return () => observer.disconnect()
	}, [clamps, clampLines, comment.content, isEditTarget])

	/* ── Attachments ───────────────────────────────────────────────────────────────── */

	const [allAttachments, setAllAttachments] = useState(false)
	/* Folds only when at least two files would be hidden. */
	const foldsAttachments = maxVisibleAttachments > 0 && attachments.length > maxVisibleAttachments + 1
	const shownAttachments = foldsAttachments && !allAttachments ? attachments.slice(0, maxVisibleAttachments) : attachments
	const hiddenAttachments = attachments.length - shownAttachments.length

	/* ── Focus comes back to where the reader left ────────────────────────────────────── */

	const replyButton = useRef<HTMLButtonElement>(null)
	const menuSlot = useRef<HTMLDivElement>(null)
	const wasReplying = useRef(false)
	const wasEditing = useRef(false)

	/* Closing a composer drops focus to <body>; restore it to the opener, only if focus was actually lost. */
	useEffect(() => {
		const lost = !document.activeElement || document.activeElement === document.body
		if (wasReplying.current && !isReplyTarget && lost) replyButton.current?.focus()
		if (wasEditing.current && !isEditTarget && lost) menuSlot.current?.querySelector("button")?.focus()
		wasReplying.current = isReplyTarget
		wasEditing.current = isEditTarget
	}, [isEditTarget, isReplyTarget])

	/* ── The overflow menu ─────────────────────────────────────────────────────────── */

	const menuActions: ActionDefinition[] = [
		{
			id: "pin",
			label: comment.isPinned ? copy.unpinLabel : copy.pinLabel,
			icon: PinIcon,
			visible: !!onPinToggle && canModerate === true,
			onClick: () => onPinToggle?.(comment),
		},
		{
			id: "edit",
			label: copy.editLabel,
			icon: PencilIcon,
			visible: canEdit && !!onEdit && !!comment.id,
			onClick: () => onEdit?.(comment),
		},
		...resolveContextActions(commentActions, comment),
		{
			id: "delete",
			label: copy.deleteLabel,
			icon: Trash2Icon,
			tone: "destructive",
			visible: canDelete && !!onDelete && !!comment.id,
			onClick: () => onDelete?.(comment.id!),
		},
	]

	const canReact = allowReactions && !!onReact && !!comment.id
	const canReply = allowReplies && !!onReply && !!comment.id
	const hasActionRow = reactions.length > 0 || canReact || canReply

	const replyProps = {
		canModerate, onDelete, onAttachmentRemove, onEdit, onPinToggle, onReact, onReply,
		allowReactions, allowReplies, commentActions, maxVisibleReplies, clampLines,
		maxVisibleAttachments, reactionChoices, sanitizer, strings, getMediaUrl, getMediaName,
		getStatusLabel, resources, renderAttachment, renderReference,
	}

	const authorId = `${contentId}-author`

	return (
		<article
			data-slot="comment"
			data-comment-id={comment.id}
			data-depth={depth}
			data-pinned={comment.isPinned || undefined}
			data-status={statusLabel ? comment.status : undefined}
			data-thread={hasThread || undefined}
			data-editing={isEditTarget || undefined}
			aria-labelledby={authorId}
			className={cx("comment-item--component", styles.item, className)}
		>
			{/* Above the bubble: a state of the comment, not its content. */}
			{comment.isPinned && (
				<div className={styles.itemContext}>
					<PinIcon aria-hidden className={styles.itemContextIcon} />
					<Text tag="span" size="xs" weight="medium" type="secondary">
						{copy.pinned}
					</Text>
				</div>
			)}

			<div className={styles.itemGutter}>
				<Avatar aria-hidden size={depth > 0 ? "sm" : "default"}>
					{!!comment.user?.avatar && <AvatarImage src={comment.user.avatar} alt={authorName} />}
					<AvatarFallback>{formatInitials(authorName)}</AvatarFallback>
				</Avatar>
			</div>

			<div className={styles.itemMain}>
				{/* Edited in place. */}
				{isEditTarget ? (
					<>
						<Text tag="span" id={authorId} weight="semibold" className={styles.itemEditingAuthor}>
							{authorName}
						</Text>
						{inline.composer}
					</>
				) : (
					<>
						<div className={styles.itemBubbleRow}>
							<div className={styles.itemBubble}>
								<div className={styles.itemHeader}>
									<Text tag="span" id={authorId} weight="semibold" className={styles.itemAuthor}>
										{authorName}
									</Text>
									{/* Outlined: a soft neutral badge would be grey on the grey bubble. */}
									{!!statusLabel && <Badge tone="neutral" variant="outline">{statusLabel}</Badge>}
									{(created || comment.isEdited) && (
										<span className={styles.itemMeta}>
											{created && (
												<time dateTime={created.iso} className={styles.itemTime}>
													<RelativeTime
														value={comment.createdAt}
														size="xs"
														type="secondary"
														title={created.label}
													/>
												</time>
											)}
											{comment.isEdited && (
												<Text
													tag="span"
													size="xs"
													type="secondary"
													title={updated?.label}
													className={styles.itemEdited}
												>
													{copy.edited}
												</Text>
											)}
										</span>
									)}
								</div>

								<div
									ref={contentRef}
									id={contentId}
									data-clamped={folded || undefined}
									style={folded ? { maxHeight: `${clampLines}lh` } : undefined}
									className={styles.itemContent}
								>
									<CommentContent
										comment={comment}
										resources={resources}
										renderReference={renderReference}
										sanitizer={sanitizer}
										strings={strings}
									/>
								</div>

								{clamps && bodyOverflows && (
									<QuietButton
										aria-expanded={bodyExpanded}
										aria-controls={contentId}
										onClick={() => setBodyExpanded((expanded) => !expanded)}
										className={styles.itemMore}
									>
										{bodyExpanded ? copy.seeLessLabel : copy.seeMoreLabel}
									</QuietButton>
								)}
							</div>

							<div ref={menuSlot} className={styles.itemMenu}>
								<ActionMenu
									icon={MoreHorizontalIcon}
									strings={{ trigger: copy.actionsLabel }}
									actions={menuActions}
								/>
							</div>
						</div>

						{/* One row for files, then tags. */}
						{(attachments.length > 0 || tags.length > 0) && (
							<div className={styles.itemChips}>
								{shownAttachments.map((attachment) => {
									if (renderAttachment) {
										return (
											<div key={attachment.id ?? attachment.name}>{renderAttachment(attachment)}</div>
										)
									}
									// The control appears only when there is a callback AND the right.
									const removable = !!onAttachmentRemove && !!attachment.id && canDelete
									return (
										<CommentAttachmentChip
											key={attachment.id ?? attachment.name}
											attachment={attachment}
											editable={removable}
											onRemove={removable ? () => requestRemoval(attachment.id) : undefined}
											accessors={{ getMediaUrl, getMediaName }}
											strings={strings}
										/>
									)
								})}
								{tags.map((tag) => (
									<Badge key={tag} tone="neutral" variant="outline">
										{tag}
									</Badge>
								))}
								{foldsAttachments && (
									<QuietButton
										aria-expanded={allAttachments}
										onClick={() => setAllAttachments((all) => !all)}
									>
										{allAttachments ? copy.showFewerAttachmentsLabel : copy.formatShowMoreAttachments(hiddenAttachments)}
									</QuietButton>
								)}
							</div>
						)}

						{hasActionRow && (
							<div className={styles.itemActions}>
								{reactions.map((reaction) => {
									const chip = (
										<button
											type="button"
											data-mine={reaction.mine || undefined}
											disabled={!canReact}
											aria-pressed={reaction.mine === true}
											onClick={() => comment.id && onReact?.(comment.id, reaction.emoji)}
											// A disabled button hears no pointer, so a read-only chip keeps the title.
											title={canReact ? undefined : reaction.users?.join(", ")}
											className={styles.reaction}
										/>
									)
									/* The visible emoji and localized count form the accessible name. */
									const face = (
										<>
											<span className={styles.reactionEmoji}>{reaction.emoji}</span>{" "}
											<NumberValue value={reaction.count} size="xs" type="inherit" />
										</>
									)
									/* A tooltip (not a title) so keyboard and touch readers get the locale-formatted reactor list. */
									return canReact && !!reaction.users?.length ? (
										<Tooltip key={reaction.emoji}>
											<TooltipTrigger render={chip}>{face}</TooltipTrigger>
											<TooltipContent>
												<InlineList items={reaction.users} max={10} size="xs" type="inherit" />
											</TooltipContent>
										</Tooltip>
									) : (
										cloneElement(chip, { key: reaction.emoji }, face)
									)
								})}
								{canReact && (
									<ReactionAdd
										choices={reactionChoices}
										reactions={reactions}
										onPick={(emoji) => onReact(comment.id!, emoji)}
										copy={copy}
									/>
								)}
								{canReply && (
									<QuietButton
										buttonRef={replyButton}
										onClick={() => onReply(comment.id!)}
										className={styles.itemReply}
									>
										{copy.replyLabel}
									</QuietButton>
								)}
							</div>
						)}
					</>
				)}
			</div>

			{hasThread && (
				<div className={styles.itemThread}>
					{replyCount > 0 && (
						<div className={styles.threadEntry} data-entry="toggle" data-last={lastEntry === "toggle" || undefined}>
							<QuietButton
								aria-expanded={repliesOpen}
								aria-controls={repliesOpen ? repliesId : undefined}
								onClick={() => {
									setRepliesOpen((open) => !open)
									setEarlierShown(false)
								}}
								className={styles.repliesToggle}
							>
								{repliesOpen ? copy.hideRepliesLabel : copy.formatShowReplies(replyCount)}
							</QuietButton>
						</div>
					)}

					{hiddenReplies > 0 && (
						<div className={styles.threadEntry} data-entry="toggle" data-last={lastEntry === "earlier" || undefined}>
							<QuietButton aria-controls={repliesId} onClick={() => setEarlierShown(true)} className={styles.repliesToggle}>
								{copy.formatShowEarlierReplies(hiddenReplies)}
							</QuietButton>
						</div>
					)}

					{shownReplies.length > 0 && (
						<ul
							id={repliesId}
							role="list"
							aria-label={copy.formatRepliesLabel(authorName)}
							className={styles.replies}
						>
							<CommentDepthContext.Provider value={depth + 1}>
								{shownReplies.map((reply, index) => (
									<li
										key={reply.id ?? `reply-${index}`}
										className={styles.threadEntry}
										data-entry="reply"
										data-last={(lastEntry === "reply" && index === shownReplies.length - 1) || undefined}
									>
										<CommentItem<TUser, TMeta, TResource> comment={reply} {...replyProps} />
									</li>
								))}
							</CommentDepthContext.Provider>
						</ul>
					)}

					{threadComposer && (
						<div className={styles.threadEntry} data-entry="composer" data-last>
							{threadComposer}
						</div>
					)}
				</div>
			)}

			{!!onAttachmentRemove && (
				<ConfirmDialog
					{...attachmentConfirm.overlayProps}
					destructive
					title={copy.confirmRemoveAttachmentTitle}
					description={copy.confirmRemoveAttachmentDescription}
					strings={{ confirm: copy.attachmentRemoveLabel }}
					onConfirm={() => {
						if (pendingAttachment && comment.id) {
							void onAttachmentRemove(comment.id, pendingAttachment)
						}
					}}
				/>
			)}
		</article>
	)
}
