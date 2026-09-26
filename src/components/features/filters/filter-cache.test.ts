import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createFilterCache } from "./filter-cache"
import type { FilterOption } from "./filters.types"

/** The filter cache on its own: instances are independent, and expiry is scheduled (fake timers). */
const option = (value: string): FilterOption => ({ value, label: value })

describe("createFilterCache", () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it("returns what it was given", () => {
		const cache = createFilterCache()
		cache.setOptions("k", [option("ada")], 1_000)

		expect(cache.getOptions("k")).toEqual([option("ada")])
	})

	it("two caches do not see each other", () => {
		/* Two instances never share entries. */
		const a = createFilterCache()
		const b = createFilterCache()
		a.setOptions("same-key", [option("host")], 1_000)

		expect(b.getOptions("same-key")).toBeUndefined()
	})

	it("an entry expires on its own, at the time it was given", () => {
		const cache = createFilterCache()
		cache.setOptions("k", [option("ada")], 60_000)

		vi.advanceTimersByTime(59_999)
		expect(cache.getOptions("k"), "still fresh one millisecond early").toEqual([option("ada")])

		vi.advanceTimersByTime(1)
		expect(cache.getOptions("k"), "gone on the millisecond it was due").toBeUndefined()
	})

	it("expiry takes the entry away rather than leaving the previous query's options", () => {
		/* A stale entry must not remain readable. */
		const cache = createFilterCache()
		cache.setOptions("filter::ada", [option("ada")], 1_000)
		vi.advanceTimersByTime(1_001)

		cache.setOptions("filter::bob", [option("bob")], 1_000)

		expect(cache.getOptions("filter::ada")).toBeUndefined()
		expect(cache.getOptions("filter::bob")).toEqual([option("bob")])
	})

	it("writing again restarts the clock rather than adding a second one", () => {
		const cache = createFilterCache()
		cache.setOptions("k", [option("first")], 1_000)

		vi.advanceTimersByTime(900)
		cache.setOptions("k", [option("second")], 1_000)

		/* The first entry's timer would have fired here and taken the second entry with it. */
		vi.advanceTimersByTime(200)
		expect(cache.getOptions("k")).toEqual([option("second")])

		vi.advanceTimersByTime(801)
		expect(cache.getOptions("k")).toBeUndefined()
	})

	it("a non-finite stale time means never", () => {
		/* `setTimeout(fn, Infinity)` fires immediately; Infinity must mean "never expire". */
		const cache = createFilterCache()
		cache.setOptions("k", [option("ada")], Number.POSITIVE_INFINITY)

		vi.advanceTimersByTime(10_000_000)
		expect(cache.getOptions("k")).toEqual([option("ada")])
	})

	it("a zero or negative stale time also means never, not immediately", () => {
		const cache = createFilterCache()
		cache.setOptions("k", [option("ada")], 0)

		vi.advanceTimersByTime(1)
		expect(cache.getOptions("k")).toEqual([option("ada")])
	})

	it("deleting cancels the pending expiry", () => {
		const cache = createFilterCache()
		cache.setOptions("k", [option("first")], 1_000)
		cache.deleteOptions("k")
		cache.setOptions("k", [option("second")], 10_000)

		/* The cancelled timer would fire here and delete the entry that replaced it. */
		vi.advanceTimersByTime(1_001)
		expect(cache.getOptions("k")).toEqual([option("second")])
	})

	it("labels are remembered, and report only what is new", () => {
		const cache = createFilterCache()

		expect(cache.rememberLabels("owner", [option("ada")])).toBe(true)
		expect(cache.getLabel("owner", "ada")).toEqual(option("ada"))

		/* Writing the same labels again on every keystroke must not re-render every pill. */
		expect(cache.rememberLabels("owner", [option("ada")])).toBe(false)
		expect(cache.rememberLabels("owner", [option("ada"), option("bob")])).toBe(true)
	})

	it("labels are kept per filter key", () => {
		const cache = createFilterCache()
		cache.rememberLabels("owner", [option("ada")])

		expect(cache.getLabel("assignee", "ada")).toBeUndefined()
	})

	it("clear empties both maps and cancels the timers", () => {
		const cache = createFilterCache()
		cache.setOptions("k", [option("ada")], 1_000)
		cache.rememberLabels("owner", [option("ada")])

		cache.clear()

		expect(cache.getOptions("k")).toBeUndefined()
		expect(cache.getLabel("owner", "ada")).toBeUndefined()
		/* No pending timer should be left to fire into a cleared cache. */
		expect(vi.getTimerCount()).toBe(0)
	})
})
