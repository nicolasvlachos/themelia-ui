import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useControllableState } from "./use-controllable-state"

/** The controlled/uncontrolled split every input runs through, in both modes. */
describe("useControllableState", () => {
	it("holds its own value when uncontrolled", () => {
		const { result } = renderHook(() => useControllableState<string>({ defaultValue: "a" }))

		expect(result.current[0]).toBe("a")
		act(() => result.current[1]("b"))
		expect(result.current[0]).toBe("b")
	})

	it("reports changes but never writes locally when controlled", () => {
		const onChange = vi.fn()
		const { result } = renderHook(() =>
			useControllableState<string>({ value: "a", defaultValue: "z", onChange }),
		)

		act(() => result.current[1]("b"))
		expect(onChange).toHaveBeenCalledWith("b")
		/* The caller owns the value, so no local write. */
		expect(result.current[0]).toBe("a")
	})

	it("calls onChange in both modes", () => {
		const onChange = vi.fn()
		const { result } = renderHook(() =>
			useControllableState<string>({ defaultValue: "a", onChange }),
		)

		act(() => result.current[1]("b"))
		expect(onChange).toHaveBeenCalledWith("b")
		expect(result.current[0]).toBe("b")
	})

	it("follows the controlled value as the caller changes it", () => {
		const { result, rerender } = renderHook(
			({ value }) => useControllableState<string>({ value, defaultValue: "z" }),
			{ initialProps: { value: "a" } },
		)

		rerender({ value: "b" })
		expect(result.current[0]).toBe("b")
	})

	it("decides controlled-ness once and does not re-read it", () => {
		/* Flipping mid-life is a caller bug; the first render decides. */
		const { result, rerender } = renderHook(
			({ value }) => useControllableState<string>({ value, defaultValue: "z" }),
			{ initialProps: { value: "a" as string | undefined } },
		)

		rerender({ value: undefined })
		act(() => result.current[1]("b"))
		/* Still treated as controlled, so the local write is still skipped. */
		expect(result.current[0]).toBeUndefined()
	})

	it("stays uncontrolled when it started that way", () => {
		const { result, rerender } = renderHook(
			({ value }) => useControllableState<string>({ value, defaultValue: "z" }),
			{ initialProps: { value: undefined as string | undefined } },
		)

		rerender({ value: "a" })
		act(() => result.current[1]("b"))
		expect(result.current[0]).toBe("b")
	})
})
