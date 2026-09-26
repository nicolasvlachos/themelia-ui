/**
 * AI chat — the transcript and the surfaces it is built from. The surfaces are exported
 * alongside the chat so a consumer can build their own transcript without the shell.
 *
 * A message is an ordered list of parts (text, tool call, code, sources, …) so one turn
 * can mix kinds in order; `custom` covers anything else.
 */
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import type { SemanticTone } from "@/lib/component-vocabulary"

import type * as Strings from "./ai-chat.strings"

/* ── Shimmer ──────────────────────────────────────────────────────────────────────── */

export interface AiShimmerProps {
	/** Defaults to the "Thinking…" placeholder. */
	children?: ReactNode
	/** Renders the text still, in the muted foreground. */
	paused?: boolean
	/** Sweep duration, in seconds. */
	duration?: number
	className?: string
}

/* ── Message bubble ───────────────────────────────────────────────────────────────── */

export type AiMessageRole = "assistant" | "user" | "system"

export interface AiMessageBubbleProps {
	role?: AiMessageRole
	avatar?: ReactNode
	avatarLabel?: string
	authorName?: ReactNode
	timestamp?: ReactNode
	children?: ReactNode
	/** What the copy action writes. Without it, only a string body can be copied. */
	plainText?: string
	loading?: boolean
	onCopy?: () => void
	onRegenerate?: () => void
	className?: string
	strings?: Partial<Strings.AiMessageBubbleStrings>
}

/* ── Reasoning ────────────────────────────────────────────────────────────────────── */

export interface AiReasoningProps {
	/** The trace. A string is rendered pre-wrapped; anything else is rendered as given. */
	children?: ReactNode
	streaming?: boolean
	durationSeconds?: number
	/** Opens while streaming and closes when it stops. */
	expandWhileStreaming?: boolean
	defaultExpanded?: boolean
	expanded?: boolean
	onExpandedChange?: (expanded: boolean) => void
	className?: string
	strings?: Partial<Strings.AiReasoningStrings>
}

/* ── Chain of thought ─────────────────────────────────────────────────────────────── */

export type AiChainStepStatus = "pending" | "active" | "completed" | "failed"

export interface AiChainStep {
	id: string
	title: ReactNode
	description?: ReactNode
	status?: AiChainStepStatus
	icon?: LucideIcon
	/** Anything the step produced — a tool call, a code block, sub-steps. */
	body?: ReactNode
}

export interface AiChainOfThoughtProps {
	/** Order is significant. */
	steps: readonly AiChainStep[]
	hideHeader?: boolean
	streaming?: boolean
	className?: string
	strings?: Partial<Strings.AiChainOfThoughtStrings>
}

/* ── Tool call ────────────────────────────────────────────────────────────────────── */

export type AiToolCallStatus = "pending" | "running" | "success" | "error"

export interface AiToolCallProps {
	name: string
	status: AiToolCallStatus
	icon?: LucideIcon
	args?: ReactNode
	result?: ReactNode
	error?: ReactNode
	durationMs?: number
	expanded?: boolean
	defaultExpanded?: boolean
	onExpandedChange?: (expanded: boolean) => void
	className?: string
	strings?: Partial<Strings.AiToolCallStrings>
}

/* ── Task ─────────────────────────────────────────────────────────────────────────── */

export type AiTaskStatus =
	| "queued" | "running" | "completed" | "failed" | "cancelled" | "skipped"

export interface AiTaskItem {
	id: string
	title: ReactNode
	status?: AiTaskStatus
	children?: readonly AiTaskItem[]
	icon?: LucideIcon
	/** A duration, a byte count — whatever the row's trailing lane should carry. */
	rightSlot?: ReactNode
	body?: ReactNode
}

export interface AiTaskProps {
	task: AiTaskItem
	/** `compact` collapses the sub-tasks behind a toggle; `expanded` always shows them. */
	density?: "compact" | "expanded"
	/** Indent per nesting level, as a multiple of `--space-xl`. */
	indent?: number
	className?: string
	strings?: Partial<Strings.AiTaskStrings>
}

