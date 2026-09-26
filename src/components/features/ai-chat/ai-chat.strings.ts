/**
 * Copy for the chat and every surface it is built from: one object per surface, each
 * overridable where it is used, and nested in the chat's own object.
 */

/* ── Surfaces ─────────────────────────────────────────────────────────────────────── */

export interface AiMessageBubbleStrings {
	copyAria: string
	copied: string
	regenerateAria: string
}

export const defaultAiMessageBubbleStrings: AiMessageBubbleStrings = {
	copyAria: "Copy message",
	copied: "Copied",
	regenerateAria: "Regenerate response",
}

export interface AiReasoningStrings {
	thinking: string
	/** `{{duration}}` is replaced by the formatted elapsed time. */
	thoughtFor: string
	/** When no duration was recorded. */
	thoughtDone: string
	expandAria: string
	collapseAria: string
}

export const defaultAiReasoningStrings: AiReasoningStrings = {
	thinking: "Thinking…",
	thoughtFor: "Thought for {{duration}}",
	thoughtDone: "Reasoning complete",
	expandAria: "Expand reasoning",
	collapseAria: "Collapse reasoning",
}

export interface AiChainOfThoughtStrings {
	title: string
	streamingHint: string
}

export const defaultAiChainOfThoughtStrings: AiChainOfThoughtStrings = {
	title: "Reasoning",
	streamingHint: "Working through the steps…",
}

export interface AiToolCallStrings {
	pending: string
	running: string
	success: string
	error: string
	expand: string
	collapse: string
	args: string
	result: string
	durationLabel: string
}

export const defaultAiToolCallStrings: AiToolCallStrings = {
	pending: "Queued",
	running: "Running",
	success: "Success",
	error: "Failed",
	expand: "Show details",
	collapse: "Hide details",
	args: "Arguments",
	result: "Result",
	durationLabel: "Took",
}

export interface AiTaskStrings {
	statusLabels: Record<
		"queued" | "running" | "completed" | "failed" | "cancelled" | "skipped",
		string
	>
	collapseSubtasks: string
	expandSubtasks: string
}

export const defaultAiTaskStrings: AiTaskStrings = {
	statusLabels: {
		queued: "Queued",
		running: "Running",
		completed: "Done",
		failed: "Failed",
		cancelled: "Cancelled",
		skipped: "Skipped",
	},
	collapseSubtasks: "Collapse subtasks",
	expandSubtasks: "Expand subtasks",
}

export interface AiAgentStrings {
	statusLabels: Record<
		"idle" | "thinking" | "working" | "done" | "error" | "offline",
		string
	>
}

export const defaultAiAgentStrings: AiAgentStrings = {
	statusLabels: {
		idle: "Idle",
		thinking: "Thinking",
		working: "Working",
		done: "Done",
		error: "Error",
		offline: "Offline",
	},
}

export interface AiConfirmationStrings {
	approve: string
	reject: string
	pending: string
	approved: string
	rejected: string
	detailsLabel: string
}

export const defaultAiConfirmationStrings: AiConfirmationStrings = {
	approve: "Approve",
	reject: "Reject",
	pending: "Awaiting your approval",
	approved: "Approved",
	rejected: "Rejected",
	detailsLabel: "Details",
}

export interface AiCodeBlockStrings {
	copy: string
	copied: string
	copyAria: string
	/** Header label when no language was given. */
	defaultLanguageLabel: string
}

export const defaultAiCodeBlockStrings: AiCodeBlockStrings = {
	copy: "Copy",
	copied: "Copied",
	copyAria: "Copy code",
	defaultLanguageLabel: "Code",
}

export interface AiArtifactStrings {
	openAria: string
	copy: string
	copied: string
	copyAria: string
	downloadAria: string
}

export const defaultAiArtifactStrings: AiArtifactStrings = {
	openAria: "Open artifact",
	copy: "Copy",
	copied: "Copied",
	copyAria: "Copy artifact",
	downloadAria: "Download artifact",
}

export interface AiSourcesStrings {
	/** `{{count}}` is replaced by the number of sources. */
	title: string
	expand: string
	collapse: string
	visit: string
}

export const defaultAiSourcesStrings: AiSourcesStrings = {
	title: "{{count}} sources",
	expand: "Show all sources",
	collapse: "Hide sources",
	visit: "Visit source",
}

export interface AiAttachmentStrings {
	removeAria: string
	openAria: string
	uploadProgressAria: string
}

export const defaultAiAttachmentStrings: AiAttachmentStrings = {
	removeAria: "Remove attachment",
	openAria: "Open attachment",
	uploadProgressAria: "Upload progress",
}

/* ── The chat ─────────────────────────────────────────────────────────────────────── */

export interface AiChatPromptInputStrings {
	placeholder: string
	attachAria: string
	submitAria: string
	/** Replaces the submit label while a response is streaming. */
	stopAria: string
	/** `{{submitKey}}` and `{{newlineKey}}` are replaced by the real shortcuts. */
	hint: string
}

export const defaultAiChatPromptInputStrings: AiChatPromptInputStrings = {
	placeholder: "Ask anything…",
	attachAria: "Attach files",
	submitAria: "Send message",
	stopAria: "Stop generating",
	hint: "Press {{submitKey}} to send · {{newlineKey}} for a newline",
}

export interface AiChatConversationStrings {
	transcriptAria: string
	empty: string
	scrollToBottom: string
	scrollToBottomAria: string
}

export const defaultAiChatConversationStrings: AiChatConversationStrings = {
	transcriptAria: "Conversation messages",
	empty: "No messages yet.",
	scrollToBottom: "Jump to latest",
	scrollToBottomAria: "Scroll to the newest message",
}

export interface AiChatQueueStrings {
	header: string
	cancelAria: string
	queuedLabel: string
	runningLabel: string
}

export const defaultAiChatQueueStrings: AiChatQueueStrings = {
	header: "In queue",
	cancelAria: "Remove from the queue",
	queuedLabel: "Queued",
	runningLabel: "Running",
}

export interface AiChatSuggestionsStrings {
	header: string
}

export const defaultAiChatSuggestionsStrings: AiChatSuggestionsStrings = {
	header: "Try",
}

export interface AiChatMessageStrings {
	pending: string
}

export const defaultAiChatMessageStrings: AiChatMessageStrings = {
	pending: "Thinking…",
}

export interface AiChatStrings {
	prompt: AiChatPromptInputStrings
	conversation: AiChatConversationStrings
	queue: AiChatQueueStrings
	suggestions: AiChatSuggestionsStrings
	message: AiChatMessageStrings
	emptyTitle: string
	emptyDescription: string
}

export const defaultAiChatStrings: AiChatStrings = {
	prompt: defaultAiChatPromptInputStrings,
	conversation: defaultAiChatConversationStrings,
	queue: defaultAiChatQueueStrings,
	suggestions: defaultAiChatSuggestionsStrings,
	message: defaultAiChatMessageStrings,
	emptyTitle: "Start a conversation",
	emptyDescription: "Ask a question, share context, or attach a file to get going.",
}
