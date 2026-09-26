import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useSuggestions } from "./use-suggestions"

/** The suggestion lifecycle: crossing the minimum length both ways, and stale results never landing. */
const config = <T,>(fetchData: (query: string) => Promise<T[]>, rest: object = {}) => ({
	fetchData,
	debounceMs: 0,
	...rest,
})

describe("useSuggestions", () => {
	it("fetches once the query reaches the minimum length", async () => {
		const fetchData = vi.fn(async (query: string) => [query])
		const { result } = renderHook(() => useSuggestions(config(fetchData, { minQueryLength: 2 })))

		act(() => result.current.setQuery("ab"))
		await waitFor(() => expect(result.current.items).toEqual(["ab"]))
		expect(result.current.isLoading).toBe(false)
		expect(result.current.isError).toBe(false)
	})

	it("does not fetch below the minimum length", async () => {
		const fetchData = vi.fn(async (query: string) => [query])
		const { result } = renderHook(() => useSuggestions(config(fetchData, { minQueryLength: 3 })))

		act(() => result.current.setQuery("ab"))
		await new Promise((resolve) => setTimeout(resolve, 30))

		expect(fetchData).not.toHaveBeenCalled()
		expect(result.current.items).toEqual([])
	})

	it("clears results the moment the query falls back below the minimum", async () => {
		/* An invalidated list must not render even for one frame. */
		const fetchData = vi.fn(async (query: string) => [query])
		const { result } = renderHook(() => useSuggestions(config(fetchData, { minQueryLength: 2 })))

		act(() => result.current.setQuery("ab"))
		await waitFor(() => expect(result.current.items).toEqual(["ab"]))

		act(() => result.current.setQuery("a"))
		expect(result.current.items).toEqual([])
		expect(result.current.isLoading).toBe(false)
	})

	it("clears an error when the query falls below the minimum", async () => {
		const fetchData = vi.fn(async () => {
			throw new Error("network")
		})
		const { result } = renderHook(() => useSuggestions(config(fetchData, { minQueryLength: 2 })))

		act(() => result.current.setQuery("ab"))
		await waitFor(() => expect(result.current.isError).toBe(true))

		act(() => result.current.setQuery("a"))
		expect(result.current.isError).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it("preloads on an empty query when asked", async () => {
		const fetchData = vi.fn(async (query: string) => [query || "all"])
		const { result } = renderHook(() =>
			useSuggestions(config(fetchData, { preload: true, minQueryLength: 1 })),
		)

		await waitFor(() => expect(result.current.items).toEqual(["all"]))
	})

	it("does not preload on an empty query by default", async () => {
		const fetchData = vi.fn(async (query: string) => [query || "all"])
		renderHook(() => useSuggestions(config(fetchData, { minQueryLength: 1 })))

		await new Promise((resolve) => setTimeout(resolve, 30))
		expect(fetchData).not.toHaveBeenCalled()
	})

	it("reports a failure and clears the list", async () => {
		const onError = vi.fn()
		const fetchData = vi.fn(async () => {
			throw new Error("network")
		})
		const { result } = renderHook(() =>
			useSuggestions(config(fetchData, { minQueryLength: 1, onError })),
		)

		act(() => result.current.setQuery("a"))
		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(result.current.items).toEqual([])
		expect(onError).toHaveBeenCalledWith(expect.any(Error), "a")
	})

	it("renders an empty list when a fetcher resolves to something that is not one", async () => {
		/* A fetcher bug should not crash the surface. */
		const fetchData = vi.fn(async () => "nope" as unknown as string[])
		const { result } = renderHook(() => useSuggestions(config(fetchData, { minQueryLength: 1 })))

		act(() => result.current.setQuery("a"))
		await waitFor(() => expect(fetchData).toHaveBeenCalled())
		expect(result.current.items).toEqual([])
	})

	it("retry refetches the current query", async () => {
		const fetchData = vi.fn(async (query: string) => [query])
		const { result } = renderHook(() => useSuggestions(config(fetchData, { minQueryLength: 1 })))

		act(() => result.current.setQuery("a"))
		await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1))

		act(() => result.current.retry())
		await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(2))
	})

	it("reports a query nobody has answered yet as loading, not as an empty result", async () => {
		/* Inside the debounce the hook reports loading, not an empty result. */
		const fetchData = vi.fn(async (query: string) => [query])
		const { result } = renderHook(() => useSuggestions({ fetchData, debounceMs: 60_000 }))

		act(() => result.current.setQuery("ab"))
		expect(result.current.isLoading).toBe(true)
		expect(fetchData).not.toHaveBeenCalled()
	})

	it("hides an error as soon as the query moves on from the one that failed", async () => {
		const fetchData = vi.fn(async () => {
			throw new Error("network")
		})
		const { result } = renderHook(() => useSuggestions({ fetchData, debounceMs: 60_000, preload: false }))

		act(() => result.current.setQuery("ab"))
		act(() => result.current.retry())
		await waitFor(() => expect(result.current.isError).toBe(true))

		act(() => result.current.setQuery("abc"))
		expect(result.current.isError).toBe(false)
		expect(result.current.isLoading).toBe(true)
	})

	it("does not count surrounding whitespace toward the minimum", async () => {
		const fetchData = vi.fn(async (query: string) => [query])
		const { result } = renderHook(() => useSuggestions(config(fetchData, { minQueryLength: 3 })))

		act(() => result.current.setQuery("ab  "))
		await new Promise((resolve) => setTimeout(resolve, 30))

		expect(fetchData).not.toHaveBeenCalled()
		expect(result.current.isLoading).toBe(false)
	})

	it("preloads without waiting out the debounce", async () => {
		/* Nothing was typed, so there is no burst to collapse. */
		const fetchData = vi.fn(async () => ["all"])
		const { result } = renderHook(() => useSuggestions({ fetchData, preload: true, debounceMs: 60_000 }))

		await waitFor(() => expect(result.current.items).toEqual(["all"]))
		expect(fetchData).toHaveBeenCalledWith("", expect.objectContaining({ signal: expect.any(AbortSignal) }))
	})

	it("retries without waiting out the debounce", async () => {
		let fail = true
		const fetchData = vi.fn(async (query: string) => {
			if (fail) throw new Error("network")
			return [query]
		})
		const { result } = renderHook(() => useSuggestions({ fetchData, preload: true, debounceMs: 60_000 }))
		await waitFor(() => expect(result.current.isError).toBe(true))

		fail = false
		act(() => result.current.retry())
		await waitFor(() => expect(result.current.items).toEqual([""]))
		expect(result.current.isError).toBe(false)
	})
})
