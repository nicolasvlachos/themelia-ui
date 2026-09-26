import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useObjectUrls } from "./use-object-urls"

/**
 * Blob URL lifetime: a stubbed `URL` records the order of create against revoke. Old URLs
 * must be revoked only after their replacements exist.
 */
let created: string[]
let revoked: string[]

beforeEach(() => {
	created = []
	revoked = []
	let n = 0
	vi.stubGlobal("URL", {
		...URL,
		createObjectURL: vi.fn(() => {
			const url = `blob:${++n}`
			created.push(url)
			return url
		}),
		revokeObjectURL: vi.fn((url: string) => revoked.push(url)),
	})
})

const file = (name: string) => new File([name], name)

describe("useObjectUrls", () => {
	it("creates one URL per file", () => {
		const { result } = renderHook(({ files }) => useObjectUrls(files), {
			initialProps: { files: [file("a"), file("b")] },
		})

		expect(result.current).toHaveLength(2)
		expect(created).toEqual(["blob:1", "blob:2"])
		expect(revoked).toEqual([])
	})

	it("does not recreate URLs when the array is rebuilt with the same files", () => {
		const a = file("a")
		const { result, rerender } = renderHook(({ files }) => useObjectUrls(files), {
			initialProps: { files: [a] },
		})
		const first = result.current

		/* A new array of the same files. */
		rerender({ files: [a] })

		expect(result.current).toEqual(first)
		expect(created).toEqual(["blob:1"])
		expect(revoked).toEqual([])
	})

	it("revokes the old URLs only after the new ones exist", () => {
		const { result, rerender } = renderHook(({ files }) => useObjectUrls(files), {
			initialProps: { files: [file("a")] },
		})
		expect(result.current).toEqual(["blob:1"])

		rerender({ files: [file("b")] })

		expect(result.current).toEqual(["blob:2"])
		/* Created before the old one was dropped, never the reverse. */
		expect(created).toEqual(["blob:1", "blob:2"])
		expect(revoked).toEqual(["blob:1"])
	})

	it("handles an empty set without revoking anything twice", () => {
		const { result, rerender } = renderHook(({ files }) => useObjectUrls(files), {
			initialProps: { files: [file("a")] },
		})

		rerender({ files: [] })
		expect(result.current).toEqual([])
		expect(revoked).toEqual(["blob:1"])

		rerender({ files: [] })
		expect(revoked).toEqual(["blob:1"])
	})
})
