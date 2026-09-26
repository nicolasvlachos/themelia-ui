import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useOverlayActions } from "./use-overlay-actions"

describe("overlay action lifecycle", () => {
	it("allows only one confirmation and blocks cancellation while it runs", async () => {
		let finish!: () => void
		const close = vi.fn()
		const onCancel = vi.fn()
		const onAsyncConfirm = vi.fn(() => new Promise<void>((resolve) => { finish = resolve }))
		const { result } = renderHook(() => useOverlayActions({ close, onCancel, onAsyncConfirm }))
		let pending!: void | Promise<void>
		act(() => { pending = result.current.confirm(); void result.current.confirm(); result.current.cancel() })
		expect(onAsyncConfirm).toHaveBeenCalledTimes(1)
		expect(onCancel).not.toHaveBeenCalled()
		expect(close).not.toHaveBeenCalled()
		await act(async () => { finish(); await pending })
		expect(close).toHaveBeenCalledTimes(1)
		expect(result.current.busy).toBe(false)
	})

	it("routes synchronous errors without closing and allows another attempt", async () => {
		const error = new Error("Save failed")
		const onConfirm = vi.fn().mockImplementationOnce(() => { throw error })
		const close = vi.fn()
		const onError = vi.fn()
		const { result } = renderHook(() => useOverlayActions({ close, onConfirm, onError }))
		await act(async () => { await result.current.confirm() })
		expect(onError).toHaveBeenCalledWith(error)
		expect(close).not.toHaveBeenCalled()
		await act(async () => { await result.current.confirm() })
		expect(close).toHaveBeenCalledTimes(1)
	})

	it("does not close an unmounted surface when its request resolves", async () => {
		let finish!: () => void
		const close = vi.fn()
		const { result, unmount } = renderHook(() => useOverlayActions({ close, onAsyncConfirm: () => new Promise<void>((resolve) => { finish = resolve }) }))
		let pending!: void | Promise<void>
		act(() => { pending = result.current.confirm() })
		unmount()
		await act(async () => { finish(); await pending })
		expect(close).not.toHaveBeenCalled()
	})
	it("does not close a reopened surface when the earlier session finishes", async () => {
		let finish!: () => void
		const close = vi.fn()
		const onAsyncConfirm = () => new Promise<void>((resolve) => { finish = resolve })
		const { result, rerender } = renderHook(({ open }) => useOverlayActions({ close, open, onAsyncConfirm }), { initialProps: { open: true } })
		let pending!: void | Promise<void>
		act(() => { pending = result.current.confirm() })
		rerender({ open: false })
		rerender({ open: true })
		await act(async () => { finish(); await pending })
		expect(close).not.toHaveBeenCalled()
		expect(result.current.busy).toBe(false)
	})

})
