/**
 * AiChat — the agent header, the transcript, and the composer, wired together.
 *
 * No fetcher, router or streaming client: messages, input, queue and attachments are
 * props, and submitting is a callback. Regions are replaceable through slots, and
 * `renderMessage` replaces a turn.
 */
import { useCallback, type ReactNode } from "react"

import { cx } from "@/lib/cx"

import {
	AiChatConversation, AiChatEmptyState, AiChatMessage, AiChatPromptInput, AiChatQueue,
	AiChatSuggestionsRow,
} from "./ai-chat-parts"
import { AiAgent } from "./ai-work-surfaces"
import { defaultAiChatStrings, type AiChatStrings } from "./ai-chat.strings"
import type {
	AiChatAgent, AiChatAttachment, AiChatMessage as AiChatMessageData, AiChatQueueItem,
	AiChatRenderMessageContext, AiChatSlots, AiChatSubmitValues, AiChatSuggestion,
} from "./ai-chat.types"
import styles from "./ai-chat.module.css"

export interface AiChatProps<TSuggestionData = unknown> {
	/** Oldest first. */
	messages: readonly AiChatMessageData[]

	inputValue: string
	onInputChange: (value: string) => void
	onSubmit?: (values: AiChatSubmitValues) => void
	onStop?: () => void
	streaming?: boolean
	disabled?: boolean

	attachments?: readonly AiChatAttachment[]
	onRemoveAttachment?: (id: string) => void
	onAttach?: () => void
	showAttach?: boolean

	/** `null` hides the header strip. */
	agent?: AiChatAgent | null
	headerActions?: ReactNode

	queue?: readonly AiChatQueueItem[]
	onCancelQueueItem?: (id: string) => void

	suggestions?: readonly AiChatSuggestion<TSuggestionData>[]
	onPickSuggestion?: (suggestion: AiChatSuggestion<TSuggestionData>) => void

	onMessageCopy?: (message: AiChatMessageData) => void
	onMessageRegenerate?: (message: AiChatMessageData) => void
	onAttachmentOpen?: (messageId: string, attachmentId: string) => void

	disableAutoScroll?: boolean

	slots?: AiChatSlots
	strings?: Partial<AiChatStrings>
	className?: string
}

export function AiChat<TSuggestionData = unknown>({
	messages,
	inputValue,
	onInputChange,
	onSubmit,
	onStop,
	streaming = false,
	disabled = false,
	attachments = [],
	onRemoveAttachment,
	onAttach,
	showAttach,
	agent,
	headerActions,
	queue = [],
	onCancelQueueItem,
	suggestions = [],
	onPickSuggestion,
	onMessageCopy,
	onMessageRegenerate,
	onAttachmentOpen,
	disableAutoScroll,
	slots,
	strings,
	className,
}: AiChatProps<TSuggestionData>) {
	const copy = { ...defaultAiChatStrings, ...strings }

	const renderMessage = useCallback(
		(message: AiChatMessageData, context: AiChatRenderMessageContext): ReactNode => {
			if (slots?.renderMessage) return slots.renderMessage(message, context)

			return (
				<AiChatMessage
					message={message}
					strings={copy.message}
					onCopy={onMessageCopy ? () => onMessageCopy(message) : undefined}
					onRegenerate={onMessageRegenerate ? () => onMessageRegenerate(message) : undefined}
					onAttachmentOpen={
						onAttachmentOpen
							? (attachmentId) => onAttachmentOpen(message.id, attachmentId)
							: undefined
					}
				/>
			)
		},
		[copy.message, onAttachmentOpen, onMessageCopy, onMessageRegenerate, slots],
	)

	const header =
		slots?.header ??
		(agent ? (
			<div className={styles.header}>
				<AiAgent
					name={agent.name}
					icon={agent.icon}
					avatar={agent.avatar}
					subtitle={agent.subtitle}
					tone={agent.tone}
					status={agent.status}
					variant="inline"
				/>
				{!!headerActions && <div className={styles.headerActions}>{headerActions}</div>}
			</div>
		) : null)

	const empty =
		slots?.empty ??
		(messages.length === 0 ? (
			<AiChatEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
		) : null)

	const queueStrip =
		slots?.queue ??
		(queue.length > 0 ? (
			<AiChatQueue items={queue} onCancel={onCancelQueueItem} strings={copy.queue} />
		) : null)

	const suggestionsStrip =
		slots?.suggestions ??
		(suggestions.length > 0 ? (
			<AiChatSuggestionsRow<TSuggestionData>
				suggestions={suggestions}
				onPick={onPickSuggestion}
				strings={copy.suggestions}
			/>
		) : null)

	const composer = slots?.input ?? (
		<AiChatPromptInput
			value={inputValue}
			onValueChange={onInputChange}
			onSubmit={onSubmit}
			onStop={onStop}
			streaming={streaming}
			disabled={disabled}
			attachments={attachments}
			onRemoveAttachment={onRemoveAttachment}
			onAttach={onAttach}
			showAttach={showAttach}
			strings={copy.prompt}
		/>
	)

	return (
		<div className={cx("ai-chat--component", styles.chat, className)}>
			{header}

			<AiChatConversation
				messages={messages}
				renderMessage={renderMessage}
				intro={slots?.intro}
				footer={slots?.belowMessages}
				empty={empty}
				disableAutoScroll={disableAutoScroll}
				strings={copy.conversation}
			/>

			{(!!queueStrip || !!suggestionsStrip || !!composer) && (
				<div className={styles.footer}>
					{queueStrip}
					{suggestionsStrip}
					{composer}
				</div>
			)}
		</div>
	)
}