/* ── Agent ────────────────────────────────────────────────────────────────────────── */

export type AiAgentStatus = "idle" | "thinking" | "working" | "done" | "error" | "offline"

export type AiAgentTone = Exclude<SemanticTone, "secondary">

export interface AiAgentProps {
	name: string
	icon?: LucideIcon
	/** Replaces the icon medallion — an image, a gradient mark. */
	avatar?: ReactNode
	subtitle?: ReactNode
	tone?: AiAgentTone
	status?: AiAgentStatus
	/** `inline` is a single-line chip; `card` is a tile. */
	variant?: "inline" | "card"
	trailing?: ReactNode
	className?: string
	strings?: Partial<Strings.AiAgentStrings>
}

/* ── Confirmation ─────────────────────────────────────────────────────────────────── */

export type AiConfirmationTone = Exclude<SemanticTone, "secondary" | "success">
export type AiConfirmationStatus = "pending" | "approved" | "rejected"

export interface AiConfirmationProps {
	title: ReactNode
	description?: ReactNode
	icon?: LucideIcon
	tone?: AiConfirmationTone
	/** Set, the action row is replaced by the outcome. */
	status?: AiConfirmationStatus
	onApprove?: () => void
	onReject?: () => void
	approveLabel?: ReactNode
	rejectLabel?: ReactNode
	details?: ReactNode
	className?: string
	strings?: Partial<Strings.AiConfirmationStrings>
}

/* ── Code block ───────────────────────────────────────────────────────────────────── */

export interface AiCodeBlockProps {
	code: string
	language?: string
	filename?: string
	showLineNumbers?: boolean
	/** 1-indexed. */
	highlightLines?: readonly number[]
	hideHeader?: boolean
	maxHeight?: number | string
	headerActions?: ReactNode
	onCopy?: () => void
	className?: string
	strings?: Partial<Strings.AiCodeBlockStrings>
}

/* ── Artifact ─────────────────────────────────────────────────────────────────────── */

export interface AiArtifactAction {
	id: string
	label: string
	icon?: LucideIcon
	onSelect?: () => void
}

export interface AiArtifactProps {
	title: ReactNode
	subtitle?: ReactNode
	icon?: LucideIcon
	copyText?: string
	children?: ReactNode
	/** Header only — the artifact as a chip that opens somewhere else. */
	collapsed?: boolean
	onOpen?: () => void
	actions?: readonly AiArtifactAction[]
	onDownload?: () => void
	className?: string
	strings?: Partial<Strings.AiArtifactStrings>
}

/* ── Sources ──────────────────────────────────────────────────────────────────────── */

export interface AiSourceItem {
	id: string
	title: ReactNode
	url?: string
	publisher?: string
	faviconUrl?: string
	/** Shown only in the expanded list. */
	snippet?: ReactNode
}

export type AiSourcesVariant = "list" | "avatars"

export interface AiSourcesProps {
	/** Order is significant — the index is the number the reader sees. */
	sources: readonly AiSourceItem[]
	variant?: AiSourcesVariant
	/** How many favicons the strip shows before the "+N". */
	maxAvatars?: number
	expanded?: boolean
	defaultExpanded?: boolean
	onExpandedChange?: (expanded: boolean) => void
	/** Preferred over `url`, so a source can route inside the app. */
	onSelect?: (source: AiSourceItem, index: number) => void
	className?: string
	strings?: Partial<Strings.AiSourcesStrings>
}

/* ── Attachment ───────────────────────────────────────────────────────────────────── */

export type AiAttachmentKind =
	| "image" | "document" | "audio" | "video" | "code" | "archive" | "generic"

