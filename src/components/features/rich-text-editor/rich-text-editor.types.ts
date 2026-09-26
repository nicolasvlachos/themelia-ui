import type { RichTextEngine } from "./rich-text-engine.types"

/**
 * RichTextEditor: an editing surface with a toolbar and an imperative handle. Content is
 * controlled through `value`/`onValueChange`; the handle covers what a prop cannot (caret
 * context, replacing text before the caret). `RichTextEditorHandle` is a superset of
 * `MentionEditorHandle`, so features/mentions plugs in without an adapter.
 */
import type { ComponentType, ReactNode } from "react"

import type { RichTextEditorStrings } from "./rich-text-editor.strings"

export interface RichTextCaretContext {
	/** Text before the caret, after the last atomic inline node or line break in this block. */
	textBefore: string
	/** Where the caret is on screen, when the browser will say. */
	rect?: { top: number; left: number; bottom: number; right: number }
}

/**
 * The editor's imperative handle, for what a prop cannot do: caret context, and replacing text
 * before the caret. A superset of MentionEditorHandle, so the two plug together with no
 * adapter.
 */
export interface RichTextEditorHandle {
	focus(): void
	getHTML(): string
	setHTML(html: string): void
	/** Inserts raw HTML at the caret. */
	insertHTML(html: string): void
	isEmpty(): boolean
	clear(): void
	getCaretContext(): RichTextCaretContext | null
	/**
	 * Deletes the `length` characters before the caret and inserts `html` in their place, as
	 * one operation, not a delete then an insert: the caret never visits an in-between state,
	 * and undo gets one entry for what the writer experienced as one act.
	 */
	replaceBeforeCaret(length: number, html: string): void
}

/** A control the consumer adds to the toolbar, after the built-ins. */
export interface RichTextEditorToolbarItem {
	id: string
	icon: ComponentType<{ className?: string }>
	label: string
	onClick: () => void
	isActive?: () => boolean
	disabled?: boolean
}

/** The shape the toolbar renders. Built-ins and consumer items resolve to this. */
export interface ToolbarButtonConfig {
	id: string
	icon: ComponentType<{ className?: string }>
	label: string
	isActive: () => boolean
	run: () => void
	disabled?: boolean
}

export interface RichTextEditorProps {
	/**
	 * What edits the document. Defaults to TipTap with StarterKit and inline, atomic mentions;
	 * supply a RichTextEngine for a custom schema or implementation, and the caller owns its
	 * destruction. The chrome (toolbar, source view, counts, footer, strings) is
	 * engine-independent. Install the family's documented TipTap peers when importing the
	 * editor.
	 * @default TipTap
	 */
	engine?: RichTextEngine
	/**
	 * The document, as HTML. Controlled: parent echoes preserve the selection, and actual
	 * external changes update the document, including while it is focused. Output is normalized
	 * to the active engine's schema.
	 */
	value: string
	/** Receives the document, as HTML, after every edit. */
	onValueChange: (html: string) => void
	/**
	 * Drawn over the first line of the empty document, because a contenteditable has no
	 * placeholder attribute. Sitting over it rather than replacing the document means the caret
	 * is already in the right place.
	 */
	placeholder?: string
	/**
	 * Tightens the toolbar and shortens the body, for a composer rather than a page: a line and a
	 * half instead of a page — enough to look like it takes more than a word, without claiming a
	 * screen for a one-sentence reply.
	 */
	compact?: boolean
	minHeight?: string
	/** Where the body starts scrolling instead of growing. */
	maxHeight?: string
	disabled?: boolean
	/** Shows the word and character counts under the body. */
	showCounts?: boolean
	/**
	 * Shown as "n / max". Over the limit the count turns error-toned; input is NOT refused — a
	 * composer that stops accepting characters mid-word loses what the writer was in the middle
	 * of. The count reports, the form decides.
	 */
	maxLength?: number
	/**
	 * Appended after the built-ins, behind a rule. Each takes an icon, a label used for both the
	 * accessible name and the tooltip, and an optional `isActive`.
	 */
	extraToolbarItems?: ReadonlyArray<RichTextEditorToolbarItem>
	/**
	 * Pinned to the end of the toolbar, usually the submit control. Inside the frame, like
	 * `footerSlot`, so the composer reads as one control.
	 */
	toolbarTrailing?: ReactNode
	/**
	 * Below the body: attachment chips, a hint. Inside the frame, like `toolbarTrailing`, so the
	 * composer reads as one control.
	 */
	footerSlot?: ReactNode
	hideSourceToggle?: boolean
	autoFocus?: boolean
	className?: string
	/**
	 * Fires after every input AND every selection change; read `getCaretContext()` from the
	 * handle in response. Two events, because a caret moves without the document changing — and
	 * a trigger detector watching only input misses the writer moving back into a half-typed
	 * mention.
	 */
	onCaretChange?: () => void
	strings?: Partial<RichTextEditorStrings>
}
