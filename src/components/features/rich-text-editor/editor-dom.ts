/** The editor's DOM work (caret introspection, range surgery), kept pure and out of React. */
import type { RichTextCaretContext } from "./rich-text-editor.types"

/** Elements that end a block when reading text before the caret. */
const BLOCK_BOUNDARY = "p, li, h1, h2, h3, h4, h5, h6, blockquote"

/** An empty document, in the shapes a browser leaves behind. */
const EMPTY_HTML = new Set(["", "<p></p>", "<p><br></p>", "<br>", "<div><br></div>"])

/**
 * `""` for an empty document, whatever shape the browser left it in; the placeholder,
 * submit state and `isEmpty()` all depend on it.
 */
export function normalizeHtml(value: string): string {
	const trimmed = value.trim()
	return EMPTY_HTML.has(trimmed) ? "" : trimmed
}

/** The inverse: seeds an empty paragraph so the first block command has something to act on. */
export function toEditorContent(value: string): string {
	const normalized = normalizeHtml(value)
	return normalized === "" ? "<p></p>" : normalized
}

/**
 * A plain-text projection for counting. Block ends become a space (so paragraphs do not
 * merge words); inline tags collapse to nothing. Not a sanitiser: the output never reaches
 * the DOM.
 */
export function htmlToText(html: string): string {
	return html
		.replace(/<\/(?:p|div|li|h[1-6]|blockquote|pre)>/gi, " ")
		.replace(/<br\s*\/?>/gi, " ")
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
}

/**
 * Reads the text between the start of the caret's block and the caret. Stops at the block
 * boundary: a trigger is typed within a sentence.
 */
export function readCaretContext(): RichTextCaretContext | null {
	if (typeof window === "undefined") return null

	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0) return null

	const range = selection.getRangeAt(0)
	// A ranged selection is not a caret.
	if (!range.collapsed) return null

	let block: Node | null = range.startContainer
	while (block && block.nodeType !== Node.ELEMENT_NODE) block = block.parentNode
	if (!block) return null
	if (!(block as Element).closest('[contenteditable="true"]')) return null

	let text =
		range.startContainer.nodeType === Node.TEXT_NODE
			? (range.startContainer.textContent ?? "").slice(0, range.startOffset)
			: ""

	let cursor: Node | null = range.startContainer
	while (cursor && cursor !== block) {
		for (let prev = cursor.previousSibling; prev; prev = prev.previousSibling) {
			text = (prev.textContent ?? "") + text
		}
		cursor = cursor.parentNode
		if (cursor && (cursor as Element).matches?.(BLOCK_BOUNDARY)) break
	}

	const rect = range.getBoundingClientRect()
	return {
		textBefore: text,
		// An all-zero rect means the browser declined to answer.
		rect:
			rect && (rect.top || rect.left || rect.right || rect.bottom)
				? { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right }
				: undefined,
	}
}

/** The previous text node within the same block, or `null` at the boundary. */
function previousTextNode(node: Node): Node | null {
	let current: Node | null = node
	while (current) {
		if (current.previousSibling) {
			current = current.previousSibling
			while (current?.lastChild) current = current.lastChild
			if (current?.nodeType === Node.TEXT_NODE) return current
			continue
		}
		current = current.parentNode
		if (!current || (current as Element).matches?.(`${BLOCK_BOUNDARY}, [contenteditable="true"]`)) {
			return null
		}
	}
	return null
}

/**
 * Replaces the `length` characters before the caret with `html` in one operation: a range
 * over the characters is inserted over, never deleted first. Counts back through text
 * nodes, since the run may span several after a browser split.
 */
export function replaceBeforeCaret(length: number, html: string, onChange: () => void): void {
	if (typeof window === "undefined") return

	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0) return

	const caret = selection.getRangeAt(0)
	if (!caret.collapsed) return

	let remaining = length
	let startNode: Node = caret.startContainer
	let startOffset = caret.startOffset

	while (remaining > 0) {
		if (startNode.nodeType === Node.TEXT_NODE) {
			const take = Math.min(startOffset, remaining)
			startOffset -= take
			remaining -= take
			if (remaining === 0) break
		}
		const previous = previousTextNode(startNode)
		if (!previous) break
		startNode = previous
		startOffset = previous.textContent?.length ?? 0
	}

	const range = document.createRange()
	range.setStart(startNode, startOffset)
	range.setEnd(caret.endContainer, caret.endOffset)

	const editable = (startNode.parentElement ?? null)?.closest<HTMLElement>(
		'[contenteditable="true"]',
	)

	range.deleteContents()
	range.insertNode(document.createRange().createContextualFragment(html))

	// The caret lands after the inserted content.
	selection.removeAllRanges()
	range.collapse(false)
	selection.addRange(range)

	if (editable) onChange()
}

/** Inserts at the caret, or at the end when the caret is somewhere else entirely. */
export function insertHtmlAtCaret(editable: HTMLElement | null, html: string): void {
	if (typeof window === "undefined" || !editable) return
	editable.focus()

	const selection = window.getSelection()
	const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

	// No caret, or a caret elsewhere: append.
	if (!range || !editable.contains(range.commonAncestorContainer)) {
		editable.insertAdjacentHTML("beforeend", html)
		return
	}

	range.deleteContents()
	range.insertNode(document.createRange().createContextualFragment(html))
	range.collapse(false)
	selection!.removeAllRanges()
	selection!.addRange(range)
}
