/**
 * The legacy engine: `document.execCommand` against a contenteditable, kept for existing
 * integrations (RichTextEditor defaults to TipTap).
 *
 * @experimental The engine, not the contract. `RichTextEngine` is stable.
 */
import { insertHtmlAtCaret, readCaretContext, replaceBeforeCaret as replaceDOMBeforeCaret } from "./editor-dom"
import type { RichTextCommand, RichTextEngine, RichTextEngineState } from "./rich-text-engine.types"

/** Our command names to the browser's. */
const NATIVE: Record<RichTextCommand, string> = {
	bold: "bold",
	italic: "italic",
	underline: "underline",
	strike: "strikeThrough",
	bulletList: "insertUnorderedList",
	orderedList: "insertOrderedList",
	/* No native blockquote command; the browser spelling is `formatBlock`. */
	blockquote: "formatBlock",
	undo: "undo",
	redo: "redo",
}

/** Reported by `queryCommandState`; the rest are answered from the DOM or not at all. */
const QUERYABLE: RichTextCommand[] = ["bold", "italic", "underline", "strike", "bulletList", "orderedList"]

const hasDocument = () => typeof document !== "undefined"

/** Guard the command, not just the document: jsdom has a `document` but no `execCommand`. */
const canExec = () => hasDocument() && typeof document.execCommand === "function"
const canQuery = () => hasDocument() && typeof document.queryCommandState === "function"

/** Whether a command reports itself active. `queryCommandState` throws in some browsers. */
function queryActive(command: RichTextCommand): boolean {
	if (!canQuery()) return false
	try {
		return document.queryCommandState(NATIVE[command])
	} catch {
		return false
	}
}

/** Blockquote has no command state, so the caret's ancestors are the only answer. */
function caretInBlockquote(root: HTMLElement): boolean {
	if (!hasDocument()) return false
	const selection = document.getSelection()
	let node = selection?.anchorNode ?? null
	while (node && node !== root) {
		if (node instanceof HTMLElement && node.tagName === "BLOCKQUOTE") return true
		node = node.parentNode
	}
	return false
}

export function createExecCommandEngine(element: HTMLElement): RichTextEngine {
	const listeners = new Set<() => void>()
	let destroyed = false
	let mountedHost: HTMLElement | null = null
	const empty: RichTextEngineState = { html: "", canUndo: false, canRedo: false, active: new Set() }

	/*
	 * Cached and invalidated on notify: `useSyncExternalStore` compares by identity, and a
	 * fresh object per call re-renders forever.
	 */
	let snapshot: RichTextEngineState | null = null

	const notify = () => {
		if (destroyed) return
		snapshot = null
		for (const listener of [...listeners]) listener()
	}
	const ownsSelection = () => hasDocument() && element.contains(document.getSelection()?.anchorNode ?? null)
	const unmount = () => {
		// A standalone caller owns its element. Detach only a view mounted into a host.
		if (mountedHost && mountedHost !== element && element.parentNode === mountedHost) element.remove()
		mountedHost = null
	}

	/*
	 * `input` covers typing and every command; `selectionchange` fires on the document and
	 * keeps the toolbar's pressed state current.
	 */
	const onInput = () => notify()
	const onSelectionChange = () => {
		if (ownsSelection()) notify()
	}

	element.addEventListener("input", onInput)
	if (hasDocument()) document.addEventListener("selectionchange", onSelectionChange)

	return {
		mount(host) {
			if (destroyed) return element
			if (host !== element && element.parentNode !== host) host.append(element)
			mountedHost = host
			return element
		},

		unmount,

		setEditable(editable) {
			if (destroyed) return
			element.setAttribute("contenteditable", String(editable))
		},

		getState(): RichTextEngineState {
			if (destroyed) return empty
			if (snapshot) return snapshot
			const active = new Set<RichTextCommand>()
			for (const command of QUERYABLE) if (queryActive(command)) active.add(command)
			if (caretInBlockquote(element)) active.add("blockquote")
			snapshot = {
				html: element.innerHTML,
				/* The browser owns the undo stack and does not report its depth, so both stay enabled. */
				canUndo: true,
				canRedo: true,
				active,
			}
			return snapshot
		},

		setHtml(html: string) {
			if (destroyed) return
			if (element.innerHTML !== html) {
				element.innerHTML = html
				notify()
			}
		},

		insertHtml(html) {
			if (destroyed) return
			const selection = document.getSelection()
			const range = selection?.rangeCount ? selection.getRangeAt(0) : null
			const savedRange = range && element.contains(range.commonAncestorContainer) ? range.cloneRange() : null
			// Focusing a previously blurred contenteditable can reset its DOM selection.
			element.focus()
			selection?.removeAllRanges()
			if (savedRange) selection?.addRange(savedRange)
			insertHtmlAtCaret(element, html)
			// Range mutations do not dispatch the input event that normally invalidates state.
			notify()
		},

		getCaretContext() {
			if (destroyed || !ownsSelection()) return null
			return readCaretContext()
		},

		replaceBeforeCaret(length, html) {
			if (destroyed || !ownsSelection() || !Number.isFinite(length)) return
			replaceDOMBeforeCaret(Math.max(0, Math.floor(length)), html, () => {})
			notify()
		},

		focus() {
			if (destroyed) return
			element.focus()
		},

		execute(command: RichTextCommand) {
			if (destroyed || !canExec()) return
			element.focus()
			if (command === "blockquote") {
				/* `formatBlock` has no off switch: leaving a blockquote means switching to <p>. */
				document.execCommand("formatBlock", false, caretInBlockquote(element) ? "<p>" : "<blockquote>")
			} else {
				document.execCommand(NATIVE[command], false, undefined)
			}
			notify()
		},

		subscribe(listener: () => void) {
			if (destroyed) return () => {}
			listeners.add(listener)
			return () => listeners.delete(listener)
		},

		destroy() {
			/* Idempotent, so unmount order does not matter. */
			if (destroyed) return
			unmount()
			destroyed = true
			snapshot = null
			element.removeEventListener("input", onInput)
			if (hasDocument()) document.removeEventListener("selectionchange", onSelectionChange)
			listeners.clear()
		},
	}
}
