import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useOverlayVisibility, useOverlayVisibilityGroup } from "./use-overlay-visibility"

/** useOverlayVisibility: the ref-backed setter stays stable, sees the newest value and ignores no-ops. */
describe("useOverlayVisibility", () => {
	it("opens and closes", () => {
		const { result } = renderHook(() => useOverlayVisibility())

		expect(result.current.open).toBe(false)
		act(() => result.current.show())
		expect(result.current.open).toBe(true)
		act(() => result.current.hide())
		expect(result.current.open).toBe(false)
	})

	it("toggles from the value it currently has", () => {
		const { result } = renderHook(() => useOverlayVisibility())

		act(() => result.current.toggle())
		expect(result.current.open).toBe(true)
		act(() => result.current.toggle())
		expect(result.current.open).toBe(false)
	})

	it("a setter captured on the first render reads the newest value", () => {
		/* A setter captured on an earlier render must not act on a stale `open`. */
		const { result } = renderHook(() => useOverlayVisibility())
		const toggleFromFirstRender = result.current.toggle

		act(() => result.current.show())
		act(() => toggleFromFirstRender())

		expect(result.current.open).toBe(false)
	})

	it("does not report a change that is not one", () => {
		const onOpenChange = vi.fn()
		const { result } = renderHook(() => useOverlayVisibility({ onOpenChange }))

		act(() => result.current.hide())
		expect(onOpenChange).not.toHaveBeenCalled()

		act(() => result.current.show())
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true)
	})

	it("reports onOpen and onClose on the transition only", () => {
		const onOpen = vi.fn()
		const onClose = vi.fn()
		const { result } = renderHook(() => useOverlayVisibility({ onOpen, onClose }))

		act(() => result.current.show())
		act(() => result.current.show())
		expect(onOpen).toHaveBeenCalledTimes(1)

		act(() => result.current.hide())
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it("stays controlled when the caller owns `open`", () => {
		const onOpenChange = vi.fn()
		const { result } = renderHook(() => useOverlayVisibility({ open: false, onOpenChange }))

		act(() => result.current.show())
		/* The caller owns it; the hook reports and does not write. */
		expect(onOpenChange).toHaveBeenCalledWith(true)
		expect(result.current.open).toBe(false)
	})

	it("hands the trigger exactly the open/onOpenChange pair", () => {
		const { result } = renderHook(() => useOverlayVisibility())

		expect(Object.keys(result.current.overlayProps).sort()).toEqual(["onOpenChange", "open"])
		act(() => result.current.overlayProps.onOpenChange(true))
		expect(result.current.open).toBe(true)
	})
})

describe("useOverlayVisibilityGroup", () => {
	it("tracks each key independently", () => {
		const { result } = renderHook(() => useOverlayVisibilityGroup(["create", "edit"]))

		act(() => result.current.create.show())
		expect(result.current.create.open).toBe(true)
		expect(result.current.edit.open).toBe(false)
	})

	it("closes the others when asked to", () => {
		const { result } = renderHook(() =>
			useOverlayVisibilityGroup(["create", "edit"], { closeOthersOnOpen: true }),
		)

		act(() => result.current.create.show())
		act(() => result.current.edit.show())

		expect(result.current.edit.open).toBe(true)
		expect(result.current.create.open).toBe(false)
	})

	it("a setter captured early still reads the newest group state", () => {
		const { result } = renderHook(() => useOverlayVisibilityGroup(["create", "edit"]))
		const toggleCreate = result.current.create.toggle

		act(() => result.current.create.show())
		act(() => toggleCreate())

		expect(result.current.create.open).toBe(false)
	})
})
