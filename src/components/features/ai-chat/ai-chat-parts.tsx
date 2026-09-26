/**
 * The chat's own regions: the transcript, the message renderer, the composer, and the
 * strips above it. Each is exported for custom layouts without the shell.
 */
import { useCallback, useRef, type KeyboardEvent, type ReactNode } from "react"
import {
	ArrowDownIcon, ArrowUpIcon, PaperclipIcon, SparklesIcon, SquareIcon, XIcon,
} from "lucide-react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { Empty } from "@/components/base/feedback"
import { Textarea } from "@/components/base/text-inputs"
import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { AiArtifact, AiAttachment, AiCodeBlock, AiSources } from "./ai-content-surfaces"
import { AiChainOfThought, AiMessageBubble, AiReasoning, AiShimmer } from "./ai-message-surfaces"
import { AiConfirmation, AiTask, AiToolCall } from "./ai-work-surfaces"
import {
	defaultAiChatConversationStrings, defaultAiChatMessageStrings, defaultAiChatPromptInputStrings,
	defaultAiChatQueueStrings, defaultAiChatSuggestionsStrings,
	type AiChatConversationStrings, type AiChatMessageStrings, type AiChatPromptInputStrings,
	type AiChatQueueStrings, type AiChatSuggestionsStrings,
} from "./ai-chat.strings"
import type {
	AiChatAttachment, AiChatMessage as AiChatMessageData, AiChatMessagePart, AiChatQueueItem,
	AiChatRenderMessageContext, AiChatSubmitValues, AiChatSuggestion,
} from "./ai-chat.types"
import { useAiChatScroll } from "./use-ai-chat-scroll"
import styles from "./ai-chat.module.css"

/* ── Attachments strip ────────────────────────────────────────────────────────────── */

export interface AiChatAttachmentsStripProps {
	attachments: readonly AiChatAttachment[]
	onRemove?: (id: string) => void
	onOpen?: (attachment: AiChatAttachment) => void
	className?: string
}

export function AiChatAttachmentsStrip({
	attachments,
	onRemove,
	onOpen,
	className,
}: AiChatAttachmentsStripProps) {
	if (attachments.length === 0) return null

	return (
		<div className={cx("ai-chat-attachments-strip--component", styles.strip, className)}>
			{attachments.map((attachment) => (
				<AiAttachment
					key={attachment.id}
					name={attachment.name}
					meta={attachment.meta}
					kind={attachment.kind}
					icon={attachment.icon}
					thumbnailUrl={attachment.thumbnailUrl}
					progress={attachment.progress}
					errored={attachment.errored}
					onOpen={onOpen ? () => onOpen(attachment) : undefined}
					onRemove={onRemove ? () => onRemove(attachment.id) : undefined}
				/>
			))}
		</div>
	)
}

/* ── Message ──────────────────────────────────────────────────────────────────────── */

/** What the copy action writes when the part carries no `plain` of its own. */
function extractPlain(node: ReactNode): string {
	if (typeof node === "string" || typeof node === "number") return String(node)
	if (Array.isArray(node)) return node.map(extractPlain).join("")
	return ""
}

function PartRenderer({
	part,
	onAttachmentOpen,
}: {
	part: AiChatMessagePart
	onAttachmentOpen?: (id: string) => void
}) {
	switch (part.type) {
		case "text":
			return <Text lineHeight="relaxed">{part.content}</Text>
		case "reasoning":
			return (
				<AiReasoning streaming={part.streaming} durationSeconds={part.durationSeconds}>
					{part.content}
				</AiReasoning>
			)
		case "chain-of-thought":
			return <AiChainOfThought steps={part.steps} streaming={part.streaming} />
		case "tool":
			return (
				<AiToolCall
					name={part.name}
					status={part.status}
					icon={part.icon}
					args={part.args}
					result={part.result}
					error={part.error}
					durationMs={part.durationMs}
					defaultExpanded={part.defaultExpanded}
				/>
			)
		case "code":
			return (
				<AiCodeBlock
					code={part.code}
					language={part.language}
					filename={part.filename}
					showLineNumbers={part.showLineNumbers}
					highlightLines={part.highlightLines}
				/>
			)
		case "attachments":
			return (
				<AiChatAttachmentsStrip
					attachments={part.items}
					onOpen={onAttachmentOpen ? (item) => onAttachmentOpen(item.id) : undefined}
				/>
			)
		case "sources":
			return (
				<AiSources
					sources={part.items}
					variant={part.variant}
					defaultExpanded={part.defaultExpanded}
				/>
			)
		case "task":
			return <AiTask task={part.task} />
		case "artifact":
			return (
				<AiArtifact
					title={part.title}
					subtitle={part.subtitle}
					icon={part.icon}
					copyText={part.copyText}
					actions={part.actions}
					onOpen={part.onOpen}
					onDownload={part.onDownload}
				>
					{part.body}
				</AiArtifact>
			)
		case "confirmation":
			return (
				<AiConfirmation
					title={part.title}
					description={part.description}
					tone={part.tone}
					status={part.status}
					details={part.details}
					onApprove={part.onApprove}
					onReject={part.onReject}
				/>
			)
		case "custom":
			return <>{part.render()}</>
	}
}

