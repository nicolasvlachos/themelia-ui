import { describe, expect, it } from "vitest"

import { readScrollEdges } from "./scroll-edges"

/* jsdom has no layout, so the scroll geometry is set by hand. */
function scroller(geometry: Partial<Record<"scrollWidth" | "clientWidth" | "scrollLeft" | "scrollHeight" | "clientHeight" | "scrollTop", number>>) {
	const element = document.createElement("div")
	for (const [key, value] of Object.entries(geometry)) Object.defineProperty(element, key, { value, configurable: true })
	return element
}

describe("readScrollEdges", () => {
	it("reports both ends in the middle of a horizontal scroll", () => {
		expect(readScrollEdges(scroller({ scrollWidth: 500, clientWidth: 200, scrollLeft: 150 }))).toEqual({ overflow: true, start: true, end: true })
	})

	it("reads RTL's negative scrollLeft as a distance from the start", () => {
		expect(readScrollEdges(scroller({ scrollWidth: 500, clientWidth: 200, scrollLeft: 0 }))).toEqual({ overflow: true, start: false, end: true })
		expect(readScrollEdges(scroller({ scrollWidth: 500, clientWidth: 200, scrollLeft: -300 }))).toEqual({ overflow: true, start: true, end: false })
	})

	it("allows a pixel of slack, so a fractional size still reaches its end", () => {
		expect(readScrollEdges(scroller({ scrollWidth: 201, clientWidth: 200, scrollLeft: 0 })).overflow).toBe(false)
		expect(readScrollEdges(scroller({ scrollWidth: 500, clientWidth: 200, scrollLeft: 299.5 })).end).toBe(false)
	})

	it("measures the vertical axis on request", () => {
		expect(readScrollEdges(scroller({ scrollHeight: 400, clientHeight: 100, scrollTop: 300 }), "vertical")).toEqual({ overflow: true, start: true, end: false })
	})
})
