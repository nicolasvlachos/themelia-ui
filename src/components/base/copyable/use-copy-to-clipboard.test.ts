// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useCopyToClipboard } from "./use-copy-to-clipboard"

const withClipboard = (writeText: (value: string) => Promise<void>) => {
	Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
}

afterEach(() => {
	Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true })
	vi.useRealTimers()
})

describe("useCopyToClipboard", () => {
	it("writes the value and confirms", async () => {
		const writeText = vi.fn(async () => {})
		withClipboard(writeText)
		const { result } = renderHook(() => useCopyToClipboard())

		expect(result.current.copied).toBe(false)
		await act(async () => {
			expect(await result.current.copy("hello")).toBe(true)
		})
		expect(writeText).toHaveBeenCalledWith("hello")
		expect(result.current.copied).toBe(true)
	})

	it("restarts the window on a second copy rather than inheriting the first", async () => {
		vi.useFakeTimers()
		withClipboard(async () => {})
		const { result } = renderHook(() => useCopyToClipboard({ confirmMs: 1000 }))

		await act(async () => { await result.current.copy("one") })
		await act(async () => { vi.advanceTimersByTime(900) })
		expect(result.current.copied).toBe(true)

		/* The second copy has to start its own window, not finish the first's. */
		await act(async () => { await result.current.copy("two") })
		await act(async () => { vi.advanceTimersByTime(900) })
		expect(result.current.copied).toBe(true)

		await act(async () => { vi.advanceTimersByTime(200) })
		expect(result.current.copied).toBe(false)
	})

	it("reports a failure instead of rejecting", async () => {
		const onError = vi.fn()
		withClipboard(async () => {
			throw new Error("denied")
		})
		const { result } = renderHook(() => useCopyToClipboard({ onError }))

		await act(async () => {
			expect(await result.current.copy("hello")).toBe(false)
		})
		expect(onError).toHaveBeenCalled()
		expect(result.current.copied).toBe(false)
	})

	it("says so when there is no clipboard at all", async () => {
		const onError = vi.fn()
		const { result } = renderHook(() => useCopyToClipboard({ onError }))
		await act(async () => {
			expect(await result.current.copy("hello")).toBe(false)
		})
		expect(String(onError.mock.calls[0]?.[0])).toMatch(/no clipboard/i)
	})

	it("takes a writer for environments without one", async () => {
		const write = vi.fn(async () => {})
		const { result } = renderHook(() => useCopyToClipboard({ write }))
		await act(async () => {
			expect(await result.current.copy("hello")).toBe(true)
		})
		expect(write).toHaveBeenCalledWith("hello")
	})

	it("clears its window on unmount rather than firing into a gone component", async () => {
		vi.useFakeTimers()
		const clear = vi.spyOn(window, "clearTimeout")
		withClipboard(async () => {})
		const { result, unmount } = renderHook(() => useCopyToClipboard({ confirmMs: 500 }))
		await act(async () => { await result.current.copy("hello") })

		clear.mockClear()
		unmount()
		expect(clear).toHaveBeenCalled()

		/* Nothing is left to fire, so advancing past the window is silent. */
		const errors = vi.spyOn(console, "error").mockImplementation(() => {})
		act(() => { vi.advanceTimersByTime(1000) })
		expect(errors).not.toHaveBeenCalled()
		errors.mockRestore()
		clear.mockRestore()
	})
})
