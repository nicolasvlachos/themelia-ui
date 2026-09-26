import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useSyncedState } from "./use-synced-state"

describe("useSyncedState", () => {
	it("starts from the prop", () => {
		const { result } = renderHook(() => useSyncedState("a"))
		expect(result.current[0]).toBe("a")
	})

	it("keeps a local edit while the prop is unchanged", () => {
		const { result, rerender } = renderHook(({ value }) => useSyncedState(value), {
			initialProps: { value: "a" },
		})

		act(() => result.current[1]("edited"))
		expect(result.current[0]).toBe("edited")

		rerender({ value: "a" })
		expect(result.current[0]).toBe("edited")
	})

	it("re-seeds when the prop changes, discarding the edit", () => {
		const { result, rerender } = renderHook(({ value }) => useSyncedState(value), {
			initialProps: { value: "a" },
		})
		act(() => result.current[1]("edited"))

		rerender({ value: "b" })
		expect(result.current[0]).toBe("b")
	})

	it("re-seeds back to a value it held before", () => {
		/* Identity, not equality: going a → b → a must re-seed on the way back. */
		const { result, rerender } = renderHook(({ value }) => useSyncedState(value), {
			initialProps: { value: "a" },
		})
		rerender({ value: "b" })
		act(() => result.current[1]("edited"))
		rerender({ value: "a" })
		expect(result.current[0]).toBe("a")
	})

	it("re-seeds on a new array identity", () => {
		const first = ["x"]
		const { result, rerender } = renderHook(({ value }) => useSyncedState(value), {
			initialProps: { value: first },
		})
		act(() => result.current[1](["edited"]))

		const second = ["x"]
		rerender({ value: second })
		expect(result.current[0]).toBe(second)
	})
})
