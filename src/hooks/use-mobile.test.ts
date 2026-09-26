import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useIsMobile } from "./use-mobile"

/**
 * `useIsMobile` reports the width it is given and re-reports when the query fires. jsdom
 * has no layout, so `matchMedia` is stubbed and `innerWidth` set directly.
 */
let listeners: Array<() => void>

beforeEach(() => {
	listeners = []
	vi.stubGlobal("matchMedia", () => ({
		addEventListener: (_: string, fn: () => void) => listeners.push(fn),
		removeEventListener: (_: string, fn: () => void) => {
			listeners = listeners.filter((l) => l !== fn)
		},
	}))
})

const setWidth = (width: number) => {
	Object.defineProperty(window, "innerWidth", { value: width, configurable: true })
}

describe("useIsMobile", () => {
	it("reports mobile below the breakpoint", () => {
		setWidth(500)
		const { result } = renderHook(() => useIsMobile())
		expect(result.current).toBe(true)
	})

	it("reports desktop at and above the breakpoint", () => {
		setWidth(768)
		const { result } = renderHook(() => useIsMobile())
		expect(result.current).toBe(false)
	})

	it("is correct on the FIRST render, not one render later", () => {
		/* Correct on the first render, with no desktop-first frame. */
		setWidth(400)
		const renders: boolean[] = []
		renderHook(() => {
			const value = useIsMobile()
			renders.push(value)
			return value
		})
		expect(renders[0]).toBe(true)
	})

	it("re-reports when the query fires", () => {
		setWidth(1200)
		const { result } = renderHook(() => useIsMobile())
		expect(result.current).toBe(false)

		setWidth(400)
		act(() => listeners.forEach((fn) => fn()))
		expect(result.current).toBe(true)
	})

	it("unsubscribes on unmount", () => {
		setWidth(400)
		const { unmount } = renderHook(() => useIsMobile())
		expect(listeners).toHaveLength(1)
		unmount()
		expect(listeners).toHaveLength(0)
	})
})
