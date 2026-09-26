import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AiChatPage() {
	return (
		<ComponentPage
			title="AI chat"
			summary="A transcript and the twelve surfaces it is built from. There is no fetcher, no router and no streaming client here: messages, the input, the queue and the staged files are all props, and submitting is a callback — because every provider streams differently and every app stores a conversation differently."
			importPath="@/components/features/ai-chat"
			exports={["AiChat", "AiChatMessage", "AiMessageBubble", "AiToolCall", "AiReasoning", "useAiChatScroll",
				"AiChatConversation", "AiChatPromptInput", "AiChatQueue", "AiChatSuggestionsRow", "AiChatAttachmentsStrip", "AiChatEmptyState", "AiShimmer", "AiChainOfThought", "AiTask", "AiAgent", "AiConfirmation", "AiCodeBlock", "AiArtifact", "AiSources", "AiAttachment",
			]}
		>
			<Example
				example="ai-chat/chat"
				title="The chat"
				description="One assistant turn here is reasoning, then a tool call, then text, then the code it wrote, then the sources it read — in that order. That is why a message is a list of parts rather than a content field: the mix and the order are both real, and neither survives a single string."
				bleed
			/>

			<Example
				example="ai-chat/turn"
				title="A turn"
				description="Text goes inside the bubble; everything else goes below it. A tool call, an artifact and a code block already carry their own border and header — put inside a bubble they are a box in a box, and the bubble's padding pushes them off the transcript's grid."
			/>

			<Example
				example="ai-chat/thinking"
				title="Reasoning and plans"
				description="Two shapes for two things a model emits. Reasoning is free-form text that streams — it opens while it is arriving and closes when it stops, because nobody rereads a trace. A chain of thought is structured steps, so it stays open and marks where the work has got to."
			/>

			<Example
				example="ai-chat/tools"
				title="Tool calls"
				description="Every state a call passes through, and the one rule that matters: with no arguments and no result there is nothing behind the header, so it is a plain row rather than a disclosure that opens onto an empty panel."
			/>

			<Example
				example="ai-chat/output"
				title="What it produced"
				description="Code, an artifact wrapping it, the sources behind it, and the files on a turn. No syntax highlighting — that means shipping a grammar per language, and a chat can be handed any of them; what is here is the chrome, so a consumer who wants colour runs their own highlighter and passes the result in."
			/>

			<Example
				example="ai-chat/approval"
				title="Asking first"
				description="The one surface here that blocks the agent, so it is a polite live region: it appears after the reader has stopped watching the transcript, and a screen reader has to be told. Once answered the action row is replaced by the outcome rather than left disabled."
			/>

			<Example id="ai-chat-rules" title="Three rules">
				<Callout label="Enter sends, unless it is composing">
					<code>event.nativeEvent.isComposing</code> is the whole reason the key handler is
					not a one-liner. Mid-composition, Enter <strong>commits the candidate</strong> — and
					treating that as a submit sends half a sentence every time someone types Japanese,
					Chinese, or Korean.
				</Callout>
				<Callout label="Auto-scroll is a state, not a rule">
					A transcript that always jumps to the bottom cannot be read while it streams: every
					token yanks the reader back down from the paragraph they were halfway through. The
					pin is set by where they put the scrollbar, and the threshold is 80px rather than
					zero because sub-pixel heights and a decoding image leave the position a pixel or
					two off the true bottom.
				</Callout>
				<Callout label="The shimmer honours reduced motion">
					A sweeping highlight under words someone is trying to read is exactly the motion
					that setting is for. The fallback restores a real colour as well as stopping the
					animation — a transparent fill with no sweep is invisible text.
				</Callout>
			</Example>

			<Example id="ai-chat-api" title="API">
				<PropTable owner="AiChat"
					rows={[
						{ name: "messages", type: "AiChatMessage[]", required: true, description: "Oldest first. Each carries parts[], which is where the mix lives — text, reasoning, a tool call, code, sources, a task, an artifact, a confirmation, attachments, or custom." },
						{ name: "inputValue / onInputChange", type: "string / (value) => void", required: true, description: "Controlled. The composer holds no draft of its own, so clearing it after a submit is the consumer's, which is also where the failed-send-restores-the-text case lives." },
						{ name: "onSubmit", type: "({ text, attachments }) => void", description: "Fires on Enter or the send button. An attachment on its own is a valid message — “here, look at this” needs no words." },
						{ name: "streaming / onStop", type: "boolean / () => void", description: "Flips submit to stop. Separate from disabled, because a streaming chat is still readable and still cancellable; a disabled one is neither." },
						{ name: "slots", type: "AiChatSlots", description: "Seven regions replaced outright — header, intro, belowMessages, empty, queue, suggestions, input — plus renderMessage for a turn. This is the seam that keeps a prop per idea out of the API." },
						{ name: "agent", type: "AiChatAgent | null", description: "Name, icon, subtitle, tone and status. null hides the header strip entirely." },
						{ name: "useAiChatScroll", type: "({ dependency }) => { containerRef, endRef, isAtBottom, scrollToBottom }", description: "The stick-to-bottom behaviour without the layout, for a consumer building their own transcript." },
						{ name: "AiToolCall status", type: "\"pending\" | \"running\" | \"success\" | \"error\"", description: "With neither args nor result the header is a plain row, not a disclosure — a control that opens an empty panel is worse than no control." },
						{ name: "AiReasoning expandWhileStreaming", type: "boolean", default: "true", description: "Opens on the edge where streaming starts and closes on the edge where it stops, so a reader who opened or closed it in between is not fought." },
						{ name: "AiSources onSelect", type: "(source, index) => void", description: "Wins over url, so an app that routes internally is not forced to hand the reader a full page load to reach its own document." },
						{ name: "AiCodeBlock highlightLines", type: "number[]", description: "1-indexed. The gutter and the line share a grid row, so a highlight covers both rather than stopping at the number." },
						{ name: "AiChatConversation / AiChatPromptInput / AiChatEmptyState", type: "component", description: "The transcript, the composer and the state before the first turn. Each is exported because a consumer building a different chat layout against the same data should get the parts without taking the shell." },
						{ name: "AiChatQueue / AiChatSuggestionsRow / AiChatAttachmentsStrip", type: "component", description: "The three strips above the composer: messages waiting to send, prompt suggestions, and the files attached to the turn being written." },
						{ name: "AiShimmer", type: "component", description: "\u201cThinking\u2026\u201d as a swept highlight rather than a spinner. A spinner says something is happening; a sweep says something is being produced, which is the difference the reader is waiting on. It paints through background-clip, so its colour is transparent by design \u2014 a contrast probe reading `color` alone will call it a 1:1 failure." },
						{ name: "AiChainOfThought / AiTask", type: "component", description: "The step timeline of an agent\u2019s plan, and one step in it. A task reports what is being done, not merely that something is." },
						{ name: "AiAgent / AiConfirmation", type: "component", description: "The identity strip that says which agent is answering, and the approval prompt that stops one before it acts. A confirmation is a decision surface: it does not auto-dismiss." },
						{ name: "AiCodeBlock / AiArtifact", type: "component", description: "Code as produced, and the frame around a produced artifact. There is deliberately no syntax highlighting \u2014 that means shipping a grammar per language, and a chat can be handed any of them." },
						{ name: "AiSources / AiAttachment", type: "component", description: "What the model read, and what the turn carried. Sources are listed rather than footnoted, because a reader checking an answer is looking for the list, not for a marker in the prose." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
