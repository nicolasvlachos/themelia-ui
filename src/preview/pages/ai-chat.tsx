import { useRef, useState } from "react"
import {
	CodeIcon, DatabaseIcon, FileTextIcon, GlobeIcon, SearchIcon, SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	AiAgent, AiArtifact, AiAttachment, AiChainOfThought, AiChat, AiCodeBlock, AiConfirmation,
	AiMessageBubble, AiReasoning, AiShimmer, AiSources, AiTask, AiToolCall,
	type AiChatAttachment, type AiChatMessageData,
} from "@/components/features"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const SAMPLE_CODE = `export function total(lines: Line[]) {
	return lines.reduce((sum, line) => sum + line.amount, 0)
}

// Rounds once, at the end — not per line.
export function formatTotal(lines: Line[]) {
	return new Intl.NumberFormat("en-IE", {
		style: "currency",
		currency: "EUR",
	}).format(total(lines) / 100)
}`

const SOURCES = [
	{ id: "s1", title: "Rounding money in JavaScript", publisher: "developer.mozilla.org", snippet: "Floating point cannot represent 0.1 exactly, so money is held in the smallest unit." },
	{ id: "s2", title: "Intl.NumberFormat currency options", publisher: "tc39.es" },
	{ id: "s3", title: "Invoice totals — internal note", publisher: "wiki.internal" },
]

const MESSAGES: AiChatMessageData[] = [
	{
		id: "m1",
		role: "user",
		authorName: "You",
		timestamp: "09:12",
		parts: [{ type: "text", content: "Why is the invoice total off by a cent on some orders?" }],
	},
	{
		id: "m2",
		role: "assistant",
		authorName: "Atlas",
		timestamp: "09:12",
		parts: [
			{
				type: "reasoning",
				content:
					"The totals are summed as floats. 0.1 + 0.2 is 0.30000000000000004, and rounding each line before summing compounds the error.",
				durationSeconds: 4,
			},
			{
				type: "tool",
				name: "search_codebase",
				status: "success",
				icon: SearchIcon,
				durationMs: 820,
				args: '{ "query": "invoice total", "path": "src/billing" }',
				result: "3 matches — invoice.ts:41, totals.ts:12, order.ts:88",
			},
			{
				type: "text",
				content:
					"Each line is rounded to two decimals before the sum, so the error compounds. Hold amounts in cents and round once, at the end.",
			},
			{ type: "code", code: SAMPLE_CODE, language: "TypeScript", filename: "totals.ts", showLineNumbers: true, highlightLines: [2, 8] },
			{ type: "sources", items: SOURCES },
		],
	},
]

const SUGGESTIONS = [
	{ id: "q1", label: "Show me the failing orders", icon: DatabaseIcon },
	{ id: "q2", label: "Write a migration", icon: CodeIcon },
	{ id: "q3", label: "Explain the rounding rule", icon: GlobeIcon },
]

const STAGED: AiChatAttachment[] = [
	{ id: "a1", name: "invoice-9921.pdf", meta: "412 KB", kind: "document" },
	{ id: "a2", name: "totals.ts", meta: "2.1 KB", kind: "code" },
	{ id: "a3", name: "upload.csv", meta: "uploading", kind: "document", progress: 0.62 },
]

const PLAN = {
	id: "t0",
	title: "Fix the rounding",
	status: "running" as const,
	rightSlot: "2 of 4",
	children: [
		{ id: "t1", title: "Move amounts to cents", status: "completed" as const },
		{ id: "t2", title: "Round once in formatTotal", status: "completed" as const },
		{ id: "t3", title: "Backfill the existing invoices", status: "running" as const },
		{ id: "t4", title: "Add a regression test", status: "queued" as const },
	],
}

const CHAIN = [
	{ id: "c1", title: "Read the failing orders", description: "Nine of 4,102 are off by one cent.", status: "completed" as const },
	{ id: "c2", title: "Compare the sums", description: "Per-line rounding, then a sum.", status: "completed" as const },
	{ id: "c3", title: "Draft the fix", status: "active" as const },
	{ id: "c4", title: "Write the test", status: "pending" as const },
]

