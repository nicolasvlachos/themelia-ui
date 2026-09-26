import { StrictMode } from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { clearAsyncPreviewCache, useAsyncPreview } from "./use-async-preview"
import type { AsyncPreviewShowArgs } from "./async-preview.types"

function deferred<T>() {
	let resolve!: (value: T) => void
	const promise = new Promise<T>((done) => { resolve = done })
	return { resolve, promise }
}
afterEach(() => clearAsyncPreviewCache())
describe("async preview lifecycle", () => {
	it("reuses an in-flight prefetch when opened without a cache key", async () => {
		const request = deferred<string>()
		const onShow = vi.fn(() => request.promise)
		const { result } = renderHook(() => useAsyncPreview({ type: "record", context: null, onShow }))
		act(() => result.current.prefetch())
		act(() => result.current.setOpen(true))
		expect(onShow).toHaveBeenCalledTimes(1)
		await act(async () => request.resolve("ready"))
		expect(result.current.data).toBe("ready")
	})

	it("aborts on close and ignores a fetcher that resolves anyway", async () => {
		const request = deferred<string>()
		const onShow = vi.fn((_args: AsyncPreviewShowArgs<null, string>) => request.promise)
		const onData = vi.fn()
		const { result } = renderHook(() => useAsyncPreview({ type: "record", context: null, defaultOpen: true, onShow, onData }))
		act(() => result.current.close())
		expect(onShow.mock.calls[0]![0].signal.aborted).toBe(true)
		await act(async () => request.resolve("stale"))
		expect(onData).not.toHaveBeenCalled()
		expect(result.current.loading).toBe(false)
	})

	it("clears a closed record and ignores its outstanding prefetch after a key change", async () => {
		const request = deferred<string>()
		const onShow = vi.fn(() => request.promise)
		const { result, rerender } = renderHook(({ cacheKey }) => useAsyncPreview({ type: "record", context: null, cacheKey, onShow }), { initialProps: { cacheKey: "a" } })
		act(() => result.current.prefetch())
		rerender({ cacheKey: "b" })
		await act(async () => request.resolve("record a"))
		expect(result.current.data).toBeNull()
		expect(result.current.status).toBe("idle")
	})

	it("finishes a default-open request in StrictMode", async () => {
		const { result } = renderHook(() => useAsyncPreview({ type: "record", context: null, defaultOpen: true, onShow: async () => "ready" }), { wrapper: StrictMode })
		await waitFor(() => expect(result.current.status).toBe("success"))
	})
	it("retains a hover loading state through parent renders and opens with one request", async () => {
		const request = deferred<string>()
		const fetcher = vi.fn(() => request.promise)
		const { result, rerender } = renderHook(() => useAsyncPreview({ type: "record", context: null, onShow: () => fetcher() }))
		act(() => result.current.prefetch())
		rerender()
		expect(result.current.status).toBe("loading")
		act(() => result.current.setOpen(true))
		expect(result.current.status).toBe("loading")
		expect(fetcher).toHaveBeenCalledTimes(1)
		await act(async () => request.resolve("ready"))
		expect(result.current.data).toBe("ready")
	})

	it("revalidates a completed prefetch when its cached record has expired", async () => {
		let now = 1000
		const clock = vi.spyOn(Date, "now").mockImplementation(() => now)
		try {
			const onShow = vi.fn(async () => "ready")
			const { result } = renderHook(() => useAsyncPreview({ type: "record", context: null, cacheKey: "expiry", staleTime: 10, onShow }))
			await act(async () => result.current.prefetch())
			now += 20
			await act(async () => result.current.setOpen(true))
			expect(onShow).toHaveBeenCalledTimes(2)
		} finally { clock.mockRestore() }
	})

})
