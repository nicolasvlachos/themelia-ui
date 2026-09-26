import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ReactNode } from "react"

import { createFilterCache, type FilterCache } from "./filter-cache"
import { FilterProvider } from "./filter-context"
import { useAsyncOptions } from "./use-async-options"
import { FilterType, type FilterConfig } from "./filters.types"

/** The async-options lifecycle over time: stale responses, aborts, cache hits and `refetch`. */
/*
 * Unique keys per test. Build the filter object once per test, not in the render callback:
 * `config` is an effect dependency, so a fresh object re-runs the fetch.
 */
let keys = 0

/** A provider, so the cache outlives the hook the way it does around a real popover. */
function wrapper(cache?: FilterCache) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<FilterProvider filters={[]} activeFilters={[]} onFilterChange={() => {}} cache={cache}>
				{children}
			</FilterProvider>
		)
	}
}

type Fetcher = NonNullable<FilterConfig["asyncConfig"]>["fetcher"]

function makeFilter(fetcher: Fetcher, key = `owner-${++keys}`): FilterConfig {
	return {
		key,
		label: "Owner",
		type: FilterType.SELECT,
		asyncConfig: {
			fetcher,
			mapToOption: (item: unknown) => item as { value: string; label: string },
			debounceMs: 0,
			staleTime: 60_000,
			preload: true,
		},
	} as unknown as FilterConfig
}

const option = (value: string) => ({ value, label: value })

beforeEach(() => {
	vi.useRealTimers()
})