export interface AiAttachmentProps {
	name: string
	meta?: string
	kind?: AiAttachmentKind
	icon?: LucideIcon
	/** Renders the chip as a thumbnail tile. */
	thumbnailUrl?: string
	/** 0–1. */
	progress?: number
	/** Overrides progress. */
	errored?: boolean
	onOpen?: () => void
	onRemove?: () => void
	className?: string
	strings?: Partial<Strings.AiAttachmentStrings>
}

/* ── The chat ─────────────────────────────────────────────────────────────────────── */

export interface AiChatAttachment {
	id: string
	name: string
	meta?: string
	kind?: AiAttachmentKind
	icon?: LucideIcon
	thumbnailUrl?: string
	url?: string
	/** 0–1, while it is still uploading. */
	progress?: number
	errored?: boolean
}

/** One part of a message; a message is an ordered list of these. */
export type AiChatMessagePart =
	| { type: "text"; content: ReactNode; plain?: string }
	| { type: "reasoning"; content: ReactNode; streaming?: boolean; durationSeconds?: number }
	| { type: "chain-of-thought"; steps: readonly AiChainStep[]; streaming?: boolean }
	| {
			type: "tool"
			name: string
			status: AiToolCallStatus
			icon?: LucideIcon
			args?: ReactNode
			result?: ReactNode
			error?: ReactNode
			durationMs?: number
			defaultExpanded?: boolean
		}
	| {
			type: "code"
			code: string
			language?: string
			filename?: string
			showLineNumbers?: boolean
			highlightLines?: readonly number[]
		}
	| { type: "attachments"; items: readonly AiChatAttachment[] }
	| {
			type: "sources"
			items: readonly AiSourceItem[]
			variant?: AiSourcesVariant
			defaultExpanded?: boolean
		}
	| { type: "task"; task: AiTaskItem }
	| {
			type: "artifact"
			title: ReactNode
			subtitle?: ReactNode
			icon?: LucideIcon
			copyText?: string
			body?: ReactNode
			actions?: readonly AiArtifactAction[]
			onOpen?: () => void
			onDownload?: () => void
		}
	| {
			type: "confirmation"
			title: ReactNode
			description?: ReactNode
			tone?: AiConfirmationTone
			status?: AiConfirmationStatus
			details?: ReactNode
			onApprove?: () => void
			onReject?: () => void
		}
	| { type: "custom"; render: () => ReactNode }

export interface AiChatMessage {
	id: string
	role: AiMessageRole
	/** Falls back to a role-derived label in the bubble. */
	authorName?: string
	avatar?: ReactNode
	timestamp?: ReactNode
	parts: readonly AiChatMessagePart[]
	loading?: boolean
	/** Renders the shimmer INSTEAD of the parts — the turn before the first token. */
	pending?: boolean
	/** Under the bubble: a feedback row, a retry, a footnote. */
	trailing?: ReactNode
}

export interface AiChatSuggestion<TData = unknown> {
	id: string
	label: ReactNode
	icon?: LucideIcon
	/** Echoed back to `onPickSuggestion` — an id, a template, a whole request body. */
	data?: TData
}

export interface AiChatQueueItem {
	id: string
	label: ReactNode
	status?: "queued" | "running"
	onCancel?: () => void
}

/** Who is answering. Drives the header strip. */
export type AiChatAgent = Pick<
	AiAgentProps,
	"name" | "icon" | "avatar" | "subtitle" | "tone" | "status"
>

export interface AiChatRenderMessageContext {
	isLast: boolean
	index: number
}

export interface AiChatSlots {
	header?: ReactNode
	/** Before the transcript — a welcome card, an agent introduction. */
	intro?: ReactNode
	/** After the transcript, before the composer. */
	belowMessages?: ReactNode
	empty?: ReactNode
	queue?: ReactNode
	suggestions?: ReactNode
	input?: ReactNode
	/** `null` skips the message entirely. */
	renderMessage?: (message: AiChatMessage, context: AiChatRenderMessageContext) => ReactNode
}

export interface AiChatSubmitValues {
	text: string
	attachments: readonly AiChatAttachment[]
}
