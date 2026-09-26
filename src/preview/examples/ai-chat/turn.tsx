import { useState } from "react"

import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { AiMessageBubble, AiShimmer } from "themelia-ui/features/ai-chat"

export default function Turn() {
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
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