export interface AiChatMessageProps {
	message: AiChatMessageData
	onCopy?: () => void
	onRegenerate?: () => void
	onAttachmentOpen?: (attachmentId: string) => void
	className?: string
	strings?: Partial<AiChatMessageStrings>
}

/**
 * One turn. Only the first run of text parts goes in a bubble (other parts bring their own
 * chrome); parts before and after it keep their declared order around the bubble.
 */
export function AiChatMessage({
	message,
	onCopy,
	onRegenerate,
	onAttachmentOpen,
	className,
	strings,
}: AiChatMessageProps) {
	const copy = { ...defaultAiChatMessageStrings, ...strings }

	const firstText = message.parts.findIndex((part) => part.type === "text")
	let runEnd = firstText
	while (runEnd >= 0 && message.parts[runEnd + 1]?.type === "text") runEnd += 1

	const before = firstText < 0 ? [] : message.parts.slice(0, firstText)
	const inBubble = firstText < 0 ? [] : message.parts.slice(firstText, runEnd + 1)
	const after = firstText < 0 ? [...message.parts] : message.parts.slice(runEnd + 1)

	const plainText =
		inBubble
			.map((part) => (part.type === "text" ? (part.plain ?? extractPlain(part.content)) : ""))
			.filter(Boolean)
			.join("\n") || undefined

	const bubbleContent = message.pending ? (
		<AiShimmer>{copy.pending}</AiShimmer>
	) : inBubble.length === 0 ? null : (
		<div className={styles.bubbleParts}>
			{inBubble.map((part, index) => (
				<div key={index} className={styles.preWrap}>
					{part.type === "text" ? part.content : null}
				</div>
			))}
		</div>
	)

	return (
		<div
			data-role={message.role}
			className={cx("ai-chat-message--component", styles.message, className)}
		>
			{before.length > 0 && (
				<div className={styles.messageBelow}>
					{before.map((part, index) => (
						<PartRenderer key={index} part={part} onAttachmentOpen={onAttachmentOpen} />
					))}
				</div>
			)}

			{(bubbleContent !== null || message.pending) && (
				<AiMessageBubble
					role={message.role}
					avatar={message.avatar}
					authorName={message.authorName}
					timestamp={message.timestamp}
					plainText={plainText}
					loading={message.loading}
					onCopy={plainText ? (onCopy ?? (() => undefined)) : undefined}
					/* Nothing has been generated yet, so there is nothing to generate again. */
					onRegenerate={message.pending ? undefined : onRegenerate}
				>
					{bubbleContent}
				</AiMessageBubble>
			)}

			{after.length > 0 && (
				<div className={styles.messageBelow}>
					{after.map((part, index) => (
						<PartRenderer key={index} part={part} onAttachmentOpen={onAttachmentOpen} />
					))}
				</div>
			)}

			{!!message.trailing && <div className={styles.messageBelow}>{message.trailing}</div>}
		</div>
	)
}

/* ── Conversation ─────────────────────────────────────────────────────────────────── */

export interface AiChatConversationProps {
	/** Oldest first. */
	messages: readonly AiChatMessageData[]
	renderMessage: (message: AiChatMessageData, context: AiChatRenderMessageContext) => ReactNode
	intro?: ReactNode
	footer?: ReactNode
	empty?: ReactNode
	disableAutoScroll?: boolean
	className?: string
	strings?: Partial<AiChatConversationStrings>
}

