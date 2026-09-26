// @vitest-environment jsdom
import { createRef, StrictMode, useState } from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { RichTextEditor } from "./rich-text-editor"
import type { RichTextEditorHandle } from "./rich-text-editor.types"
import { createTiptapEngine } from "./tiptap/tiptap-engine"

describe("RichTextEditor default engine", () => {
	it("mounts one TipTap document in Strict Mode with accurate initial history", async () => {
		const { container } = render(<StrictMode><RichTextEditor value="<p>Hello</p>" onValueChange={vi.fn()} /></StrictMode>)
		const editable = await screen.findByRole("textbox", { name: "Rich text editor" })
		expect(editable).toHaveClass("ProseMirror")
		expect(container.querySelectorAll(".ProseMirror")).toHaveLength(1)
		expect(editable).toHaveTextContent("Hello")
		expect(screen.getByRole("button", { name: "Undo" })).toHaveAttribute("aria-disabled", "true")
		expect(screen.getByRole("button", { name: "Redo" })).toHaveAttribute("aria-disabled", "true")
	})

	it("keeps ref operations and controlled updates on the same document", async () => {
		const ref = createRef<RichTextEditorHandle>()
		const change = vi.fn()
		const { rerender } = render(<RichTextEditor ref={ref} value="<p>First</p>" onValueChange={change} />)
		await screen.findByRole("textbox", { name: "Rich text editor" })
		act(() => ref.current!.setHTML("<p><strong>Changed</strong></p>"))
		expect(ref.current!.getHTML()).toBe("<p><strong>Changed</strong></p>")
		expect(screen.getByRole("textbox", { name: "Rich text editor" }).querySelector("strong")).toHaveTextContent("Changed")
		expect(change).toHaveBeenLastCalledWith("<p><strong>Changed</strong></p>")
		act(() => screen.getByRole("textbox", { name: "Rich text editor" }).focus())
		rerender(<RichTextEditor ref={ref} value="<p>External</p>" onValueChange={change} />)
		await waitFor(() => expect(ref.current!.getHTML()).toBe("<p>External</p>"))
		expect(change).toHaveBeenCalledTimes(1)
		act(() => ref.current!.clear())
		expect(ref.current!.isEmpty()).toBe(true)
		expect(change).toHaveBeenLastCalledWith("")
		expect(change).toHaveBeenCalledTimes(2)
	})

	it("keeps its engine mounted through repeated source-mode round trips", async () => {
		const ref = createRef<RichTextEditorHandle>()
		const { container } = render(<RichTextEditor ref={ref} value="<p>Before</p>" onValueChange={vi.fn()} />)
		const editable = await screen.findByRole("textbox", { name: "Rich text editor" })
		for (const content of ["First", "Second"]) {
			fireEvent.click(screen.getByRole("button", { name: "Source code" }))
			fireEvent.change(screen.getByRole("textbox", { name: "HTML source" }), { target: { value: `<p><em>${content}</em></p>` } })
			fireEvent.click(screen.getByRole("button", { name: "Source code" }))
			expect(screen.getByRole("textbox", { name: "Rich text editor" })).toBe(editable)
			expect(ref.current!.getHTML()).toBe(`<p><em>${content}</em></p>`)
			expect(editable.querySelector("em")).toHaveTextContent(content)
			expect(container.querySelectorAll(".ProseMirror")).toHaveLength(1)
		}
	})

	it("updates editability and accessible copy on the actual editing surface", async () => {
		const { rerender } = render(<RichTextEditor value="" onValueChange={vi.fn()} disabled />)
		expect(await screen.findByRole("textbox", { name: "Rich text editor" })).toHaveAttribute("contenteditable", "false")
		rerender(<RichTextEditor value="" onValueChange={vi.fn()} strings={{ editorLabel: "Write a reply" }} />)
		await waitFor(() => expect(screen.getByRole("textbox", { name: "Write a reply" })).toHaveAttribute("contenteditable", "true"))
	})

	it("shows external updates in source mode without restoring a stale draft on exit", async () => {
		const ref = createRef<RichTextEditorHandle>()
		const change = vi.fn()
		const { rerender } = render(<RichTextEditor ref={ref} value="<p>Before</p>" onValueChange={change} />)
		fireEvent.click(screen.getByRole("button", { name: "Source code" }))
		rerender(<RichTextEditor ref={ref} value="<p>From server</p>" onValueChange={change} />)
		expect(screen.getByRole("textbox", { name: "HTML source" })).toHaveValue("<p>From server</p>")
		expect(ref.current!.getCaretContext()).toBeNull()
		fireEvent.click(screen.getByRole("button", { name: "Source code" }))
		expect(ref.current!.getHTML()).toBe("<p>From server</p>")
		expect(change).not.toHaveBeenCalled()
	})

	it("preserves raw source typing while the parent echoes normalized HTML", () => {
		function Controlled() {
			const [value, setValue] = useState("")
			return <RichTextEditor value={value} onValueChange={setValue} />
		}
		render(<Controlled />)
		fireEvent.click(screen.getByRole("button", { name: "Source code" }))
		const source = screen.getByRole("textbox", { name: "HTML source" })
		fireEvent.change(source, { target: { value: "<p><b>Draft</b></p>" } })
		expect(source).toHaveValue("<p><b>Draft</b></p>")
		fireEvent.click(screen.getByRole("button", { name: "Source code" }))
		expect(screen.getByRole("textbox", { name: "Rich text editor" }).querySelector("strong")).toHaveTextContent("Draft")
	})

	it("mounts a supplied engine through Strict Mode without taking its ownership", () => {
		const engine = createTiptapEngine({ element: document.createElement("div"), content: "<p>Custom</p>" })
		const destroy = vi.spyOn(engine, "destroy")
		const { container, unmount } = render(<StrictMode><RichTextEditor engine={engine} value="<p>Custom</p>" onValueChange={vi.fn()} /></StrictMode>)
		expect(container.querySelectorAll(".ProseMirror")).toHaveLength(1)
		expect(screen.getByRole("textbox", { name: "Rich text editor" })).toHaveTextContent("Custom")
		unmount()
		expect(destroy).not.toHaveBeenCalled()
		expect(engine.getState().html).toBe("<p>Custom</p>")
		engine.destroy()
	})
})
