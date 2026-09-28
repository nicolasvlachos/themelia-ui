import { useState } from "react"
import { FileTextIcon } from "lucide-react"

import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { AiArtifact, AiAttachment, AiCodeBlock, AiSources } from "themelia-ui/features/ai-chat"

import { SAMPLE_CODE, SOURCES, STAGED } from "./data"

export default function Output() {
	const [attachments, setAttachments] = useState(STAGED)
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
			<Stack>
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

				<Stack direction="horizontal" gap="sm" wrap>
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
