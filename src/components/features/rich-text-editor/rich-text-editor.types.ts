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
	 * Deletes the `length` characters before the caret and inserts `html` in their place,
	 * as one operation (one undo entry, no intermediate caret state).
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
	 * What edits the document. Defaults to TipTap with StarterKit and inline mentions; the
	 * chrome (toolbar, source view, counts, footer, strings) is engine-independent. Install
	 * the family's documented TipTap peers when importing the editor.
	 */
	engine?: RichTextEngine
	/** The document, as HTML. Controlled. */
	value: string
	onValueChange: (html: string) => void
	/** Drawn over the empty document. */
	placeholder?: string
	/** Tightens the toolbar and shortens the body, for a composer rather than a page. */
	compact?: boolean
	minHeight?: string
	/** Where the body starts scrolling instead of growing. */
	maxHeight?: string
	disabled?: boolean
	showCounts?: boolean
	/** Shown as "n / max". Does not truncate: the count reports, the form decides. */
	maxLength?: number
	extraToolbarItems?: ReadonlyArray<RichTextEditorToolbarItem>
	/** Pinned to the end of the toolbar, usually the submit control. */
	toolbarTrailing?: ReactNode
	/** Below the body: attachment chips, a hint. */
	footerSlot?: ReactNode
	hideSourceToggle?: boolean
	autoFocus?: boolean
	className?: string
	/**
	 * Fires after every input and every selection change (the caret can move without the
	 * document changing); read `getCaretContext()` from the handle in response.
	 */
	onCaretChange?: () => void
	strings?: Partial<RichTextEditorStrings>
}
