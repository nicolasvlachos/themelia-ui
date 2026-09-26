import { describe, expect, it } from "vitest"

import { applyDrawGlobals } from "./map-draw-globals"

/** applyDrawGlobals writes leaflet-draw's shared globals and its cleanup restores them exactly. */
/*
 * Un-annotated on purpose: inference keeps `prototype.options` required, so assertions need
 * not reach through the optional that `LeafletDrawGlobals` declares.
 */
function stubLeaflet() {
	const drawLocal = {
		edit: {
			handlers: {
				edit: { tooltip: { text: "Drag handles to edit", subtext: "" } },
				remove: { tooltip: { text: "Click a feature to remove" } },
			},
		},
	}
	const L = {
		Edit: {
			PolyVerticesEdit: {
				prototype: {
					options: { icon: "leaflet-default", touchIcon: "leaflet-touch" } as Record<string, unknown>,
				},
				mergeOptions(options: Record<string, unknown>) {
					Object.assign(this.prototype.options, options)
				},
			},
			/* No options of its own: the "was absent" case. */
			SimpleShape: {
				prototype: { options: {} as Record<string, unknown> },
				mergeOptions(options: Record<string, unknown>) {
					Object.assign(this.prototype.options, options)
				},
			},
		},
		drawLocal,
	}
	return {
		...L,
		snapshot: () =>
			JSON.stringify({
				poly: L.Edit.PolyVerticesEdit.prototype.options,
				simple: L.Edit.SimpleShape.prototype.options,
				local: drawLocal,
			}),
	}
}

const english = {
	handleIcon: "icon-en",
	drawError: { color: "red" },
	editInstructions: "Drag handles to edit",
	removeInstructions: "Click to remove",
}
const german = {
	handleIcon: "icon-de",
	drawError: { color: "red" },
	editInstructions: "Ziehen Sie die Griffe",
	removeInstructions: "Zum Entfernen klicken",
}

describe("applyDrawGlobals", () => {
	it("writes the icons and the copy", () => {
		const L = stubLeaflet()
		applyDrawGlobals(L, english)

		expect(L.Edit.PolyVerticesEdit.prototype.options).toMatchObject({
			icon: "icon-en",
			touchIcon: "icon-en",
			drawError: { color: "red" },
		})
		expect(L.Edit.SimpleShape.prototype.options).toMatchObject({
			moveIcon: "icon-en",
			resizeIcon: "icon-en",
		})
		expect(L.drawLocal.edit.handlers.edit.tooltip).toEqual({
			text: "Drag handles to edit",
			subtext: "",
		})
	})

	it("restores everything exactly on cleanup", () => {
		const L = stubLeaflet()
		const before = L.snapshot()

		const restore = applyDrawGlobals(L, english)
		expect(L.snapshot(), "sanity: it did change something").not.toBe(before)

		restore()
		expect(L.snapshot()).toBe(before)
	})

	it("removes a key that was not there, rather than leaving undefined", () => {
		/* Restoring an absent key must delete it: leaflet-draw checks presence, not value. */
		const L = stubLeaflet()
		applyDrawGlobals(L, english)()

		expect("moveIcon" in L.Edit.SimpleShape.prototype.options).toBe(false)
	})

	it("keeps a value it did not write", () => {
		const L = stubLeaflet()
		L.Edit.PolyVerticesEdit.prototype.options.somethingElse = "consumer's own"

		applyDrawGlobals(L, english)()

		expect(L.Edit.PolyVerticesEdit.prototype.options.somethingElse).toBe("consumer's own")
	})

	it("a second locale replaces the first, and unwinds to the original", () => {
		/* Two maps: mount English, switch to German (a strings change re-runs the effect), unmount; the page ends where it began. */
		const L = stubLeaflet()
		const before = L.snapshot()

		const undoEnglish = applyDrawGlobals(L, english)
		undoEnglish()
		const undoGerman = applyDrawGlobals(L, german)

		expect(L.drawLocal.edit.handlers.edit.tooltip).toEqual({
			text: "Ziehen Sie die Griffe",
			subtext: "",
		})

		undoGerman()
		expect(L.snapshot()).toBe(before)
	})

	it("nested applications unwind to the original", () => {
		/* Two maps mounted at once, the inner one cleaning up first. */
		const L = stubLeaflet()
		const before = L.snapshot()

		const outer = applyDrawGlobals(L, english)
		const inner = applyDrawGlobals(L, german)

		inner()
		expect(L.drawLocal.edit.handlers.edit.tooltip).toEqual({
			text: "Drag handles to edit",
			subtext: "",
		})

		outer()
		expect(L.snapshot()).toBe(before)
	})
})
