import { describe, expect, it } from "vitest"

import { defaultTileLayerIsUnknown, resolveTileLayer } from "./resolve-tile-layer"

/** resolveTileLayer: an unknown `defaultTileLayer` must fall back to the first registered layer. */
const AVAILABLE = [{ name: "streets" }, { name: "satellite" }]

describe("resolveTileLayer", () => {
	it("honours a selection that names a real layer", () => {
		expect(resolveTileLayer({ selected: "satellite", available: AVAILABLE })).toBe("satellite")
	})

	it("falls back to the caller's default when nothing is selected", () => {
		expect(
			resolveTileLayer({ selected: "", defaultTileLayer: "satellite", available: AVAILABLE }),
		).toBe("satellite")
	})

	it("falls back to the first layer when nothing is asked for", () => {
		expect(resolveTileLayer({ selected: "", available: AVAILABLE })).toBe("streets")
	})

	it("shows the first layer when the default names nothing — as the error promises", () => {
		expect(
			resolveTileLayer({ selected: "typo", defaultTileLayer: "typo", available: AVAILABLE }),
		).toBe("streets")
	})

	it("draws nothing before any layer has registered", () => {
		expect(resolveTileLayer({ selected: "", defaultTileLayer: "streets", available: [] })).toBe("")
	})

	it("drops a selection whose layer has gone away", () => {
		expect(resolveTileLayer({ selected: "terrain", available: AVAILABLE })).toBe("streets")
	})
})

describe("defaultTileLayerIsUnknown", () => {
	it("is true only once layers exist and none matches", () => {
		expect(defaultTileLayerIsUnknown({ selected: "", defaultTileLayer: "typo", available: AVAILABLE })).toBe(true)
		expect(defaultTileLayerIsUnknown({ selected: "", defaultTileLayer: "streets", available: AVAILABLE })).toBe(false)
		/* Nothing registered yet is not evidence of a typo. */
		expect(defaultTileLayerIsUnknown({ selected: "", defaultTileLayer: "typo", available: [] })).toBe(false)
		expect(defaultTileLayerIsUnknown({ selected: "", available: AVAILABLE })).toBe(false)
	})
})
