import { describe, expect, it } from "vitest"

import { resolveStrings } from "./strings"

/**
 * `resolveStrings` deep-merges nested copy, keeping every sibling of an overridden key.
 * `verify strings` checks that call sites use it.
 */
describe("resolveStrings", () => {
	const defaults = {
		title: "Comments",
		composer: { placeholder: "Write a comment…", submit: "Post", cancel: "Cancel" },
		empty: { title: "No comments", description: "Be the first." },
	}

	it("returns the defaults untouched when nothing is overridden", () => {
		expect(resolveStrings(defaults)).toEqual(defaults)
	})

	it("keeps the siblings of a nested key that was overridden", () => {
		const resolved = resolveStrings(defaults, { composer: { placeholder: "Schreiben…" } })

		expect(resolved.composer.placeholder).toBe("Schreiben…")
		/* A shallow merge would drop these two. */
		expect(resolved.composer.submit).toBe("Post")
		expect(resolved.composer.cancel).toBe("Cancel")
	})

	it("leaves untouched branches alone", () => {
		const resolved = resolveStrings(defaults, { composer: { submit: "Senden" } })
		expect(resolved.empty).toEqual(defaults.empty)
	})

	it("ignores an explicit undefined rather than blanking the default", () => {
		/*
		 * A caller spreading an optional prop passes `{ title: undefined }` without meaning
		 * to erase the title.
		 */
		const resolved = resolveStrings(defaults, { title: undefined })
		expect(resolved.title).toBe("Comments")
	})

	it("does not mutate the defaults", () => {
		const snapshot = structuredClone(defaults)
		resolveStrings(defaults, { composer: { submit: "Senden" } })
		expect(defaults).toEqual(snapshot)
	})

	it("replaces a value with a different shape rather than merging into it", () => {
		const resolved = resolveStrings(defaults, { composer: "one string" as never })
		expect(resolved.composer).toBe("one string")
	})
})
