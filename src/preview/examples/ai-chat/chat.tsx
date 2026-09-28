import { useRef, useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { AiChat, type AiChatMessageData } from "themelia-ui/features/ai-chat"

import { MESSAGES, SUGGESTIONS } from "./data"

export default function Chat() {
	const [input, setInput] = useState("")
	const [streaming, setStreaming] = useState(false)
	const [messages, setMessages] = useState<AiChatMessageData[]>(MESSAGES)
	const [activeResponseId, setActiveResponseId] = useState<string | null>(null)
	const messageSequence = useRef(0)
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
			{/* The chat fills the box it is given, and the transcript scrolls inside it. */}
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
						<Button type="button" tone="neutral" appearance="ghost" onClick={() => note("settings")}>
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

			{log.length > 0 && (
				<Stack gap="none">
					{log.map((line, index) => (
						<Text key={`${line}-${index}`} size="xs" type="secondary">{line}</Text>
					))}
				</Stack>
			)}
		</>
	)
}
