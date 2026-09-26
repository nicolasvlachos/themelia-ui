import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { MediaLibraryFetchParams, MediaLibraryItem, MediaLibraryState } from "./media-library.types"
import { useMediaLibrary } from "./use-media-library"

const ASSET: MediaLibraryItem = { id: "hall", name: "Hall.jpg", type: "image", collection: "venues" }

function deferred<T>() {
	let resolve!: (value: T) => void
	let reject!: (reason: unknown) => void
	const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
	return { promise, resolve, reject }
}

describe("media-library fetch recovery", () => {
	it("preserves legacy state assignments while the hook guarantees recovery controls", () => {
		const { result } = renderHook(() => useMediaLibrary({ items: [ASSET] }))
		const legacy: Omit<MediaLibraryState, "fetchError" | "refetch"> = { ...result.current }
		Reflect.deleteProperty(legacy, "fetchError")
		Reflect.deleteProperty(legacy, "refetch")
		const state: MediaLibraryState = legacy
		expect(state.items).toEqual([ASSET])
		expect(state.refetch).toBeUndefined()
		act(() => result.current.refetch())
		expect(result.current.fetchError).toBeNull()
	})

	it("retries the current query without discarding filters, sort, or selection", async () => {
		const requests: MediaLibraryFetchParams[] = []
		const retry = deferred<MediaLibraryItem[]>()
		const failure = new Error("Temporarily offline")
		const fetcher = (params: MediaLibraryFetchParams) => {
			requests.push(params)
			return requests.length <= 2 ? Promise.reject(failure) : retry.promise
		}
		const { result } = renderHook(() => useMediaLibrary({ fetcher, defaultValue: ["hall"] }))
		await waitFor(() => expect(result.current.error).toBe(failure))
		const refetch = result.current.refetch
		expect(refetch).toBeTypeOf("function")
		act(() => {
			result.current.setQuery("hall")
			result.current.setType("image")
			result.current.setCollection("venues")
			result.current.setSort("name")
		})
		await waitFor(() => expect(result.current.error).toBe(failure))
		expect(result.current.refetch).toBe(refetch)
		act(() => refetch())
		expect(requests.at(-1)).toMatchObject({ query: "hall", type: "image", collection: "venues", sort: "name" })
		expect(requests[1]!.signal!.aborted).toBe(true)
		expect(result.current.loading).toBe(true)
		expect(result.current.error).toBeNull()
		await act(async () => retry.resolve([ASSET]))
		expect(result.current.visibleItems).toEqual([ASSET])
		expect(result.current.selectedItems).toEqual([ASSET])
		expect(result.current.query).toBe("hall")
		expect(result.current.loading).toBe(false)
	})

	it("retries an unfiltered failure without changing query state", async () => {
		let attempts = 0
		const fetcher = async () => {
			if (++attempts === 1) throw new Error("Offline")
			return [ASSET]
		}
		const { result } = renderHook(() => useMediaLibrary({ fetcher }))
		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
		act(() => result.current.refetch())
		await waitFor(() => expect(result.current.visibleItems).toEqual([ASSET]))
		expect(result.current.hasFilters).toBe(false)
		expect(result.current.fetchError).toBeNull()
	})

	it("ignores obsolete successes and failures even when the fetcher ignores abort", async () => {
		const pending = [deferred<MediaLibraryItem[]>(), deferred<MediaLibraryItem[]>(), deferred<MediaLibraryItem[]>()]
		const requests: MediaLibraryFetchParams[] = []
		const errors: unknown[] = []
		const onError = (error: unknown) => errors.push(error)
		const fetcher = (params: MediaLibraryFetchParams) => {
			requests.push(params)
			return pending[requests.length - 1]!.promise
		}
		const { result, unmount } = renderHook(() => useMediaLibrary({ fetcher, onError }))
		act(() => result.current.setQuery("old"))
		act(() => result.current.setQuery("hall"))
		expect(requests[0]!.signal!.aborted).toBe(true)
		expect(requests[1]!.signal!.aborted).toBe(true)
		await act(async () => pending[0]!.resolve([{ ...ASSET, id: "obsolete" }]))
		await act(async () => pending[1]!.reject(new Error("Obsolete failure")))
		expect(result.current.loading).toBe(true)
		expect(result.current.visibleItems).toEqual([])
		expect(result.current.error).toBeNull()
		expect(errors).toEqual([])
		await act(async () => pending[2]!.resolve([ASSET]))
		expect(result.current.visibleItems).toEqual([ASSET])
		unmount()
		expect(requests[2]!.signal!.aborted).toBe(true)
	})

	it("uses the latest error callback without restarting an in-flight request", async () => {
		const request = deferred<MediaLibraryItem[]>()
		const signals: AbortSignal[] = []
		const errors: string[] = []
		const fetcher = ({ signal }: MediaLibraryFetchParams) => { signals.push(signal!); return request.promise }
		const { result, rerender } = renderHook(({ label }) => useMediaLibrary({
			fetcher, onError: () => errors.push(label),
		}), { initialProps: { label: "first" } })
		rerender({ label: "latest" })
		expect(signals[0]!.aborted).toBe(false)
		await act(async () => request.reject(new Error("Offline")))
		expect(errors).toEqual(["latest"])
		expect(result.current.loading).toBe(false)
		expect(signals).toHaveLength(1)
	})

	it("leaves static mode usable when a pending fetcher is removed", async () => {
		const request = deferred<MediaLibraryItem[]>()
		const fetcher = () => request.promise
		const { result, rerender } = renderHook(({ remote }) => useMediaLibrary({
			items: [ASSET], fetcher: remote ? fetcher : undefined,
		}), { initialProps: { remote: true } })
		rerender({ remote: false })
		expect(result.current.loading).toBe(false)
		act(() => result.current.refetch())
		await act(async () => request.resolve([]))
		expect(result.current.visibleItems).toEqual([ASSET])
		expect(result.current.totalCount).toBe(1)
	})
})
