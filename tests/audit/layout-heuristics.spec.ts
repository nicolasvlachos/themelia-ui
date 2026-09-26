/**
 * An on-demand audit of two faults that look like bad spacing and are not measurable one
 * element at a time.
 *
 *   WELDED     a label and its description with zero pixels between them (a tight-leading
 *              stack with no gap), reading as one smudged block.
 *   NEAR-MISS  two sibling left edges 1-6px apart: far enough to look wrong, too close to
 *              look deliberate.
 *
 * Not a gate: `npm run audit` runs it when a visual change needs judging. Both are
 * relationships between two rendered boxes, invisible to a static check. The first sweep
 * audits rendered examples; the docs shell has its own test.
 */
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, shards, sweepTimeout, url, visitRoute } from "../routes"

/** What the audit found and accepted. Each entry is a decision, not a silenced warning. */
const ACCEPTED = [
	// A ghost button pulled out by its own inset so its label lands on the content column.
	/repliesToggle/,
	// Visually-hidden 1px boxes align with nothing by design.
	/visuallyHidden|visually-hidden/,
	/* The docs TOC: each link pulls left by its 2px rail so the rail sits outside the text. */
	/tocLabel|tocLink/,
	/* Type specimens on the typography page, stacked adjacent for comparison. */
	/text__(weightNormal|numeric)/,
	/*
	 * An address's lines are one block and meant to be adjacent; with 14px type on a 21px line
	 * box the glyph rows are still 7px apart.
	 */
	/address__line/,
]

test.describe("layout faults", () => {
	for (const shard of shards(COMPONENT_ROUTES, 6)) {
		test(`no welded text or near-miss alignment — ${shard.name}`, async ({ page }) => {
			test.setTimeout(sweepTimeout(shard.routes.length))
			const problems: string[] = []
			for (const route of shard.routes) {
				await visitRoute(page, route.path)
				const faults = await page.evaluate(findLayoutFaults, "examples" as const)
				for (const fault of faults.filter((f) => !ACCEPTED.some((rx) => rx.test(f)))) problems.push(`${route.path}  ${fault}`)
			}
			expect(problems, problems.join("\n")).toEqual([])
		})
	}

	/* The docs shell (nav, header, table of contents) is the same on every page, so one route. */
	test("the docs shell has no welded text or near-miss alignment", async ({ page }) => {
		await page.goto(url("/card"))
		await page.waitForSelector("h1")

		const faults = await page.evaluate(findLayoutFaults, "chrome" as const)
		const real = faults.filter((f) => !ACCEPTED.some((rx) => rx.test(f)))
		expect(real, `docs shell\n  ${real.join("\n  ")}`).toEqual([])
	})
})

/*
 * Runs in the page. `examples` audits inside each rendered example; `chrome` audits the
 * document with every example left out.
 */
function findLayoutFaults(scope: "examples" | "chrome"): string[] {
	const out: string[] = []
	const painted = (el: Element) => {
		const r = el.getBoundingClientRect()
		const s = getComputedStyle(el)
		return r.width > 1 && r.height > 1 && s.visibility !== "hidden" && s.opacity !== "0"
	}
	const label = (el: Element) => (el.textContent ?? "").trim().slice(0, 20)
	const named = (el: Element) => el.className.toString().split(" ").pop() ?? el.tagName
	const ownPadding = (el: HTMLElement) => {
		const cs = getComputedStyle(el)
		return parseFloat(cs.paddingTop) > 0 || parseFloat(cs.paddingBottom) > 0
	}

	const EXAMPLE = ".example--preview"
	const candidates =
		scope === "examples"
			? [...document.querySelectorAll<HTMLElement>(EXAMPLE)].flatMap((root) => [...root.querySelectorAll<HTMLElement>("*")])
			: [...document.querySelectorAll<HTMLElement>("*")].filter((el) => !el.closest(EXAMPLE))
	/* HTML only: an icon's <path> and <g> are artwork, not layout boxes. Nor anything aria-hidden. */
	const all = candidates.filter((el) => !(el instanceof SVGElement) && !el.closest("[aria-hidden]"))

	for (const parent of all) {
		/* Boxes, not inline runs: two `<strong>`s a sentence wraps onto consecutive lines are text flow. */
		const kids = [...parent.children].filter((el) => painted(el) && getComputedStyle(el).display !== "inline") as HTMLElement[]
		if (kids.length < 2) continue
		const ps = getComputedStyle(parent)
		/*
		 * Left edges only mean something when the parent aligns to the start. Horizontal
		 * placement is `align-items` in a column and `justify-content` in a row.
		 */
		const column = ps.display === "flex" && ps.flexDirection === "column"
		const stacked = ps.display === "block" || column
		const crossAxis = column ? ps.alignItems : ps.justifyContent
		const startAligned =
			!/center|end|around|evenly|between/.test(crossAxis) && ps.textAlign !== "center" && ps.textAlign !== "end"

		for (let i = 1; i < kids.length; i++) {
			const a = kids[i - 1].getBoundingClientRect()
			const b = kids[i].getBoundingClientRect()
			if (b.top <= a.bottom - 2) continue // side by side, not stacked

			/*
			 * WELDED: two leaf text nodes touching, and only when neither has vertical padding;
			 * with padding the box edge is not the text edge.
			 */
			if (
				stacked &&
				!ownPadding(kids[i - 1]) &&
				!ownPadding(kids[i]) &&
				Math.abs(a.left - b.left) <= 2 &&
				Math.round(b.top - a.bottom) === 0 &&
				kids[i - 1].children.length === 0 &&
				kids[i].children.length === 0 &&
				a.height < 40 && b.height < 40 &&
				label(kids[i - 1]) && label(kids[i])
			) {
				out.push(`WELDED ${named(kids[i - 1])} "${label(kids[i - 1])}" / "${label(kids[i])}"`)
			}

			// NEAR-MISS: left edges close but not equal.
			const delta = Math.abs(Math.round(a.left) - Math.round(b.left))
			if (startAligned && delta >= 1 && delta <= 6) {
				out.push(`NEAR-MISS ${delta}px ${named(kids[i - 1])} / ${named(kids[i])} "${label(kids[i])}"`)
			}
		}
	}
	return [...new Set(out)]
}
