/**
 * The default rich-text document engine. TipTap owns its editable DOM, transactions,
 * selection and history; the React shell owns the toolbar and surrounding controls.
 * Also available at `themelia-ui/features/rich-text-editor/tiptap` for custom schemas.
 */
import { createDocument, Editor, type Extensions } from "@tiptap/core"
import { closeHistory } from "@tiptap/pm/history"
import type { ResolvedPos } from "@tiptap/pm/model"
import StarterKit from "@tiptap/starter-kit"

import type { RichTextCaretContext } from "../rich-text-editor.types"
import type {
	RichTextCommand, RichTextEngine, RichTextEngineState,
} from "../rich-text-engine.types"
import { MentionNode } from "./mention-node"

/** Our command vocabulary mapped to TipTap's registered commands. */
const RUN = {
	bold: "toggleBold",
	italic: "toggleItalic",
	underline: "toggleUnderline",
	strike: "toggleStrike",
	bulletList: "toggleBulletList",
	orderedList: "toggleOrderedList",
	blockquote: "toggleBlockquote",
	undo: "undo",
	redo: "redo",
} as const satisfies Record<RichTextCommand, keyof Editor["commands"]>

/** The mark or node each command reports itself active as. */
const ACTIVE_AS: Partial<Record<RichTextCommand, string>> = {
	bold: "bold",
	italic: "italic",
	underline: "underline",
	strike: "strike",
	bulletList: "bulletList",
	orderedList: "orderedList",
	blockquote: "blockquote",
}

/** Only text shares JavaScript's UTF-16 offsets; inline nodes form trigger boundaries. */
function editableRunStart(caret: ResolvedPos): number {
	let offset = 0
	caret.parent.forEach((node, start) => {
		if (start < caret.parentOffset && !node.isText) offset = start + node.nodeSize
	})
	return caret.start() + offset
}

export interface TiptapEngineOptions {
	/** The element TipTap initially mounts into; `mount` can move the view later. */
	element: HTMLElement
	content?: string
	/** Replaces the default StarterKit and atomic mention schema. */
	extensions?: Extensions
}

export function createTiptapEngine({ element, content = "", extensions }: TiptapEngineOptions): RichTextEngine {
	const editor = new Editor({
		element,
		content,
		extensions: extensions ?? [StarterKit.configure({ trailingNode: false }), MentionNode],
		injectCSS: false,
	})
	const listeners = new Set<() => void>()
	let destroyed = false
	let host: HTMLElement | null = element
	let editable = editor.view.dom
	let snapshot: RichTextEngineState | null = null
	const empty: RichTextEngineState = { html: "", canUndo: false, canRedo: false, active: new Set() }

	const notify = () => {
		snapshot = null
		for (const listener of [...listeners]) listener()
	}

	// Transactions cover document edits, history operations and selection changes.
	editor.on("transaction", notify)

	const focus = () => {
		if (destroyed || !host) return
		editor.commands.focus(undefined, { scrollIntoView: false })
	}

	return {
		mount(element) {
			if (destroyed) return editable
			if (host === element) return editable
			if (host) editor.unmount()
			editor.mount(element)
			host = element
			editable = editor.view.dom
			notify()
			return editable
		},

		unmount() {
			if (destroyed || !host) return
			editor.unmount()
			host = null
		},

		setEditable(value) {
			if (destroyed) return
			editor.setEditable(value, false)
		},

		getState(): RichTextEngineState {
			if (destroyed) return empty
			// useSyncExternalStore requires a stable object until a transaction changes it.
			if (snapshot) return snapshot
			const active = new Set<RichTextCommand>()
			for (const [command, name] of Object.entries(ACTIVE_AS)) {
				if (editor.isActive(name)) active.add(command as RichTextCommand)
			}
			const available = editor.can()
			snapshot = {
				html: editor.getHTML(),
				canUndo: available.undo?.() ?? false,
				canRedo: available.redo?.() ?? false,
				active,
			}
			return snapshot
		},

		setHtml(html) {
			if (destroyed || editor.getHTML() === html) return
			const doc = createDocument(html, editor.schema, editor.options.parseOptions)
			// Controlled values can differ only in schema normalization (such as list paragraphs).
			if (editor.state.doc.eq(doc)) return
			// The transaction still updates subscribers; TipTap's separate update event is muted.
			editor.commands.setContent(doc, { emitUpdate: false })
		},

		insertHtml(html) {
			if (destroyed) return
			editor.commands.insertContent(html)
			focus()
		},

		getCaretContext(): RichTextCaretContext | null {
			if (destroyed || !host) return null
			const { view } = editor
			const domSelection = view.dom.ownerDocument.getSelection()
			if (!view.hasFocus() || !domSelection?.isCollapsed || !view.dom.contains(domSelection.anchorNode)) return null
			const { selection, doc } = editor.state
			if (!selection.empty || !selection.$from.parent.isTextblock) return null
			const textBefore = doc.textBetween(editableRunStart(selection.$from), selection.from)
			let rect: RichTextCaretContext["rect"]
			try {
				const { top, left, bottom, right } = editor.view.coordsAtPos(selection.from)
				if (top || left || bottom || right) rect = { top, left, bottom, right }
			} catch {
				// Detached documents and DOM environments without layout still provide text.
			}
			return { textBefore, rect }
		},

		replaceBeforeCaret(length, html) {
			if (destroyed || !Number.isFinite(length)) return
			const { selection } = editor.state
			if (!selection.empty || !selection.$from.parent.isTextblock) return
			const from = Math.max(editableRunStart(selection.$from), selection.from - Math.max(0, Math.floor(length)))
			editor.chain()
				.command(({ tr }) => { closeHistory(tr); return true })
				.insertContentAt({ from, to: selection.from }, html)
				.run()
			focus()
		},

		focus,

		execute(command) {
			if (destroyed) return
			// Custom schemas may intentionally omit a mark, list, or history extension.
			editor.commands[RUN[command]]?.()
			focus()
		},

		subscribe(listener) {
			if (destroyed) return () => {}
			listeners.add(listener)
			return () => { listeners.delete(listener) }
		},

		destroy() {
			if (destroyed) return
			destroyed = true
			snapshot = null
			listeners.clear()
			editor.off("transaction", notify)
			editor.destroy()
			host = null
		},
	}
}
