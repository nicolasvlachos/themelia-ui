import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useMentions, type MentionEditorHandle } from "./use-mentions"

const resources = { user: { label: "Person", trigger: "@", suggestions: [{ id: "1", kind: "user", label: "Maria" }] } }

describe("mention dismissal", () => {
	it("does not reopen on the editor's keyup after dismissal, but permits a new query", () => {
		let textBefore = "@ma"
		const editorRef = { current: { getCaretContext: () => ({ textBefore }), insertHTML: vi.fn(), replaceBeforeCaret: vi.fn(), focus: vi.fn() } satisfies MentionEditorHandle }
		const { result } = renderHook(() => useMentions({ resources, editorRef }))
		act(() => result.current.handleCaretChange())
		expect(result.current.pickerOpen).toBe(true)
		act(() => result.current.setPickerOpen(false))
		act(() => result.current.handleCaretChange())
		expect(result.current.pickerOpen).toBe(false)
		textBefore = "@mar"
		act(() => result.current.handleCaretChange())
		expect(result.current.pickerOpen).toBe(true)
	})

	it("lets the explicit picker reopen a dismissed query", () => {
		const editorRef = { current: { getCaretContext: () => ({ textBefore: "@ma" }), insertHTML: vi.fn(), replaceBeforeCaret: vi.fn(), focus: vi.fn() } satisfies MentionEditorHandle }
		const { result } = renderHook(() => useMentions({ resources, editorRef }))
		act(() => result.current.handleCaretChange())
		act(() => result.current.setPickerOpen(false))
		act(() => result.current.setPickerOpen(true))
		expect(result.current.pickerOpen).toBe(true)
		expect(result.current.triggerActive).toBe(false)
	})
})
