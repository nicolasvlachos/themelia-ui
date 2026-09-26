import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useFileDropTarget } from "./use-file-drop-target"

/** useFileDropTarget drag state, which the route-based Playwright suites cannot reach. */

/** A drag event carrying only what the hook reads. */
function dragEvent(files: File[] = []) {
	return {
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
		dataTransfer: { files, dropEffect: "none" },
	} as never
}

describe("useFileDropTarget", () => {
	it("stays highlighted while the pointer crosses into descendants", () => {
		const { result } = renderHook(() => useFileDropTarget({ onFiles: vi.fn() }))

		act(() => result.current.dropTargetProps.onDragEnter(dragEvent()))
		expect(result.current.isDragging).toBe(true)

		/* Entering a child fires enter again before the parent's leave. */
		act(() => result.current.dropTargetProps.onDragEnter(dragEvent()))
		act(() => result.current.dropTargetProps.onDragLeave(dragEvent()))
		expect(result.current.isDragging).toBe(true)

		act(() => result.current.dropTargetProps.onDragLeave(dragEvent()))
		expect(result.current.isDragging).toBe(false)
	})

	it("cannot read as highlighted once disabled mid-drag", () => {
		const { result, rerender } = renderHook(
			({ disabled }) => useFileDropTarget({ disabled, onFiles: vi.fn() }),
			{ initialProps: { disabled: false } },
		)

		act(() => result.current.dropTargetProps.onDragEnter(dragEvent()))
		expect(result.current.isDragging).toBe(true)

		rerender({ disabled: true })
		expect(result.current.isDragging).toBe(false)
	})

	it("does not carry stale depth from a drag that happened while disabled", () => {
		const { result, rerender } = renderHook(
			({ disabled }) => useFileDropTarget({ disabled, onFiles: vi.fn() }),
			{ initialProps: { disabled: true } },
		)

		/* Two enters over a disabled zone must count for nothing. */
		act(() => result.current.dropTargetProps.onDragEnter(dragEvent()))
		act(() => result.current.dropTargetProps.onDragEnter(dragEvent()))
		expect(result.current.isDragging).toBe(false)

		rerender({ disabled: false })
		act(() => result.current.dropTargetProps.onDragEnter(dragEvent()))
		expect(result.current.isDragging).toBe(true)

		/* One leave clears it — not three, which is what stale depth would cost. */
		act(() => result.current.dropTargetProps.onDragLeave(dragEvent()))
		expect(result.current.isDragging).toBe(false)
	})

	it("reports dropped files and refuses them when disabled", () => {
		const onFiles = vi.fn()
		const file = new File(["x"], "a.txt")
		const { result, rerender } = renderHook(
			({ disabled }) => useFileDropTarget({ disabled, onFiles }),
			{ initialProps: { disabled: false } },
		)

		act(() => result.current.dropTargetProps.onDrop(dragEvent([file])))
		expect(onFiles).toHaveBeenCalledWith([file])

		onFiles.mockClear()
		rerender({ disabled: true })
		act(() => result.current.dropTargetProps.onDrop(dragEvent([file])))
		expect(onFiles).not.toHaveBeenCalled()
	})

	it("swallows the event so the browser does not navigate to the file", () => {
		const { result } = renderHook(() => useFileDropTarget({ onFiles: vi.fn() }))
		const event = dragEvent() as unknown as {
			preventDefault: () => void
			stopPropagation: () => void
		}

		act(() => result.current.dropTargetProps.onDragOver(event as never))
		expect(event.preventDefault).toHaveBeenCalled()
		expect(event.stopPropagation).toHaveBeenCalled()
	})
})
