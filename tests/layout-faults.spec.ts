/**
 * Layout faults no single-element check can see: a box that does not mirror under
 * `dir="rtl"`, and text cut at its start edge by a clipping ancestor.
 */
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, shards, sweepTimeout, visitRoute } from "./routes"

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
