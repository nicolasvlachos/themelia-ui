import { AtSignIcon, PaperclipIcon } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { RichTextEditor, type RichTextEditorHandle } from "themelia-ui/features/rich-text-editor"

export default function EditorCompact() {
	const [note, setNote] = useState("")
	const composerRef = useRef<RichTextEditorHandle>(null)

	return (
		<RichTextEditor
			ref={composerRef}
			compact
			value={note}
			onValueChange={setNote}
			placeholder="Add a note…"
			hideSourceToggle
			extraToolbarItems={[
				{
					id: "mention",
					icon: AtSignIcon,
					label: "Insert reference",
					onClick: () => composerRef.current?.insertHTML("@"),
				},
				{
					id: "attach",
					icon: PaperclipIcon,
					label: "Attach a file",
					onClick: () => undefined,
				},
			]}
			footerSlot={
				<Stack direction="horizontal" align="center" justify="between" gap="md">
					<Text size="xs" type="secondary">
						Markdown is not parsed — use the toolbar.
					</Text>
					<Button disabled={!note} onClick={() => setNote("")}>
						Post
					</Button>
				</Stack>
			}
		/>
	)
}
