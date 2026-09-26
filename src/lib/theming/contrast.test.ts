/**
 * Foreground choice by measured contrast, compared against the retired lightness
 * threshold (INK above L 0.67, else PAPER), which picks the less readable candidate in
 * the mid-lightness band.
 */
import { wcagContrast } from "culori"
import { describe, expect, it } from "vitest"

import { INK, PAPER, readableForeground } from "./contrast"

/** The rule this module replaced, kept here so the comparison is executable. */
const byLightnessThreshold = (color: string) => {
	const lightness = Number.parseFloat(color.match(/oklch\(\s*([\d.]+)/i)?.[1] ?? "NaN")
	return lightness > 0.67 ? INK : PAPER
}

describe("readableForeground", () => {
	it("picks the measurably more readable candidate, where the threshold did not", () => {
		/* A plausible brand green. L is 0.59, so the old rule took PAPER. */
		const brand = "oklch(0.59 0.12 167)"

		expect(byLightnessThreshold(brand)).toBe(PAPER)
		expect(wcagContrast(PAPER, brand)).toBeLessThan(4.5)

		const chosen = readableForeground(brand)
		expect(chosen.color).toBe(INK)
		expect(chosen.ratio).toBeGreaterThanOrEqual(4.5)
		expect(chosen.meetsAA).toBe(true)
	})

	it("agrees with the threshold where the threshold was right", () => {
		/* The kit's own brand-600. Dark enough that white is plainly correct. */
		const chosen = readableForeground("oklch(0.45 0.124 167.35)")
		expect(chosen.color).toBe(PAPER)
		expect(chosen.measured).toBe(true)
		/* Against PAPER, which is oklch(0.985 0 0) rather than pure white — 6.97 is #fff. */
		expect(chosen.ratio).toBeCloseTo(6.67, 1)
	})

	it("reads notations the threshold could not, instead of falling back to the mode", () => {
		/* Every CSS notation is measured, not just `#rrggbb` and `oklch()`. */
		for (const background of ["hsl(210 100% 12%)", "rgb(20 20 20)", "midnightblue", "#101014"]) {
			const chosen = readableForeground(background, "light")
			expect(chosen.measured, `${background} was not measured`).toBe(true)
			expect(chosen.color, `${background} should take the light foreground`).toBe(PAPER)
		}
	})

	it("reports AA honestly rather than pretending", () => {
		/*
		 * The worst grey: at `oklch(0.570 0 0)` the better candidate reaches only 4.28, under AA
		 * either way. It is still returned, with `meetsAA: false`.
		 */
		const chosen = readableForeground("oklch(0.570 0 0)")
		expect(chosen.measured).toBe(true)
		expect(chosen.meetsAA).toBe(false)
		expect(chosen.ratio).toBeLessThan(4.5)
	})

	it("falls back to the mode only when the colour cannot be known without a browser", () => {
		for (const unknowable of ["var(--primary)", "color-mix(in oklch, var(--a), var(--b))"]) {
			expect(readableForeground(unknowable, "light")).toMatchObject({
				color: PAPER,
				measured: false,
			})
			expect(readableForeground(unknowable, "dark")).toMatchObject({
				color: INK,
				measured: false,
			})
		}
	})

	it("never returns a candidate it did not measure as the best", () => {
		/* Non-vacuity: sweep the band and assert the invariant on every sample. */
		let samples = 0
		for (let l = 0.3; l <= 0.95; l += 0.05) {
			for (const [c, h] of [
				[0, 0],
				[0.12, 167],
				[0.16, 90],
				[0.21, 277],
			] as const) {
				const background = `oklch(${l.toFixed(2)} ${c} ${h})`
				const chosen = readableForeground(background)
				const other = chosen.color === INK ? PAPER : INK
				expect(wcagContrast(chosen.color, background)).toBeGreaterThanOrEqual(
					wcagContrast(other, background),
				)
				samples++
			}
		}
		expect(samples).toBeGreaterThan(50)
	})
})
