import { useState } from "react"

import { Stack } from "themelia-ui/base/structure"
import { DisplayLabel, RichText, Text } from "themelia-ui/base/typography"
import { RichTextEditor } from "themelia-ui/features/rich-text-editor"

import styles from "./editor.module.css"

const SEED = "<p>Select some text and press <strong>B</strong>. The toolbar reports what the caret is inside, so the buttons light up as you move through the document.</p><ul><li>Lists work.</li><li>So does <em>emphasis</em>.</li></ul>"

export default function Editor() {
	const [body, setBody] = useState(SEED)

	return (
		<>
			<RichTextEditor
				value={body}
				onValueChange={setBody}
				placeholder="Write something…"
				showCounts
				maxLength={280}
			/>

			<Stack gap="xs">
				<DisplayLabel>Emitted HTML</DisplayLabel>
				<Text size="xs" type="secondary" className={styles.source}>
					{body || "(empty)"}
				</Text>
			</Stack>

			<Stack gap="xs">
				<DisplayLabel>Rendered through RichText</DisplayLabel>
				<RichText html={body} />
			</Stack>
		</>
	)
}