export function AiChatPage() {
	const [input, setInput] = useState("")
	const [log, setLog] = useState<string[]>([])
	const [approval, setApproval] = useState<"pending" | "approved" | "rejected">("pending")
	const [attachments, setAttachments] = useState(STAGED)
	const [streaming, setStreaming] = useState(false)
	const [messages, setMessages] = useState<AiChatMessageData[]>(MESSAGES)
	const [activeResponseId, setActiveResponseId] = useState<string | null>(null)
	const messageSequence = useRef(0)

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

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
				id="chat"
				title="The chat"
				description="One assistant turn here is reasoning, then a tool call, then text, then the code it wrote, then the sources it read — in that order. That is why a message is a list of parts rather than a content field: the mix and the order are both real, and neither survives a single string."
				stacked
				bleed
				code={`<AiChat
  messages={messages}
  inputValue={input}
  onInputChange={setInput}
  onSubmit={({ text, attachments }) => send(text, attachments)}
  onStop={() => abort()}
  streaming={isStreaming}
  agent={{ name: "Atlas", subtitle: "model-large", status: "thinking" }}
  suggestions={suggestions}
  onPickSuggestion={(s) => setInput(String(s.label))}
/>`}
			>
				<div style={{ height: "40rem" }}>
					<AiChat
						messages={messages}
						inputValue={input}
						onInputChange={setInput}
						onSubmit={({ text }) => {
							messageSequence.current += 1
							const sequence = messageSequence.current
							const responseId = `demo-response-${sequence}`
							setMessages((current) => [
								...current,
								{
									id: `demo-user-${sequence}`,
									role: "user",
									authorName: "You",
									parts: [{ type: "text", content: text }],
								},
								{
									id: responseId,
									role: "assistant",
									authorName: "Atlas",
									parts: [],
									pending: true,
								},
							])
							note(`sent: ${text}`)
							setInput("")
							setActiveResponseId(responseId)
							setStreaming(true)
						}}
						onStop={() => {
							setMessages((current) =>
								current.map((message) =>
									message.id === activeResponseId
										? {
											...message,
											pending: false,
											parts: [{ type: "text", content: "Generation stopped." }],
										}
										: message,
								),
							)
							note("stopped generation")
							setActiveResponseId(null)
							setStreaming(false)
						}}
						streaming={streaming}
						agent={{
							name: "Atlas",
							subtitle: "model-large",
							status: streaming ? "working" : "idle",
						}}
						headerActions={
							<Button type="button" tone="neutral" buttonStyle="ghost" onClick={() => note("settings")}>
								Settings
							</Button>
						}
						suggestions={SUGGESTIONS}
						onPickSuggestion={(suggestion) => setInput(String(suggestion.label))}
						onAttach={() => note("attach")}
						onMessageCopy={(message) => note(`copied ${message.id}`)}
						onMessageRegenerate={(message) => note(`regenerate ${message.id}`)}
						queue={[
							{ id: "q1", label: "Backfill the 2025 invoices", status: "running" },
							{ id: "q2", label: "Run the billing tests" },
						]}
						onCancelQueueItem={(id) => note(`cancelled ${id}`)}
					/>
				</div>
			</Example>

			<Example
				id="turn"
				title="A turn"
				description="Text goes inside the bubble; everything else goes below it. A tool call, an artifact and a code block already carry their own border and header — put inside a bubble they are a box in a box, and the bubble's padding pushes them off the transcript's grid."
				stacked
				code={`<AiMessageBubble role="assistant" authorName="Atlas" onRegenerate={retry}>
  The totals are summed as floats.
</AiMessageBubble>

<AiShimmer>Thinking…</AiShimmer>`}
			>
				<Stack gap="lg">
					<AiMessageBubble
						role="user"
						authorName="You"
						timestamp="09:12"
					>
						Why is the invoice total off by a cent on some orders?
					</AiMessageBubble>
					<AiMessageBubble
						role="assistant"
						authorName="Atlas"
						timestamp="09:12"
						plainText="Each line is rounded before the sum, so the error compounds."
						onRegenerate={() => note("regenerate")}
					>
						Each line is rounded before the sum, so the error compounds.
					</AiMessageBubble>
					<AiMessageBubble role="system">
						Atlas switched to model-large.
					</AiMessageBubble>
					<AiShimmer />
				</Stack>
			</Example>

			<Example
				id="thinking"
				title="Reasoning and plans"
				description="Two shapes for two things a model emits. Reasoning is free-form text that streams — it opens while it is arriving and closes when it stops, because nobody rereads a trace. A chain of thought is structured steps, so it stays open and marks where the work has got to."
				stacked
				code={`<AiReasoning streaming={isThinking} durationSeconds={4}>
  {trace}
</AiReasoning>

<AiChainOfThought steps={steps} streaming />
<AiTask task={plan} />`}
			>
				<Stack gap="lg">
					<AiReasoning durationSeconds={4}>
						The totals are summed as floats. 0.1 + 0.2 is 0.30000000000000004, and rounding
						each line before summing compounds the error across a long invoice.
					</AiReasoning>
					<AiReasoning streaming>
						Checking whether the backfill needs to run per tenant…
					</AiReasoning>
					<AiChainOfThought steps={CHAIN} streaming />
					<AiTask task={PLAN} density="expanded" />
				</Stack>
			</Example>

			<Example
				id="tools"
				title="Tool calls"
				description="Every state a call passes through, and the one rule that matters: with no arguments and no result there is nothing behind the header, so it is a plain row rather than a disclosure that opens onto an empty panel."
				stacked
				code={`<AiToolCall
  name="search_codebase"
  status="success"
  durationMs={820}
  args={JSON.stringify(args, null, 2)}
  result={summary}
/>`}
			>
				<Stack gap="md">
					<AiToolCall name="read_file" status="pending" />
					<AiToolCall
						name="search_codebase"
						status="running"
						icon={SearchIcon}
						args={'{ "query": "invoice total" }'}
					/>
					<AiToolCall
						name="search_codebase"
						status="success"
						icon={SearchIcon}
						durationMs={820}
						defaultExpanded
						args={'{\n  "query": "invoice total",\n  "path": "src/billing"\n}'}
						result={"3 matches\n  invoice.ts:41\n  totals.ts:12\n  order.ts:88"}
					/>
					<AiToolCall
						name="run_migration"
						status="error"
						durationMs={14_200}
						defaultExpanded
						args={'{ "name": "amounts_to_cents" }'}
						error={"SQLSTATE 23505: duplicate key value violates unique constraint"}
					/>
				</Stack>
			</Example>

			<Example
				id="output"
				title="What it produced"
				description="Code, an artifact wrapping it, the sources behind it, and the files on a turn. No syntax highlighting — that means shipping a grammar per language, and a chat can be handed any of them; what is here is the chrome, so a consumer who wants colour runs their own highlighter and passes the result in."
				stacked
				code={`<AiArtifact title="totals.ts" subtitle="TypeScript" copyText={code} onDownload={save}>
  <AiCodeBlock code={code} language="TypeScript" showLineNumbers highlightLines={[2, 8]} />
</AiArtifact>

<AiSources sources={sources} defaultExpanded />
<AiSources sources={sources} variant="avatars" />`}
			>
				<Stack gap="lg">
					<AiArtifact
						title="totals.ts"
						subtitle="TypeScript · 11 lines"
						icon={FileTextIcon}
						copyText={SAMPLE_CODE}
						onDownload={() => note("download")}
						onOpen={() => note("open artifact")}
					>
						<AiCodeBlock
							code={SAMPLE_CODE}
							language="TypeScript"
							showLineNumbers
							highlightLines={[2, 8]}
							hideHeader
						/>
					</AiArtifact>

					<AiSources sources={SOURCES} defaultExpanded />
					<AiSources sources={SOURCES} variant="avatars" />

					<Stack direction="horizontal" gap="md" wrap>
						{attachments.map((attachment) => (
							<AiAttachment
								key={attachment.id}
								name={attachment.name}
								meta={attachment.meta}
								kind={attachment.kind}
								progress={attachment.progress}
								onOpen={() => note(`open ${attachment.name}`)}
								onRemove={() =>
									setAttachments((current) => current.filter((item) => item.id !== attachment.id))
								}
							/>
						))}
						<AiAttachment name="broken.zip" meta="upload failed" kind="archive" errored />
					</Stack>
				</Stack>
			</Example>

			<Example
				id="approval"
				title="Asking first"
				description="The one surface here that blocks the agent, so it is a polite live region: it appears after the reader has stopped watching the transcript, and a screen reader has to be told. Once answered the action row is replaced by the outcome rather than left disabled."
				stacked
				code={`<AiConfirmation
  title="Run the backfill on 4,102 invoices"
  description="Rewrites every amount into cents. Not reversible."
  tone="destructive"
  status={status}
  onApprove={approve}
  onReject={reject}
/>`}
			>
				<Stack gap="lg">
					<AiConfirmation
						title="Run the backfill on 4,102 invoices"
						description="Rewrites every stored amount into cents. There is no undo."
						tone="destructive"
						status={approval}
						onApprove={() => setApproval("approved")}
						onReject={() => setApproval("rejected")}
					/>
					{approval !== "pending" && (
						<Stack direction="horizontal" gap="md">
							<Button type="button" tone="neutral" buttonStyle="outline" onClick={() => setApproval("pending")}>
								Ask again
							</Button>
						</Stack>
					)}
					<AiAgent name="Atlas" subtitle="model-large" status="working" variant="card" />
					<AiAgent name="Scribe" icon={SparklesIcon} tone="success" status="done" />
				</Stack>
			</Example>

			<Example id="ai-chat-rules" title="Three rules" stacked>
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
				{log.length > 0 && (
					<Stack gap="none">
						{log.map((line, index) => (
							<Text key={`${line}-${index}`} size="xs" type="secondary">{line}</Text>
						))}
					</Stack>
				)}
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
