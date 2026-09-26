/**
 * The Leaflet globals `MapDrawEdit` writes, and how to restore them.
 *
 * leaflet-draw reads handle icons from class prototypes and tooltip copy from a
 * module-level `drawLocal`, so per-map icons and strings require writing shared state.
 * Every value is captured first and restored on cleanup, distinguishing "had another
 * value" from "was absent", so maps (and tests) do not leak settings into each other.
 * Kept out of the effect so a stub can test it without mocking dynamic imports.
 */

/** A leaflet-draw class whose defaults live on its prototype. */
export interface MergeableDrawClass {
	prototype: { options?: Record<string, unknown> }
	mergeOptions(options: Record<string, unknown>): void
}

/** Exactly the surface this touches. */
export interface LeafletDrawGlobals {
	Edit: {
		PolyVerticesEdit: MergeableDrawClass
		SimpleShape: MergeableDrawClass
	}
	drawLocal: {
		edit: {
			handlers: {
				edit: { tooltip: unknown }
				remove: { tooltip: unknown }
			}
		}
	}
}

export interface DrawGlobalsOptions {
	/** The divIcon used for vertex, move and resize handles. */
	handleIcon: unknown
	drawError: unknown
	editInstructions: string
	removeInstructions: string
}

/** Distinguishes "the key was absent" from "the key was undefined". */
const ABSENT = Symbol("absent")

/**
 * Applies the draw globals and returns the restore function, shaped as an effect cleanup
 * (`return applyDrawGlobals(...)`) so it cannot be forgotten.
 */
export function applyDrawGlobals(
	L: LeafletDrawGlobals,
	{ handleIcon, drawError, editInstructions, removeInstructions }: DrawGlobalsOptions,
): () => void {
	const undo: Array<() => void> = []

	const merge = (target: MergeableDrawClass, options: Record<string, unknown>) => {
		/* Snapshot before merging: `mergeOptions` mutates the prototype in place. */
		const before = target.prototype.options ?? {}
		const previous = Object.keys(options).map(
			(key) => [key, key in before ? before[key] : ABSENT] as const,
		)

		target.mergeOptions(options)

		undo.push(() => {
			const live = target.prototype.options
			if (!live) return
			for (const [key, value] of previous) {
				if (value === ABSENT) delete live[key]
				else live[key] = value
			}
		})
	}

	merge(L.Edit.PolyVerticesEdit, { icon: handleIcon, touchIcon: handleIcon, drawError })
	merge(L.Edit.SimpleShape, {
		moveIcon: handleIcon,
		resizeIcon: handleIcon,
		touchMoveIcon: handleIcon,
		touchResizeIcon: handleIcon,
	})

	const handlers = L.drawLocal.edit.handlers
	const previousEdit = handlers.edit.tooltip
	const previousRemove = handlers.remove.tooltip

	handlers.edit.tooltip = { text: editInstructions, subtext: "" }
	handlers.remove.tooltip = { text: removeInstructions }

	undo.push(() => {
		handlers.edit.tooltip = previousEdit
		handlers.remove.tooltip = previousRemove
	})

	/* Reversed, so nested applications unwind in the order they were made. */
	return () => {
		for (const restore of undo.reverse()) restore()
	}
}
