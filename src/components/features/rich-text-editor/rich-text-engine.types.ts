/**
 * The seam between the editor's chrome (toolbar, source view, counts, footer, strings) and
 * whatever edits the document. A consumer with its own model (ProseMirror, Lexical, TipTap)
 * supplies an engine and keeps the chrome. Commands are named intents, not engine-specific
 * strings, so no engine has to reimplement another's spelling.
 */
import type { RichTextCaretContext } from "./rich-text-editor.types"

export type RichTextCommand =
	| "bold"
	| "italic"
	| "underline"
	| "strike"
	| "bulletList"
	| "orderedList"
	| "blockquote"
	| "undo"
	| "redo"

export interface RichTextEngineState {
	/** The document as HTML; what the consumer's `onValueChange` receives. */
	html: string
	canUndo: boolean
	canRedo: boolean
	/** Which commands apply at the caret, for the toolbar's pressed state. */
	active: ReadonlySet<RichTextCommand>
}

export interface RichTextEngine {
	/** Attaches an engine-owned view and returns its actual editable element. */
	mount?(element: HTMLElement): HTMLElement
	/** Detaches the view while retaining the document, selection, and undo history. */
	unmount?(): void
	/** Updates whether the engine-owned view accepts user edits. */
	setEditable?(editable: boolean): void
	/**
	 * The current state, returning the same object until something changes: the shell reads
	 * it through `useSyncExternalStore`, and a fresh object per call re-renders forever.
	 */
	getState(): RichTextEngineState
	setHtml(html: string): void
	/** Inserts HTML at the engine's selection through its document model. */
	insertHtml?(html: string): void
	/** Reads a focused, collapsed caret after the last atom or line break in its text block. */
	getCaretContext?(): RichTextCaretContext | null
	/** Replaces text before a collapsed caret without crossing its text block or inline atoms. */
	replaceBeforeCaret?(length: number, html: string): void
	focus(): void
	execute(command: RichTextCommand): void
	/** Returns an unsubscribe. The shell reads through `useSyncExternalStore`. */
	subscribe(listener: () => void): () => void
	/** Idempotent, including when already unmounted. */
	destroy(): void
}
