import { describe, expect, it, vi } from "vitest"

import { resolveContextActions, splitActions } from "./context-actions"
import type { ActionPlacement } from "./action-menu.types"

describe("resolveContextActions", () => {
	it("runs predicates against the subject and binds the handler to it", () => {
		const onClick = vi.fn()
		const onAction = vi.fn()
		const row = { id: 7, locked: true }
		const [archive, hidden] = [
			{ id: "archive", label: "Archive", onClick, disabled: (r: typeof row) => r.locked },
			{ id: "restore", label: "Restore", visible: (r: typeof row) => !r.locked },
		]
		const resolved = resolveContextActions([archive, hidden], row, { onAction })
		expect(resolved.map((action) => action.id)).toEqual(["archive"])
		expect(resolved[0]?.disabled).toBe(true)
		resolved[0]?.onClick?.()
		expect(onClick).toHaveBeenCalledWith(row)
		expect(onAction).toHaveBeenCalledWith("archive")
	})

	it("strips href when asked, and falls back to the label for the id", () => {
		const [action] = resolveContextActions([{ label: "Open", href: "/x" }], null, { stripHref: true })
		expect(action?.href).toBeUndefined()
		expect(action?.id).toBe("Open")
	})

	it("accepts a function source computed per subject", () => {
		const resolved = resolveContextActions((n: number) => [{ id: "n", label: `Item ${n}` }], 3)
		expect(resolved[0]?.label).toBe("Item 3")
	})
})

describe("splitActions", () => {
	it("pins inline, forces menu, and fills the rest up to the limit in order", () => {
		const set: { id: string; placement?: ActionPlacement }[] = [
			{ id: "a" }, { id: "b", placement: "menu" }, { id: "c" }, { id: "d", placement: "inline" }, { id: "e" },
		]
		const { inline, overflow } = splitActions(set, 2)
		expect(inline.map((x) => x.id)).toEqual(["d", "a"])
		expect(overflow.map((x) => x.id)).toEqual(["c", "e", "b"])
	})

	it("renders every undecided entry inline with no limit", () => {
		const set: { id: string; placement?: ActionPlacement }[] = [{ id: "a" }, { id: "b" }]
		expect(splitActions(set).overflow).toEqual([])
	})
})