describe("useAsyncOptions", () => {
	it("fetches and reports the mapped options", async () => {
		const fetcher = vi.fn(async () => [option("ada")])
		const filter = makeFilter(fetcher)
		const { result } = renderHook(() => useAsyncOptions(filter, "", true))

		await waitFor(() => expect(result.current.options).toEqual([option("ada")]))
		expect(result.current.isError).toBe(false)
		expect(result.current.isFetching).toBe(false)
	})

	it("does not fetch while inactive", async () => {
		const fetcher = vi.fn(async () => [option("ada")])
		const filter = makeFilter(fetcher)
		renderHook(() => useAsyncOptions(filter, "", false))

		await new Promise((resolve) => setTimeout(resolve, 30))
		expect(fetcher).not.toHaveBeenCalled()
	})

	it("reports not-fetching as soon as it stops qualifying", async () => {
		/*
		 * The flag is derived rather than reset in the effect, so a filter that stops
		 * qualifying never shows a spinner for a render.
		 */
		const fetcher = vi.fn(async () => [option("ada")])
		const filter = makeFilter(fetcher)
		const { result, rerender } = renderHook(
			({ active }) => useAsyncOptions(filter, "", active),
			{ initialProps: { active: true } },
		)
		await waitFor(() => expect(result.current.options).toHaveLength(1))

		rerender({ active: false })
		expect(result.current.isFetching).toBe(false)
		expect(result.current.isLoading).toBe(false)
	})

	it("drops a response that arrives after a newer request started", async () => {
		/* The request id: a slow first response must not overwrite the second. */
		const resolvers: Array<(items: Array<{ value: string; label: string }>) => void> = []
		const fetcher = vi.fn(
			() => new Promise<Array<{ value: string; label: string }>>((resolve) => resolvers.push(resolve)),
		)
		const filter = makeFilter(fetcher)
		const { result, rerender } = renderHook(
			({ search }) => useAsyncOptions(filter, search, true),
			{ initialProps: { search: "a" } },
		)
		await waitFor(() => expect(resolvers).toHaveLength(1))

		rerender({ search: "ab" })
		await waitFor(() => expect(resolvers).toHaveLength(2))

		/* The SECOND settles first, then the stale first arrives. */
		await act(async () => {
			resolvers[1]!([option("second")])
		})
		await act(async () => {
			resolvers[0]!([option("first")])
		})

		expect(result.current.options).toEqual([option("second")])
	})

	it("does not report an abort as an error", async () => {
		const onError = vi.fn()
		const fetcher = vi.fn(async ({ signal }: { signal?: AbortSignal }) => {
			await new Promise((resolve) => setTimeout(resolve, 5))
			if (signal?.aborted) {
				const error = new Error("aborted")
				error.name = "AbortError"
				throw error
			}
			return [option("ada")]
		})
		const filter = makeFilter(fetcher)
		const { unmount } = renderHook(() => useAsyncOptions(filter, "", true, { onError }))

		unmount()
		await new Promise((resolve) => setTimeout(resolve, 30))
		expect(onError).not.toHaveBeenCalled()
	})

	it("reports a real failure through onError and clears the options", async () => {
		const onError = vi.fn()
		const fetcher = vi.fn(async () => {
			throw new Error("network")
		})
		const filter = makeFilter(fetcher)
		const { result } = renderHook(() => useAsyncOptions(filter, "", true, { onError }))

		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(result.current.options).toEqual([])
		expect(onError).toHaveBeenCalledWith(
			expect.any(Error),
			expect.objectContaining({ phase: "fetch-options", filterKey: filter.key }),
		)
	})

	it("serves a second identical query from the cache without refetching", async () => {
		/* Stands for the popover unmounting while the provider (and its cache) lives on. */
		const cache = createFilterCache()
		const fetcher = vi.fn(async () => [option("ada")])
		const shared = makeFilter(fetcher, "cached-owner")

		const first = renderHook(() => useAsyncOptions(shared, "", true), { wrapper: wrapper(cache) })
		await waitFor(() => expect(first.result.current.options).toHaveLength(1))
		expect(fetcher).toHaveBeenCalledTimes(1)
		first.unmount()

		const second = renderHook(() => useAsyncOptions(shared, "", true), { wrapper: wrapper(cache) })
		await waitFor(() => expect(second.result.current.options).toEqual([option("ada")]))
		/* The cache answered; the fetcher was not called again. */
		expect(fetcher).toHaveBeenCalledTimes(1)
	})

	it("does not serve one provider's results to another", async () => {
		/* Two roots with different fetchers behind the same filter key must not share results. */
		const key = "shared-key"
		const hostFetcher = vi.fn(async () => [option("host")])
		const widgetFetcher = vi.fn(async () => [option("widget")])
		/* Built once. `config` is an effect dependency, so a fresh object each render refetches. */
		const hostFilter = makeFilter(hostFetcher, key)
		const widgetFilter = makeFilter(widgetFetcher, key)

		const host = renderHook(() => useAsyncOptions(hostFilter, "", true), { wrapper: wrapper() })
		await waitFor(() => expect(host.result.current.options).toEqual([option("host")]))

		const widget = renderHook(() => useAsyncOptions(widgetFilter, "", true), {
			wrapper: wrapper(),
		})
		await waitFor(() => expect(widget.result.current.options).toEqual([option("widget")]))

		expect(hostFetcher).toHaveBeenCalledTimes(1)
		expect(widgetFetcher).toHaveBeenCalledTimes(1)
	})

	it("shares results across roots when — and only when — a cache is handed to both", async () => {
		/* Persistence across navigation is available, but as a decision somebody made. */
		const cache = createFilterCache()
		const key = "explicitly-shared"
		const fetcher = vi.fn(async () => [option("ada")])
		const firstFilter = makeFilter(fetcher, key)
		const secondFilter = makeFilter(fetcher, key)

		const first = renderHook(() => useAsyncOptions(firstFilter, "", true), {
			wrapper: wrapper(cache),
		})
		await waitFor(() => expect(first.result.current.options).toHaveLength(1))

		const second = renderHook(() => useAsyncOptions(secondFilter, "", true), {
			wrapper: wrapper(cache),
		})
		await waitFor(() => expect(second.result.current.options).toEqual([option("ada")]))

		expect(fetcher).toHaveBeenCalledTimes(1)
	})

	it("serves a cached query without refetching when the SEARCH changes back", async () => {
		/* Changes the query on a live hook (a remount would seed from the cache and hide the bug). */
		const fetcher = vi.fn(async ({ query }: { query: string }) => [option(query || "empty")])
		const filter = makeFilter(fetcher)
		const { result, rerender } = renderHook(
			({ search }) => useAsyncOptions(filter, search, true),
			{ initialProps: { search: "ada" } },
		)
		await waitFor(() => expect(result.current.options).toEqual([option("ada")]))

		rerender({ search: "bob" })
		await waitFor(() => expect(result.current.options).toEqual([option("bob")]))
		const afterTwo = fetcher.mock.calls.length

		/* Back to a cached query: wait out the debounce, then assert no further fetch. */
		rerender({ search: "ada" })
		await waitFor(() => expect(result.current.options).toEqual([option("ada")]))
		expect(result.current.isFetching).toBe(false)
		expect(fetcher.mock.calls.length).toBe(afterTwo)
	})

	it("refetch bypasses the cache", async () => {
		let call = 0
		const fetcher = vi.fn(async () => [option(`call-${++call}`)])
		const filter = makeFilter(fetcher)
		const { result } = renderHook(() => useAsyncOptions(filter, "", true))
		await waitFor(() => expect(result.current.options).toHaveLength(1))
		const before = fetcher.mock.calls.length

		act(() => result.current.refetch())
		await waitFor(() => expect(fetcher.mock.calls.length).toBe(before + 1))
	})

	it("withholds the query below the minimum length", async () => {
		const fetcher = vi.fn(async () => [option("ada")])
		const filter = makeFilter(fetcher)
		filter.asyncConfig!.minQueryLength = 3

		const { result } = renderHook(() => useAsyncOptions(filter, "ab", true))
		await new Promise((resolve) => setTimeout(resolve, 30))

		expect(result.current.isBelowMinQuery).toBe(true)
		expect(result.current.minQueryLength).toBe(3)
		expect(fetcher).not.toHaveBeenCalled()
	})
})
