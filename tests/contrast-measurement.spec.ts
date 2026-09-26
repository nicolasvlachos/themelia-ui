/** Contrast measurements handle translucent layers, known range backgrounds, and the AA threshold. */
import { expect, test } from "@playwright/test"
import { auditTextContrast } from "./helpers/contrast"

test("translucent backgrounds retain their RGB channels when composited", async ({ page }) => {
	await page.setContent('<body style="background:white"><main style="background:rgba(100,50,25,.5)"><span style="color:white">A</span></main></body>')
	const findings = await page.evaluate(auditTextContrast)
	expect(findings).toHaveLength(1)
	// Canvas readback is straight RGB. Alpha is applied once, over the white canvas.
	expect(findings[0]).toContain("on rgb(177,152,140)")
	expect(findings[0]).toContain('"A"')
})

test("translucent text uses the same single alpha composition", async ({ page }) => {
	await page.setContent('<body style="background:white"><main><span style="color:rgba(100,50,25,.5)">Ink</span></main></body>')
	const findings = await page.evaluate(auditTextContrast)
	expect(findings).toHaveLength(1)
	// About 2.72:1 from the hand-composited (177.5, 152.5, 140) text on white;
	// eight-bit canvas alpha introduces a small rounding difference.
	expect(Number(findings[0].match(/: ([\d.]+):1/)?.[1])).toBeCloseTo(2.72, 1)
})

test("nested translucent surfaces are composited from the bottom up", async ({ page }) => {
	await page.setContent('<body style="background:white"><main style="background:rgba(0,0,255,.5)"><div style="background:rgba(255,0,0,.5)"><span style="color:#aaa">Nested</span></div></main></body>')
	expect(await page.evaluate(auditTextContrast)).toEqual([
		expect.stringContaining("on rgb(191,63,127)"),
	])
})

test("small text is rejected just below the AA threshold and accepted above it", async ({ page }) => {
	await page.setContent('<body style="background:white"><main><span style="color:#777;font-size:14px">Fails</span><span style="color:#767676;font-size:14px">Passes</span></main></body>')
	const findings = await page.evaluate(auditTextContrast)
	expect(findings).toHaveLength(1)
	expect(findings[0]).toContain('4.48:1 (needs 4.5)')
	expect(findings[0]).toContain('"Fails"')
})

test("a known background pseudo-element contributes behind transparent text", async ({ page }) => {
	await page.setContent(`<style>
		body { background: black; }
		#band { position:relative; }
		#band::before { content:""; position:absolute; inset:0; background:rgba(255,255,255,.7); }
		span { position:relative; color:white; }
	</style><main><div id="band"><span>Range</span></div></main>`)
	const findings = await page.evaluate(auditTextContrast, { backgroundPseudoSelector: "#band" })
	/* 70% white over black is 178.5: engines round it either way. */
	expect(findings).toEqual([expect.stringMatching(/on rgb\((?:178|179), ?(?:178|179), ?(?:178|179)\)/)])
})
