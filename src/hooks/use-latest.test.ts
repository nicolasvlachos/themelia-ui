import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useLatest } from "./use-latest"

describe("useLatest", () => {
	it("holds the initial value on the first render", () => {
		const { result } = renderHook(() => useLatest("a"))
		expect(result.current.current).toBe("a")
	})

	it("holds the newest value after a re-render", () => {
		const { result, rerender } = renderHook(({ value }) => useLatest(value), {
			initialProps: { value: "a" },
		})

		rerender({ value: "b" })
		expect(result.current.current).toBe("b")
	})

	it("keeps one ref identity across renders", () => {
		/* A callback closing over the ref never goes stale and never has to be rebuilt. */
		const { result, rerender } = renderHook(({ value }) => useLatest(value), {
			initialProps: { value: "a" },
		})
		const first = result.current

		rerender({ value: "b" })
		expect(result.current).toBe(first)
	})

	it("lets a callback captured on the first render read the newest value", () => {
		const { result, rerender } = renderHook(({ value }) => {
			const latest = useLatest(value)
			return { latest, read: () => latest.current }
		}, { initialProps: { value: "a" } })

		const readFromFirstRender = result.current.read
		rerender({ value: "b" })

		let seen = ""
		act(() => {
			seen = readFromFirstRender()
		})
		expect(seen).toBe("b")
	})
})
