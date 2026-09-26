import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useComments } from "./use-comments"
import type { CommentSubmitHelpers } from "./comments.types"

function deferred() {
	let resolve!: () => void
	const promise = new Promise<void>((next) => {
		resolve = next
	})
	return { promise, resolve }
}

describe("useComments", () => {
	it("keeps duplicate submits locked while a reset submit callback is still settling", async () => {
		const pending = deferred()
		const onSubmit = vi.fn(async (_values, helpers) => {
			helpers.reset()
			await pending.promise
		})
		const { result } = renderHook(() => useComments({ onSubmit }))
		const values = { content: "Draft", commentableId: "42", commentableType: "booking" }

		let first!: Promise<void>
		await act(async () => {
			first = result.current.submit(values)
			await Promise.resolve()
		})

		let duplicate!: Promise<void>
		act(() => {
			duplicate = result.current.submit(values)
		})

		expect(onSubmit).toHaveBeenCalledTimes(1)

		await act(async () => {
			pending.resolve()
			await Promise.all([first, duplicate])
		})
	})

	it("ignores stale helpers and cleanup after the record scope changes", async () => {
		const first = deferred()
		const second = deferred()
		let firstHelpers: CommentSubmitHelpers | undefined
		let secondHelpers: typeof firstHelpers
		const onSubmit = vi.fn(async (values, helpers) => {
			if (values.content === "first") {
				firstHelpers = helpers
				await first.promise
			} else {
				secondHelpers = helpers
				await second.promise
			}
		})
		const { result, rerender } = renderHook(
			({ scopeKey }) => useComments({ onSubmit, scopeKey } as Parameters<typeof useComments>[0] & { scopeKey: string }),
			{ initialProps: { scopeKey: "booking:1" } },
		)

		let oldSubmit!: Promise<void>
		act(() => {
			oldSubmit = result.current.submit({ content: "first", commentableId: "1", commentableType: "booking" })
		})
		rerender({ scopeKey: "booking:2" })
		expect(result.current.isSubmitting).toBe(false)

		let newSubmit!: Promise<void>
		act(() => {
			newSubmit = result.current.submit({ content: "second", commentableId: "2", commentableType: "booking" })
		})
		expect(result.current.isSubmitting).toBe(true)
		const resetKey = result.current.resetKey

		await act(async () => {
			firstHelpers?.setErrors({ content: "Old record error" })
			firstHelpers?.reset()
			first.resolve()
			await oldSubmit
		})

		expect(result.current.isSubmitting).toBe(true)
		expect(result.current.formErrors).toEqual({})
		expect(result.current.resetKey).toBe(resetKey)

		act(() => secondHelpers?.setErrors({ content: "Current record error" }))
		expect(result.current.formErrors).toEqual({ content: "Current record error" })
		await act(async () => {
			second.resolve()
			await newSubmit
		})
		expect(result.current.isSubmitting).toBe(false)
	})
})
