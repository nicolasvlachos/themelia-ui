import { useRef, useState } from "react"
import { AtSignIcon, PaperclipIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { RichText, Text } from "@/components/base/typography"
import { RichTextEditor, type RichTextEditorHandle } from "@/components/features"

import styles from "../preview.module.css"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const SEED = "<p>Select some text and press <strong>B</strong>. The toolbar reports what the caret is inside, so the buttons light up as you move through the document.</p><ul><li>Lists work.</li><li>So does <em>emphasis</em>.</li></ul>"

export function RichTextEditorPage() {
	const [body, setBody] = useState(SEED)
	const [note, setNote] = useState("")
	const composerRef = useRef<RichTextEditorHandle>(null)

	return (
		<ComponentPage
			title="Rich text editor"
			summary="A TipTap editor with formatting, undo and redo, HTML source mode, and composition slots. The imperative handle supports inserting content and replacing mention triggers at the caret."
			importPath="@/components/features/rich-text-editor"
			exports={["RichTextEditor", "RichTextEditorHandle", "RichText", "RichTextEditorToolbar", "EditorCounts"
			]}
		>
			<Example
				id="editor"
				title="The editor"
				description="Format selected text, move between paragraphs and lists, and undo or redo changes. Formatting buttons follow the current selection; history buttons become available when there is a change to undo or redo."
				stacked
				code={`<RichTextEditor
  value={body}
  onValueChange={setBody}
  showCounts
  maxLength={280}
  placeholder="Write something…"
/>`}
			>
				<RichTextEditor
					value={body}
					onValueChange={setBody}
					placeholder="Write something…"
					showCounts
					maxLength={280}
				/>
				<Text size="xs" type="secondary" className={styles.mentionSource}>
					{body || "(empty)"}
				</Text>
			</Example>

			<Example
				id="editor-compact"
				title="compact"
				description="A shorter body for a comment box rather than a page. The submit control goes in footerSlot, under the body and inside the same frame, so it sits where CommentComposer puts it and where a reader finishing a draft looks for it. toolbarTrailing is still there for a control that belongs with the formatting buttons."
				stacked
				code={`<RichTextEditor
  compact
  value={note}
  onValueChange={setNote}
  hideSourceToggle
  footerSlot={<><AttachmentChips /><Button>Post</Button></>}
/>`}
			>
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
			</Example>

			<Example
				id="editor-output"
				title="What comes out"
				description="TipTap emits HTML normalized to its schema: paragraphs, headings, lists, quotes, code, links, supported marks and atomic mentions. Unsupported tags are removed or converted. Render stored HTML through RichText, which sanitizes on every render; the editor schema is not an application security boundary."
				stacked
				code={`<RichText html={body} />`}
			>
				<Stack gap="md">
					<RichText html={body} />
				</Stack>
			</Example>

			<Example id="editor-rule" title="TipTap by default" stacked
				code={`npm install @tiptap/core @tiptap/pm @tiptap/starter-kit`}
			>
				<Callout label="Installation">
					Install the three TipTap peers when using <code>RichTextEditor</code>,
					<code>Comments</code> or <code>Activities</code>. The default engine includes
					StarterKit and inline mention chips. Source mode uses the same schema, so it
					cannot preserve arbitrary HTML. Root and unrelated component imports do not
					load these peers.
				</Callout>
			</Example>

			<Example
				id="rich-text-engine"
				title="Custom engines"
				description="The default needs no engine prop. Use the exact TipTap factory import when configuring a custom schema. A supplied engine remains caller-owned: the shell mounts and unmounts its view, and the caller destroys it when finished. Custom extensions replace the default schema, including mentions."
				stacked
				code={`// Default: StarterKit and atomic mentions.
<RichTextEditor value={html} onValueChange={setHtml} />

// Custom schema: create after mount, outside React render.
import { useEffect, useState } from "react"
import StarterKit from "@tiptap/starter-kit"
import { RichTextEditor, type RichTextEngine } from "themelia-ui/features/rich-text-editor"
import { createTiptapEngine } from "themelia-ui/features/rich-text-editor/tiptap"

function CustomEditor() {
  const [html, setHtml] = useState("")
  const [engine, setEngine] = useState<RichTextEngine>()
  useEffect(() => {
    const next = createTiptapEngine({
      element: document.createElement("div"),
      extensions: [StarterKit.configure({ heading: false, trailingNode: false })],
    })
    setEngine(next)
    return () => next.destroy()
  }, [])
  return engine ? <RichTextEditor engine={engine} value={html} onValueChange={setHtml} /> : null
}`}
			>
				<Callout label="Engine contract">
					Custom engines expose a stable state snapshot, commands and subscriptions.
					The optional mounting, editability, insertion and caret methods let an engine
					own its editable document. <code>createExecCommandEngine</code> remains available
					for legacy integrations and retains its experimental browser-command behavior.
				</Callout>
			</Example>

			<Example id="editor-api" title="API">
				<PropTable owner="RichTextEditor"
					rows={[
						{ name: "engine", type: "RichTextEngine", default: "TipTap", description: "Defaults to StarterKit and atomic mentions. Supply a RichTextEngine for a custom schema or implementation; the caller owns its destruction." },
						{ name: "value / onValueChange", type: "string / (html: string) => void", required: true, description: "The controlled document, as HTML. Parent echoes preserve the selection. Actual external changes update the document, including while focused. Output is normalized to the active engine schema." },
						{ name: "placeholder", type: "string", description: "Drawn over the first line, because a contenteditable has no placeholder attribute. Sitting over it rather than replacing the document means the caret is already in the right place." },
						{ name: "compact", type: "boolean", default: "false", description: "A line and a half instead of a page — enough to look like it takes more than a word, without claiming a screen for a one-sentence reply." },
						{ name: "minHeight / maxHeight", type: "string", description: "maxHeight is where the body starts scrolling instead of growing." },
						{ name: "showCounts / maxLength", type: "boolean / number", description: "Over the limit the count turns error-toned; input is NOT refused. A composer that stops accepting characters mid-word loses what the writer was in the middle of." },
						{ name: "extraToolbarItems", type: "RichTextEditorToolbarItem[]", description: "Appended after the built-ins, behind a rule. Each takes an icon, a label used for both the accessible name and the tooltip, and an optional isActive." },
						{ name: "toolbarTrailing / footerSlot", type: "ReactNode", description: "The end of the toolbar, and under the body. Both inside the frame, so the composer reads as one control." },
						{ name: "onCaretChange", type: "() => void", description: "Fires on input AND on selection change. Two events, because a caret moves without the document changing — and a trigger detector watching only input misses the writer moving back into a half-typed mention." },
						{ name: "ref", type: "RichTextEditorHandle", description: "focus, getHTML, setHTML, insertHTML, isEmpty, clear, getCaretContext, replaceBeforeCaret. A superset of MentionEditorHandle, so the two plug together with no adapter." },
						{ name: "replaceBeforeCaret", type: "(length, html) => void", description: "One operation, not a delete then an insert: the caret never visits an in-between state, and undo gets one entry for what the writer experienced as one act." },
						{ name: "RichText", type: "component", description: "Renders stored rich text \u2014 the READ half of the editor. It sanitises on the way in, so content from a database or an API cannot carry script or event handlers into the page." },
						{ name: "RichTextEditorToolbar", type: "component", description: "The formatting row, exported so an editor can be mounted with the toolbar somewhere else \u2014 a sticky bar above a long document, or a shared bar over two editors." },
						{ name: "EditorCounts", type: "component", description: "The word and character counts under the editor. Separate because a limit is often shown beside a submit button rather than under the field it applies to." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
