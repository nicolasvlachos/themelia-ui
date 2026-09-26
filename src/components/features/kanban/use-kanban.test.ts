import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useKanban } from "./use-kanban"

interface Card {
	id: string
}

describe("useKanban", () => {
	it("moves a same-column item to the requested final index", () => {
		const value = { todo: [{ id: "a" }, { id: "b" }, { id: "c" }] }
		const onValueChange = vi.fn()
		const onItemMove = vi.fn()
		const { result } = renderHook(() =>
			useKanban<Card>({
				value,
				onValueChange,
				getItemValue: (item) => item.id,
				onItemMove,
			}),
		)

		act(() => result.current.move({ itemId: "a", toColumnId: "todo", toIndex: 1 }))

		expect(onValueChange).toHaveBeenCalledWith({
			todo: [{ id: "b" }, { id: "a" }, { id: "c" }],
		})
		expect(onItemMove).toHaveBeenCalledWith(expect.objectContaining({
			from: { columnId: "todo", index: 0 },
			to: { columnId: "todo", index: 1 },
		}))
	})

	it("does not publish dropping the last item onto the end of its column", () => {
		const value = { todo: [{ id: "a" }, { id: "b" }, { id: "c" }] }
		const onValueChange = vi.fn()
		const onItemMove = vi.fn()
		const { result } = renderHook(() =>
			useKanban<Card>({
				value,
				onValueChange,
				getItemValue: (item) => item.id,
				onItemMove,
			}),
		)

		act(() => result.current.move({ itemId: "c", toColumnId: "todo" }))

		expect(onValueChange).not.toHaveBeenCalled()
		expect(onItemMove).not.toHaveBeenCalled()
	})
})
