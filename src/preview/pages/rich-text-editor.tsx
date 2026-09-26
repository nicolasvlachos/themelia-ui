import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function RichTextEditorPage() {
	return (
		<ComponentPage>
			<Example
				example="rich-text-editor/editor"
				title="The editor and what comes out"
				description="Format selected text, move between paragraphs and lists, and undo or redo changes. Formatting buttons follow the current selection; history buttons become available when there is a change to undo or redo. Below the editor is the HTML it emits, then that HTML rendered through RichText. TipTap normalizes its output to its schema: paragraphs, headings, lists, quotes, code, links, supported marks and atomic mentions; unsupported tags are removed or converted. Render stored HTML through RichText, which sanitizes on every render — the editor schema is not an application security boundary."
			/>

			<Example
				example="rich-text-editor/editor-compact"
				title="compact"
				description="A shorter body for a comment box rather than a page. The submit control goes in footerSlot, under the body and inside the same frame, so it sits where CommentComposer puts it and where a reader finishing a draft looks for it. toolbarTrailing is still there for a control that belongs with the formatting buttons."
			/>

			<Example id="editor-rule" title="TipTap by default"
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
				<PropTable owners={["RichTextEditor", "RichTextEditorHandle"]} />
				<PropTable symbols={["RichText", "RichTextEditorToolbar", "EditorCounts"]} />
			</Example>
		</ComponentPage>
	)
}
