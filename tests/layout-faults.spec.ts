/**
 * Two faults that look like bad spacing and are not measurable one element at a time.
 *
 *   WELDED     a label and its description with zero pixels between them (a tight-leading
 *              stack with no gap), reading as one smudged block.
 *   NEAR-MISS  two sibling left edges 1-6px apart: far enough to look wrong, too close to
 *              look deliberate.
 *
 * Both are relationships between two rendered boxes, invisible to a static check. The first
 * sweep audits rendered examples; the docs shell has its own test.
 */
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, shards, sweepTimeout, url, visitRoute } from "./routes"

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

	const EXAMPLE = '[class*="preview__preview"]'
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

/*
 * A box that does not mirror under `dir="rtl"`, although `DirectionProvider` documents the
 * kit's CSS as logical throughout. Read from the rendered box because a stylesheet cannot say
 * which rule won. Transitions are off (padding would animate between sides), and the read is
 * a separate round trip from the `dir` change (a same-tick read resolves against the old
 * direction). Closed and portalled surfaces render nothing, so this is a floor, not a proof.
 */
const KILL_MOTION = "*,*::before,*::after{transition:none !important;animation:none !important}"

// Percentage widths can round a remaining auto margin to adjacent 1/64px layout
// units when direction changes. Allow two units, while retaining subpixel faults.
function sameInlineLength(a: string, b: string) {
	if (a === b) return true
	if (!a.endsWith("px") || !b.endsWith("px")) return false
	return Math.abs(Number.parseFloat(a) - Number.parseFloat(b)) <= 1 / 32
}

test.describe("direction", () => {
	test("length comparison accepts layout rounding but rejects real geometry errors", () => {
		expect(sameInlineLength("34.4844px", "34.4688px")).toBe(true)
		expect(sameInlineLength("34px", "35px")).toBe(false)
		expect(sameInlineLength("34px", "0px")).toBe(false)
		expect(sameInlineLength("0px", "0.1px")).toBe(false)
		expect(sameInlineLength("auto", "0px")).toBe(false)
	})

	for (const shard of shards(COMPONENT_ROUTES, 3)) test(`an asymmetric box mirrors under dir=rtl — ${shard.name}`, async ({ page }) => {
		test.setTimeout(sweepTimeout(shard.routes.length) * 2)
		const stuck = new Map<string, string>()
		let asymmetric = 0

		const measure = () =>
			page.evaluate(() => {
				const scope = document.querySelector("main")
				if (!scope) return []
				const owner = (el: Element) => {
					const hook = el.closest("[class*='--component']")
					const cls = hook?.className
					const m = typeof cls === "string" ? cls.match(/([a-z0-9-]+)--component/) : null
					return m ? m[1] : "(unowned)"
				}
				return Array.from(scope.querySelectorAll<HTMLElement>("*")).map((el) => {
					const style = getComputedStyle(el)
					const box = el.getBoundingClientRect()
					const name = typeof el.className === "string" ? el.className : ""
					return {
						pl: style.paddingLeft, pr: style.paddingRight,
						ml: style.marginLeft, mr: style.marginRight,
						bl: style.borderLeftWidth, br: style.borderRightWidth,
						dir: style.direction,
						visible: box.width > 0 && box.height > 0,
						who: owner(el),
						cls: name.split(" ").map((c) => c.replace(/___.*/, "")).join(".").slice(0, 44),
					}
				})
			})

		for (const route of shard.routes) {
			await visitRoute(page, route.path)
			await page.evaluate(() => document.fonts.ready)
			await page.addStyleTag({ content: KILL_MOTION })
			const ltr = await measure()
			await page.evaluate(() => { document.documentElement.dir = "rtl" })
			const rtl = await measure()
			await page.evaluate(() => { document.documentElement.dir = "ltr" })
			/* A re-render between the two reads would compare different elements. */
			if (ltr.length !== rtl.length) continue

			for (let i = 0; i < ltr.length; i++) {
				const before = ltr[i]
				const after = rtl[i]
				if (!before.visible || after.dir !== "rtl") continue
				for (const [property, left, right, mirroredLeft, mirroredRight] of [
					["padding", before.pl, before.pr, after.pl, after.pr],
					["margin", before.ml, before.mr, after.ml, after.mr],
					["border", before.bl, before.br, after.bl, after.br],
				] as const) {
					if (sameInlineLength(left, right)) continue
					asymmetric++
					if (sameInlineLength(mirroredLeft, right) && sameInlineLength(mirroredRight, left)) continue
					const key = `${before.who} .${before.cls} ${property}`
					if (!stuck.has(key)) stuck.set(key, `${route.path} ltr ${left}/${right} -> rtl ${mirroredLeft}/${mirroredRight}`)
				}
			}
		}

		/* Proof the slice is not vacuous: with nothing asymmetric, nothing can fail. */
		expect(asymmetric, "no asymmetric box was found in this slice").toBeGreaterThan(shard.routes.length)
		expect([...stuck].map(([k, v]) => `${k}  ${v}`), "boxes that do not mirror").toEqual([])
	})
})

/**
 * No text is cut at its start edge. End truncation is a decision an ellipsis announces; a
 * start-edge cut is a label wider than its lane hanging out of a clipping ancestor, and a
 * screenshot baseline can freeze one in.
 */
for (const width of [1280, 390]) {
	test(`no text is clipped at its start edge at ${width}px`, async ({ page }) => {
		test.setTimeout(sweepTimeout(COMPONENT_ROUTES.length))
		await page.setViewportSize({ width, height: 900 })
		const cut: string[] = []
		for (const route of COMPONENT_ROUTES) {
			await visitRoute(page, route.path)
			const found = await page.evaluate(() => {
				const out = new Set<string>()
				const main = document.querySelector("main")
				if (!main) return []
				const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
				for (let node = walker.nextNode(); node; node = walker.nextNode()) {
					if (!node.textContent?.trim() || !node.parentElement) continue
					const range = document.createRange()
					range.selectNodeContents(node)
					const text = range.getBoundingClientRect()
					if (text.width === 0) continue
					for (let a = node.parentElement.parentElement; a && a !== main; a = a.parentElement) {
						const style = getComputedStyle(a)
						if (!/(hidden|clip|auto|scroll)/.test(style.overflowX)) continue
						/* A scrolled box has moved its own content out of view on purpose. */
						if (a.scrollLeft > 0) break
						const edge = a.getBoundingClientRect().left + (Number.parseFloat(style.borderLeftWidth) || 0)
						/* More than 1.5px past the edge, so glyph side bearings do not count. */
						if (text.left < edge - 1.5 && text.right > edge) {
							out.add(`"${node.textContent.trim().slice(0, 24)}" cut ${(edge - text.left).toFixed(1)}px`)
						}
						break
					}
				}
				return [...out]
			})
			for (const finding of found) cut.push(`${route.path}  ${finding}`)
		}
		expect(cut, "text clipped at its start edge").toEqual([])
	})
}