export function AiChatConversation({
	messages,
	renderMessage,
	intro,
	footer,
	empty,
	disableAutoScroll,
	className,
	strings,
}: AiChatConversationProps) {
	const copy = { ...defaultAiChatConversationStrings, ...strings }

	const { containerRef, endRef, isAtBottom, scrollToBottom } = useAiChatScroll({
		dependency: messages.length,
		disableAutoScroll,
	})

	const isEmpty = messages.length === 0 && !intro

	return (
		<div className={cx("ai-chat-conversation--component", styles.conversation, className)}>
			{/* Focusable, so keyboard readers can scroll it. */}
			<div
				ref={containerRef}
				tabIndex={0}
				aria-label={copy.transcriptAria}
				className={styles.transcript}
			>
				{!!intro && <div className={styles.transcriptIntro}>{intro}</div>}

				{isEmpty ? (
					(empty ?? <Text type="secondary">{copy.empty}</Text>)
				) : (
					<ol className={styles.messages}>
						{messages.map((message, index) => (
							<li key={message.id}>
								{renderMessage(message, { index, isLast: index === messages.length - 1 })}
							</li>
						))}
					</ol>
				)}

				{!!footer && <div className={styles.transcriptFooter}>{footer}</div>}

				<div ref={endRef} aria-hidden className={styles.sentinel} />
			</div>

			{/* A band, not a floating pill, which would cover the last message. */}
			{!isAtBottom && (
				<div className={styles.jump}>
					<Button
						type="button"
						tone="neutral"
						buttonStyle="outline"
						aria-label={copy.scrollToBottomAria}
						onClick={() => scrollToBottom("smooth")}
					>
						<ArrowDownIcon />
						{copy.scrollToBottom}
					</Button>
				</div>
			)}
		</div>
	)
}

/* ── Empty state ──────────────────────────────────────────────────────────────────── */

export interface AiChatEmptyStateProps {
	title?: ReactNode
	description?: ReactNode
	icon?: ReactNode
	/** Under the body — a grid of starter prompts, usually. */
	below?: ReactNode
	className?: string
}

export function AiChatEmptyState({
	title,
	description,
	icon = <SparklesIcon />,
	below,
	className,
}: AiChatEmptyStateProps) {
	return (
		<div className={cx("ai-chat-empty-state--component", styles.emptyState, className)}>
			<Empty
				media={icon}
				mediaVariant="icon-soft"
				title={title}
				description={description ?? false}
				padding="md"
			/>
			{!!below && <div className={styles.emptyBelow}>{below}</div>}
		</div>
	)
}

/* ── Queue ────────────────────────────────────────────────────────────────────────── */

export interface AiChatQueueProps {
	items: readonly AiChatQueueItem[]
	hideHeader?: boolean
	onCancel?: (id: string) => void
	className?: string
	strings?: Partial<AiChatQueueStrings>
}

export function AiChatQueue({
	items,
	hideHeader = false,
	onCancel,
	className,
	strings,
}: AiChatQueueProps) {
	const copy = { ...defaultAiChatQueueStrings, ...strings }
	if (items.length === 0) return null

	return (
		<div className={cx("ai-chat-queue--component", styles.queue, className)}>
			{!hideHeader && (
				<Text tag="div" size="xs" type="secondary" className={styles.queueHeader}>
					{copy.header} · {items.length}
				</Text>
			)}
			<ul className={styles.queueList}>
				{items.map((item) => {
					const running = (item.status ?? "queued") === "running"
					return (
						<li key={item.id} className={styles.queueRow}>
							<Text truncate className={styles.grow}>{item.label}</Text>
							{/* The badge's dot carries the state (live or pending); no leading glyph needed. */}
							<Badge tone={running ? "primary" : "neutral"} dot pulse={running} pending={!running}>
								{running ? copy.runningLabel : copy.queuedLabel}
							</Badge>
							{(!!item.onCancel || !!onCancel) && (
								<Button
									type="button"
									tone="neutral"
									buttonStyle="ghost"
									iconOnly
									aria-label={copy.cancelAria}
									onClick={() => {
										item.onCancel?.()
										onCancel?.(item.id)
									}}
									className={styles.dismiss}
								>
									<XIcon />
								</Button>
							)}
						</li>
					)
				})}
			</ul>
		</div>
	)
}

/* ── Suggestions ──────────────────────────────────────────────────────────────────── */

export interface AiChatSuggestionsRowProps<TData = unknown> {
	suggestions: readonly AiChatSuggestion<TData>[]
	onPick?: (suggestion: AiChatSuggestion<TData>) => void
	hideHeader?: boolean
	className?: string
	strings?: Partial<AiChatSuggestionsStrings>
}

export function AiChatSuggestionsRow<TData = unknown>({
	suggestions,
	onPick,
	hideHeader = false,
	className,
	strings,
}: AiChatSuggestionsRowProps<TData>) {
	const copy = { ...defaultAiChatSuggestionsStrings, ...strings }
	if (suggestions.length === 0) return null

	return (
		<div className={cx("ai-chat-suggestions-row--component", styles.suggestions, className)}>
			{!hideHeader && (
				<span className={styles.suggestionsHeader}>
					<SparklesIcon aria-hidden />
					<DisplayLabel>{copy.header}</DisplayLabel>
				</span>
			)}
			{/* Scrolls rather than wraps, so the composer height stays fixed. */}
			<div className={styles.suggestionsScroll}>
				{suggestions.map((suggestion) => {
					const Icon = suggestion.icon
					return (
						<button
							key={suggestion.id}
							type="button"
							onClick={() => onPick?.(suggestion)}
							className={styles.suggestion}
						>
							{!!Icon && <Icon aria-hidden />}
							<Text tag="span" weight="medium">{suggestion.label}</Text>
						</button>
					)
				})}
			</div>
		</div>
	)
}

