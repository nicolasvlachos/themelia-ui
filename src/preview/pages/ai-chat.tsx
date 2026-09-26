import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AiChatPage() {
	return (
		<ComponentPage>
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
				<PropTable owners={["AiChat", "AiToolCall", "AiReasoning", "AiSources", "AiCodeBlock"]} />
				<PropTable
					symbols={[
						"useAiChatScroll",
						"AiChatConversation",
						"AiChatPromptInput",
						"AiChatEmptyState",
						"AiChatQueue",
						"AiChatSuggestionsRow",
						"AiChatAttachmentsStrip",
						"AiShimmer",
						"AiChainOfThought",
						"AiTask",
						"AiAgent",
						"AiConfirmation",
						"AiArtifact",
						"AiAttachment",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
