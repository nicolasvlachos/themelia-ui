export { RichTextEditor } from "./rich-text-editor"
export {
	RichTextEditorToolbar, EditorCounts,
	type RichTextEditorToolbarProps, type EditorCountsProps,
} from "./rich-text-editor-toolbar"
export {
	defaultRichTextEditorStrings, type RichTextEditorStrings,
} from "./rich-text-editor.strings"
export {
	htmlToText, insertHtmlAtCaret, normalizeHtml, readCaretContext, replaceBeforeCaret,
	toEditorContent,
} from "./editor-dom"
export type {
	RichTextCaretContext,
	RichTextEditorHandle,
	RichTextEditorProps,
	RichTextEditorToolbarItem,
	ToolbarButtonConfig,
} from "./rich-text-editor.types"

/* The engine contract and the legacy adapter, kept for existing custom integrations. */
export { createExecCommandEngine } from "./exec-command-engine"
/*
 * `describeRichTextEngine` is not exported: it imports vitest, which must never reach the
 * published chunk. Tests import it by relative path.
 */
export type {
	RichTextCommand, RichTextEngine, RichTextEngineState,
} from "./rich-text-engine.types"