/* ── Composer ─────────────────────────────────────────────────────────────────────── */

export interface AiChatPromptInputProps {
	value: string
	onValueChange: (value: string) => void
	onSubmit?: (values: AiChatSubmitValues) => void
	onStop?: () => void
	/** Flips submit to stop. */
	streaming?: boolean
	disabled?: boolean
	attachments?: readonly AiChatAttachment[]
	onRemoveAttachment?: (id: string) => void
	onAttach?: () => void
	/** Defaults to showing whenever `onAttach` is given. */
	showAttach?: boolean
	/** Before the attach button — a model picker, usually. */
	leadingActions?: ReactNode
	/** Before submit. */
	trailingActions?: ReactNode
	hideHint?: boolean
	minRows?: number
	maxRows?: number
	autoFocus?: boolean
	/** What the hint calls the submit key. */
	submitKeyLabel?: string
	className?: string
	strings?: Partial<AiChatPromptInputStrings>
}

export function AiChatPromptInput({
	value,
	onValueChange,
	onSubmit,
	onStop,
	streaming = false,
	disabled = false,
	attachments = [],
	onRemoveAttachment,
	onAttach,
	showAttach,
	leadingActions,
	trailingActions,
	hideHint = false,
	minRows = 1,
	maxRows = 8,
	autoFocus = false,
	submitKeyLabel = "↩",
	className,
	strings,
}: AiChatPromptInputProps) {
	const copy = { ...defaultAiChatPromptInputStrings, ...strings }
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)

	/* Attachments alone are submittable. */
	const canSubmit =
		!!onSubmit && !streaming && !disabled && (value.trim().length > 0 || attachments.length > 0)

	const submit = useCallback(() => {
		if (!canSubmit) return
		onSubmit?.({ text: value, attachments })
	}, [attachments, canSubmit, onSubmit, value])

	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLTextAreaElement>) => {
			/* Mid-IME-composition, Enter commits the candidate; it must not submit. */
			if (
				event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || !onSubmit
			) return
			event.preventDefault()
			submit()
		},
		[onSubmit, submit],
	)

	const hint = copy.hint
		.replace(/\{\{\s*submitKey\s*\}\}/g, submitKeyLabel)
		.replace(/\{\{\s*newlineKey\s*\}\}/g, "⇧↩")

	return (
		<div
			data-disabled={disabled || undefined}
			className={cx("ai-chat-prompt-input--component", styles.composer, className)}
		>
			{attachments.length > 0 && (
				<div className={styles.composerAttachments}>
					<AiChatAttachmentsStrip attachments={attachments} onRemove={onRemoveAttachment} />
				</div>
			)}

			<Textarea
				ref={textareaRef}
				value={value}
				placeholder={copy.placeholder}
				minRows={minRows}
				maxRows={maxRows}
				autoFocus={autoFocus}
				disabled={disabled}
				onChange={(event) => onValueChange(event.target.value)}
				onKeyDown={onKeyDown}
				className={styles.composerField}
			/>

			<div className={styles.composerBar}>
				{leadingActions}
				{(showAttach ?? !!onAttach) && (
					<Button
						type="button"
						tone="neutral"
						buttonStyle="ghost"
						iconOnly
						aria-label={copy.attachAria}
						disabled={disabled || !onAttach}
						onClick={onAttach}
					>
						<PaperclipIcon />
					</Button>
				)}
				<div className={styles.composerBarEnd}>
					{!hideHint && (
						<Text size="xs" type="secondary" truncate className={styles.composerHint}>
							{hint}
						</Text>
					)}
					{trailingActions}
					{streaming ? (
						<Button
							type="button"
							tone="neutral"
							iconOnly
							aria-label={copy.stopAria}
							disabled={disabled || !onStop}
							onClick={onStop}
						>
							<SquareIcon className={styles.stopGlyph} />
						</Button>
					) : (
						<Button
							type="button"
							iconOnly
							aria-label={copy.submitAria}
							disabled={!canSubmit}
							onClick={submit}
						>
							<ArrowUpIcon />
						</Button>
					)}
				</div>
			</div>

		</div>
	)
}
