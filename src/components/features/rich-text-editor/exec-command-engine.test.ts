// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"

import { createExecCommandEngine } from "./exec-command-engine"
import { describeRichTextEngine } from "./rich-text-engine.contract"

describe("createExecCommandEngine", () => {
	describeRichTextEngine((initialHtml) => {
		const element = document.createElement("div")
		element.contentEditable = "true"
		element.innerHTML = initialHtml
		document.body.append(element)
		const engine = createExecCommandEngine(element)
		return {
			engine,
			cleanup: () => {
				engine.destroy()
				element.remove()
			},
		}
	})
})

describe("legacy engine shell compatibility", () => {
	const cleanups: Array<() => void> = []
	afterEach(() => {
		for (const cleanup of cleanups.splice(0)) cleanup()
		window.getSelection()?.removeAllRanges()
	})

	function setup(html = "<p>Hello</p>") {
		const element = document.createElement("div")
		element.setAttribute("contenteditable", "true")
		element.innerHTML = html
		const host = document.createElement("div")
		document.body.append(element, host)
		const engine = createExecCommandEngine(element)
		cleanups.push(() => { engine.destroy(); element.remove(); host.remove() })
		return { engine, element, host }
	}

	function selectText(element: HTMLElement, offset: number) {
		const range = document.createRange()
		range.setStart(element.querySelector("p")!.firstChild!, offset)
		range.collapse(true)
		// jsdom has real ranges and selections, but does not implement layout geometry.
		Object.defineProperty(range, "getBoundingClientRect", { value: () => new DOMRect() })
		window.getSelection()!.removeAllRanges()
		window.getSelection()!.addRange(range)
	}

	it("mounts the original editable and reads user input from that same node", () => {
		const { engine, element, host } = setup()
		expect(engine.mount?.(host)).toBe(element)
		expect(engine.mount?.(host)).toBe(element)
		expect(host.children).toHaveLength(1)
		expect(host.firstElementChild).toBe(element)
		engine.getState()
		element.innerHTML = "<p>Typed</p>"
		element.dispatchEvent(new Event("input", { bubbles: true }))
		expect(engine.getState().html).toBe("<p>Typed</p>")
	})

	it("detaches its mounted view and remounts the same document", () => {
		const { engine, element, host } = setup()
		engine.mount?.(host)
		engine.unmount?.()
		expect(element.isConnected).toBe(false)
		expect(host.childElementCount).toBe(0)
		engine.setHtml("<p>Updated while detached</p>")
		expect(() => engine.unmount?.()).not.toThrow()
		expect(engine.mount?.(host)).toBe(element)
		expect(element.textContent).toBe("Updated while detached")
	})

	it("changes editability on the original editable", () => {
		const { engine, element } = setup()
		engine.setEditable?.(false)
		expect(element.getAttribute("contenteditable")).toBe("false")
		engine.setEditable?.(true)
		expect(element.getAttribute("contenteditable")).toBe("true")
	})

	it("inserts at the caret and invalidates the state before subscribers read it", () => {
		const { engine, element } = setup()
		const before = engine.getState()
		const observed: string[] = []
		engine.subscribe(() => observed.push(engine.getState().html))
		selectText(element, 5)
		engine.insertHtml?.("<strong> world</strong>")
		expect(element.innerHTML).toBe("<p>Hello<strong> world</strong></p>")
		expect(engine.getState()).not.toBe(before)
		expect(observed).toEqual(["<p>Hello<strong> world</strong></p>"])
	})

	it("replaces a local trigger and publishes the complete replacement", () => {
		const { engine, element } = setup("<p>Hello @mar</p>")
		const observed: string[] = []
		engine.subscribe(() => observed.push(engine.getState().html))
		engine.getState()
		selectText(element, 10)
		engine.replaceBeforeCaret?.(4, "<strong>Maria</strong>")
		expect(element.innerHTML).toBe("<p>Hello <strong>Maria</strong></p>")
		expect(observed).toEqual(["<p>Hello <strong>Maria</strong></p>"])
	})

	it("reads only its own caret and cannot replace text in another editor", () => {
		const first = setup("<p>Hello @mar</p>")
		const second = setup("<p>Other @sam</p>")
		selectText(first.element, 10)
		expect(first.engine.getCaretContext?.()).toMatchObject({ textBefore: "Hello @mar" })
		expect(second.engine.getCaretContext?.()).toBeNull()
		second.engine.replaceBeforeCaret?.(4, "wrong editor")
		expect(first.element.innerHTML).toBe("<p>Hello @mar</p>")
		expect(second.element.innerHTML).toBe("<p>Other @sam</p>")
	})

	it("preserves standalone DOM ownership while making late calls harmless after disposal", () => {
		const { engine, element, host } = setup()
		engine.destroy()
		expect(element.isConnected).toBe(true)
		expect(() => {
			engine.destroy()
			engine.mount?.(host)
			engine.unmount?.()
			engine.setHtml("changed")
			engine.insertHtml?.("changed")
			engine.replaceBeforeCaret?.(2, "changed")
			engine.setEditable?.(false)
			engine.focus()
			engine.execute("bold")
		}).not.toThrow()
		expect(element.innerHTML).toBe("<p>Hello</p>")
		expect(host.childElementCount).toBe(0)
		expect(engine.getCaretContext?.()).toBeNull()
	})

	it("removes a mounted view when disposed", () => {
		const { engine, element, host } = setup()
		engine.mount?.(host)
		engine.destroy()
		expect(element.isConnected).toBe(false)
		expect(host.childElementCount).toBe(0)
	})
})
