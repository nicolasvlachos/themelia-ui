/**
 * One contract suite, run against every engine through a factory, so a swapped-in engine
 * keeps the chrome working. A `.ts` rather than `.test.ts` so an engine behind an optional
 * peer can import it from its own test file.
 */
import { expect, it } from "vitest"

import type { RichTextEngine } from "./rich-text-engine.types"

export interface EngineFixture {
	engine: RichTextEngine
	/** Torn down after each case. Mounting is the engine's business. */
	cleanup: () => void
}

export function describeRichTextEngine(create: (initialHtml: string) => EngineFixture) {
	const withEngine = (html: string, run: (engine: RichTextEngine) => void) => {
		const fixture = create(html)
		try {
			run(fixture.engine)
		} finally {
			fixture.cleanup()
		}
	}

	it("reports the document it was given", () => {
		withEngine("<p>hello</p>", (engine) => {
			expect(engine.getState().html).toContain("hello")
		})
	})

	it("replaces the document through setHtml", () => {
		withEngine("<p>one</p>", (engine) => {
			engine.setHtml("<p>two</p>")
			expect(engine.getState().html).toContain("two")
			expect(engine.getState().html).not.toContain("one")
		})
	})

	it("notifies a subscriber when the document changes", () => {
		withEngine("<p>one</p>", (engine) => {
			let calls = 0
			engine.subscribe(() => { calls += 1 })
			engine.setHtml("<p>two</p>")
			expect(calls).toBeGreaterThan(0)
		})
	})

	it("stops notifying after unsubscribe", () => {
		withEngine("<p>one</p>", (engine) => {
			let calls = 0
			const off = engine.subscribe(() => { calls += 1 })
			off()
			engine.setHtml("<p>two</p>")
			expect(calls).toBe(0)
		})
	})

	it("returns the same snapshot until something changes", () => {
		/* `useSyncExternalStore` compares by identity: a fresh object per call re-renders the shell forever. */
		withEngine("<p>hello</p>", (engine) => {
			expect(engine.getState()).toBe(engine.getState())
			engine.setHtml("<p>changed</p>")
			expect(engine.getState()).toBe(engine.getState())
		})
	})

	it("answers undo and redo availability as booleans", () => {
		withEngine("<p>hello</p>", (engine) => {
			const state = engine.getState()
			expect(typeof state.canUndo).toBe("boolean")
			expect(typeof state.canRedo).toBe("boolean")
		})
	})

	it("reports active commands as a set the toolbar can read", () => {
		withEngine("<p>hello</p>", (engine) => {
			const { active } = engine.getState()
			expect(active).toBeInstanceOf(Set)
			/* Membership must be answerable for every command in the union. */
			expect(typeof active.has("bold")).toBe("boolean")
		})
	})

	it("executes every command in the contract without throwing", () => {
		/* Only that every toolbar command can be pressed; what each produces is the engine's business. */
		withEngine("<p>hello</p>", (engine) => {
			for (const command of [
				"bold", "italic", "underline", "strike",
				"bulletList", "orderedList", "blockquote", "undo", "redo",
			] as const) {
				expect(() => engine.execute(command)).not.toThrow()
			}
		})
	})

	it("focuses without throwing", () => {
		withEngine("<p>hello</p>", (engine) => {
			expect(() => engine.focus()).not.toThrow()
		})
	})

	it("destroys idempotently", () => {
		/* Unmount order must not matter. */
		withEngine("<p>hello</p>", (engine) => {
			engine.destroy()
			expect(() => engine.destroy()).not.toThrow()
		})
	})

	it("notifies nobody after destruction", () => {
		withEngine("<p>one</p>", (engine) => {
			let calls = 0
			engine.subscribe(() => { calls += 1 })
			engine.destroy()
			engine.setHtml("<p>two</p>")
			expect(calls).toBe(0)
		})
	})
}
