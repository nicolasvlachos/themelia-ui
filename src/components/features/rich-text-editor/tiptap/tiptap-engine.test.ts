// @vitest-environment jsdom
import type { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import { afterEach, describe, expect, it, vi } from "vitest"

import { describeRichTextEngine } from "../rich-text-engine.contract"
import { createTiptapEngine, type TiptapEngineOptions } from "./tiptap-engine"

/* The same contract suite the built-in engine runs (rich-text-engine.contract.ts). */
describe("createTiptapEngine", () => {
	describeRichTextEngine((initialHtml) => {
		const element = document.createElement("div")
		document.body.append(element)
		const engine = createTiptapEngine({ element, content: initialHtml })
		return {
			engine,
			cleanup: () => {
				engine.destroy()
				element.remove()
			},
		}
	})
})

describe("TipTap document editing", () => {
	const cleanups: Array<() => void> = []
	afterEach(() => {
		for (const cleanup of cleanups.splice(0)) cleanup()
	})

	function setup(content = "<p>hello</p>", extensions?: TiptapEngineOptions["extensions"]) {
		const host = document.createElement("div")
		document.body.append(host)
		const engine = createTiptapEngine({ element: host, content, extensions })
		const editable = host.querySelector<HTMLElement>("[contenteditable]")!
		// TipTap deliberately exposes its editor on the view DOM; selections stay real.
		const editor = (editable as HTMLElement & { editor: Editor }).editor
		cleanups.push(() => { engine.destroy(); host.remove() })
		return { engine, editor, host, editable }
	}

	it.each([
		["bold", "<strong>hello</strong>"],
		["italic", "<em>hello</em>"],
		["underline", "<u>hello</u>"],
		["strike", "<s>hello</s>"],
	] as const)("applies %s and reports its active state", (command, html) => {
		const { engine, editor } = setup()
		editor.commands.setTextSelection({ from: 1, to: 6 })
		engine.execute(command)
		expect(engine.getState().html).toBe(`<p>${html}</p>`)
		expect(engine.getState().active.has(command)).toBe(true)
		engine.execute(command)
		expect(engine.getState().html).toBe("<p>hello</p>")
		expect(engine.getState().active.has(command)).toBe(false)
	})

	it("inserts formatted content and restores it through undo and redo", () => {
		const { engine, editor } = setup()
		editor.commands.setTextSelection(6)
		expect(engine.getState()).toMatchObject({ canUndo: false, canRedo: false })
		engine.insertHtml?.("<strong> world</strong>")
		expect(engine.getState().html).toBe("<p>hello<strong> world</strong></p>")
		expect(engine.getState()).toMatchObject({ canUndo: true, canRedo: false })
		engine.execute("undo")
		expect(engine.getState().html).toBe("<p>hello</p>")
		expect(engine.getState()).toMatchObject({ canUndo: false, canRedo: true })
		engine.execute("redo")
		expect(engine.getState().html).toBe("<p>hello<strong> world</strong></p>")
		expect(engine.getState()).toMatchObject({ canUndo: true, canRedo: false })
	})

	it("replaces a selected range through a document transaction", () => {
		const { engine, editor } = setup()
		editor.commands.setTextSelection({ from: 2, to: 5 })
		engine.insertHtml?.("<em>i</em>")
		expect(engine.getState().html).toBe("<p>h<em>i</em>o</p>")
	})

	it("replaces a trigger spanning marks with an atomic mention in one undo step", () => {
		const { engine, editor } = setup("<p>Hi @<strong>ma</strong>r</p>")
		editor.commands.setTextSelection(8)
		const mention = '<span data-ref-id="user:17" data-ref-kind="user" data-ref-tone="info" contenteditable="false">@Maria</span>&nbsp;'
		engine.replaceBeforeCaret?.(4, mention)
		expect(engine.getState().html).toBe(`<p>Hi ${mention}</p>`)
		expect(editor.state.selection.empty).toBe(true)
		expect(editor.state.doc.firstChild?.child(1).isAtom).toBe(true)
		engine.execute("undo")
		expect(engine.getState().html).toBe("<p>Hi @<strong>ma</strong>r</p>")
		expect(engine.getState().canUndo).toBe(false)
		engine.execute("redo")
		expect(engine.getState().html).toBe(`<p>Hi ${mention}</p>`)
	})

	it("clamps replacement to the current block and ignores a noncollapsed selection", () => {
		const { engine, editor } = setup("<p>Keep me</p><p>@mar</p>")
		editor.commands.setTextSelection(14)
		engine.replaceBeforeCaret?.(1000, "Maria")
		expect(engine.getState().html).toBe("<p>Keep me</p><p>Maria</p>")
		editor.commands.setTextSelection({ from: 10, to: 15 })
		engine.replaceBeforeCaret?.(2, "ignored")
		expect(engine.getState().html).toBe("<p>Keep me</p><p>Maria</p>")
	})

	it("reads the editable text run after the last mention or hard break", () => {
		const mention = '<span data-ref-id="user:17" data-ref-kind="user" contenteditable="false">@Maria</span>'
		const { engine, editor } = setup(`<p>Earlier block</p><p>${mention}<br>Hello <strong>@mar</strong></p>`)
		editor.view.focus()
		editor.commands.setTextSelection(editor.state.doc.content.size - 1)
		expect(engine.getCaretContext?.()).toMatchObject({ textBefore: "Hello @mar" })
		editor.commands.setTextSelection({ from: 1, to: 3 })
		expect(engine.getCaretContext?.()).toBeNull()
	})

	it("does not expose an existing mention label as a new editable trigger", () => {
		const mention = '<span data-ref-id="user:17" data-ref-kind="user" contenteditable="false">@Maria</span>'
		const { engine, editor } = setup(`<p>Hello ${mention}</p>`)
		editor.view.focus()
		editor.commands.setTextSelection(8)
		expect(engine.getCaretContext?.()).toMatchObject({ textBefore: "" })
		engine.replaceBeforeCaret?.(6, "!")
		expect(engine.getState().html).toBe(`<p>Hello ${mention}!</p>`)
		editor.commands.setNodeSelection(7)
		expect(engine.getCaretContext?.()).toBeNull()
	})

	it("replaces a following trigger across marks without touching the prior chip or words", () => {
		const existing = '<span data-ref-id="user:17" data-ref-kind="user" contenteditable="false">@Maria</span>'
		const replacement = '<span data-ref-id="user:18" data-ref-kind="user" contenteditable="false">@New person</span>'
		const { engine, editor } = setup(`<p>Hello ${existing} @<strong>ne</strong>w</p>`)
		editor.view.focus()
		editor.commands.setTextSelection(editor.state.doc.content.size - 1)
		expect(engine.getCaretContext?.()).toMatchObject({ textBefore: " @new" })
		engine.replaceBeforeCaret?.(4, replacement)
		expect(engine.getState().html).toBe(`<p>Hello ${existing} ${replacement}</p>`)
	})

	it.each([
		'<span data-ref-id="user:17" contenteditable="false">@Maria</span>',
		"<br>",
	])("clamps replacement after an inline boundary: %s", (boundary) => {
		const { engine, editor } = setup(`<p>Hello ${boundary}@new</p>`)
		editor.commands.setTextSelection(editor.state.doc.content.size - 1)
		engine.replaceBeforeCaret?.(1000, "New person")
		expect(engine.getState().html).toBe(`<p>Hello ${boundary}New person</p>`)
	})

	it("uses UTF-16 text offsets when replacing a Unicode trigger after an atom", () => {
		const mention = '<span data-ref-id="user:17" contenteditable="false">@Maria</span>'
		const { engine, editor } = setup(`<p>Hello 🌍 ${mention} 🧭 @𐐀na</p>`)
		editor.view.focus()
		editor.commands.setTextSelection(editor.state.doc.content.size - 1)
		expect(engine.getCaretContext?.()).toMatchObject({ textBefore: " 🧭 @𐐀na" })
		engine.replaceBeforeCaret?.(5, "Ana")
		expect(engine.getState().html).toBe(`<p>Hello 🌍 ${mention} 🧭 Ana</p>`)
	})

	it("returns no caret after focus moves outside the editor", () => {
		const { engine, editor } = setup("<p>@mar</p>")
		editor.view.focus()
		editor.commands.setTextSelection(5)
		expect(engine.getCaretContext?.()).toMatchObject({ textBefore: "@mar" })
		const other = document.createElement("button")
		document.body.append(other)
		cleanups.push(() => other.remove())
		other.focus()
		expect(engine.getCaretContext?.()).toBeNull()
	})

	it("returns no caret when the DOM selection belongs to another editor", () => {
		const { engine, editor } = setup("<p>@mar</p>")
		editor.view.focus()
		editor.commands.setTextSelection(5)
		const other = document.createElement("div")
		other.textContent = "Elsewhere"
		document.body.append(other)
		cleanups.push(() => other.remove())
		const range = document.createRange()
		range.setStart(other.firstChild!, 3)
		range.collapse(true)
		window.getSelection()!.removeAllRanges()
		window.getSelection()!.addRange(range)
		expect(engine.getCaretContext?.()).toBeNull()
	})

	it("preserves stored mention attributes and treats each mention as one deletable node", () => {
		const mention = '<span data-ref-id="user:17" data-ref-kind="user" data-ref-tone="info" contenteditable="false">@Maria &amp; Lee</span>'
		const { engine, editor } = setup(`<p>${mention} done</p>`)
		expect(engine.getState().html).toBe(`<p>${mention} done</p>`)
		editor.commands.deleteRange({ from: 1, to: 2 })
		expect(engine.getState().html).toBe("<p> done</p>")
		engine.execute("undo")
		expect(engine.getState().html).toBe(`<p>${mention} done</p>`)
	})

	it("retains linked mention identity, label, tone and destination", () => {
		const mention = '<a data-ref-id="user:17" data-ref-kind="user" data-ref-tone="info" href="/people/17" contenteditable="false">@Maria</a>'
		const { engine, editor } = setup(`<p>Hello ${mention}</p>`)
		const html = document.createElement("div")
		html.innerHTML = engine.getState().html
		const link = html.querySelector("a[data-ref-id]")
		expect(link?.textContent).toBe("@Maria")
		expect(link?.getAttribute("data-ref-kind")).toBe("user")
		expect(link?.getAttribute("data-ref-tone")).toBe("info")
		expect(link?.getAttribute("href")).toBe("/people/17")
		expect(link?.getAttribute("contenteditable")).toBe("false")
		expect(editor.state.doc.firstChild?.child(1).isAtom).toBe(true)
	})

	it.each(["javascript:alert(1)", "java&#x09;script:alert(1)", "data:text/html,unsafe", "//outside.example/person"])("drops unsafe mention destinations: %s", (href) => {
		const { engine, editable } = setup(`<p><a data-ref-id="user:17" href="${href}">@Maria</a></p>`)
		const mention = editable.querySelector("[data-ref-id]")
		expect(mention?.getAttribute("data-ref-id")).toBe("user:17")
		expect(mention?.textContent).toBe("@Maria")
		expect(mention?.hasAttribute("href")).toBe(false)
		expect(engine.getState().html).not.toContain("href=")
	})

	it("does not create history or reset selection for equivalent schema-normalized HTML", () => {
		const { engine, editor } = setup("<ul><li>One</li><li>Two</li></ul>")
		editor.commands.setTextSelection(4)
		const snapshot = engine.getState()
		engine.setHtml("<ul><li>One</li><li>Two</li></ul>")
		expect(engine.getState()).toBe(snapshot)
		expect(engine.getState().canUndo).toBe(false)
		expect(editor.state.selection.from).toBe(4)
	})

	it("keeps mention replacement as an undo step after typing the trigger", () => {
		const { engine, editor } = setup("<p>Hi</p>")
		editor.commands.setTextSelection(3)
		editor.commands.insertContent(" @mar")
		engine.replaceBeforeCaret?.(4, '<span data-ref-id="user:17" data-ref-kind="user" contenteditable="false">@Maria</span>')
		engine.execute("undo")
		expect(engine.getState().html).toBe("<p>Hi @mar</p>")
	})

	it("mounts the actual editable once and preserves selection and history across remounts", () => {
		const { engine, editor, editable, host } = setup()
		expect(engine.mount?.(host)).toBe(editable)
		expect(host.querySelectorAll("[contenteditable]")).toHaveLength(1)
		editor.commands.setTextSelection(6)
		engine.insertHtml?.(" world")
		engine.unmount?.()
		expect(host.childElementCount).toBe(0)
		expect(engine.getState().html).toBe("<p>hello world</p>")
		const remounted = engine.mount?.(host)
		expect(remounted?.parentElement).toBe(host)
		expect(editor.state.selection.from).toBe(12)
		expect(engine.getState().canUndo).toBe(true)
		engine.execute("undo")
		expect(engine.getState().html).toBe("<p>hello</p>")
	})

	it("updates content and editability while unmounted", () => {
		const { engine, host } = setup()
		engine.unmount?.()
		engine.setEditable?.(false)
		engine.setHtml("<p>Changed in source mode</p>")
		const editable = engine.mount?.(host)
		expect(editable?.getAttribute("contenteditable")).toBe("false")
		expect(editable?.textContent).toBe("Changed in source mode")
		engine.setEditable?.(true)
		expect(editable?.getAttribute("contenteditable")).toBe("true")
	})

	it("does not focus a destroyed view when remounting before a pending focus", () => {
		vi.useFakeTimers()
		try {
			const { engine, host } = setup()
			engine.focus()
			engine.unmount?.()
			engine.mount?.(host)
			expect(() => vi.runAllTimers()).not.toThrow()
		} finally {
			vi.useRealTimers()
		}
	})

	it("leaves schema ownership with custom extensions and tolerates missing toolbar commands", () => {
		const { engine } = setup("<p>hello</p>", [StarterKit.configure({ underline: false, undoRedo: false })])
		expect(() => engine.getState()).not.toThrow()
		expect(() => engine.execute("underline")).not.toThrow()
		expect(engine.getState()).toMatchObject({ html: "<p>hello</p>", canUndo: false, canRedo: false })
	})

	it("does not inject stylesheet elements into the document", () => {
		const before = document.head.querySelectorAll("style").length
		setup()
		expect(document.head.querySelectorAll("style")).toHaveLength(before)
	})

	it("makes all capabilities harmless after disposal and releases its editable DOM", () => {
		const { engine, host } = setup()
		engine.destroy()
		expect(host.childElementCount).toBe(0)
		expect(() => {
			engine.unmount?.()
			engine.mount?.(host)
			engine.setEditable?.(true)
			engine.insertHtml?.("ignored")
			engine.replaceBeforeCaret?.(3, "ignored")
			engine.execute("undo")
			engine.focus()
		}).not.toThrow()
		expect(engine.getCaretContext?.()).toBeNull()
		expect(engine.getState()).toMatchObject({ html: "", canUndo: false, canRedo: false })
		expect(host.childElementCount).toBe(0)
	})
})
