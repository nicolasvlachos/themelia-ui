/**
 * Choosing a readable foreground for a colour by measuring WCAG contrast (via `culori`,
 * which parses every CSS colour notation) rather than guessing from lightness.
 */
import { wcagContrast } from "culori"

/** The kit's own ink and paper, used by the derived themes. */
export const INK = "oklch(0.18 0.01 260)"
export const PAPER = "oklch(0.985 0 0)"

export interface ForegroundChoice {
	/** The chosen foreground. */
	color: string
	/** WCAG contrast ratio against the background, 1–21. */
	ratio: number
	/** Whether the ratio clears WCAG AA for body text (4.5:1). Reported, not enforced. */
	meetsAA: boolean
	/** `false` when the colour could not be parsed and `mode` decided instead. */
	measured: boolean
}

/**
 * The more readable of `candidates` on `background`, measured. Falls back to `mode` only
 * when the background cannot be parsed (a `var()`, a `color-mix()`).
 */
export function readableForeground(
	background: string,
	mode: ThemeModeLike = "light",
	candidates: readonly [string, string] = [INK, PAPER],
): ForegroundChoice {
	const scored = candidates
		.map((color) => {
			const ratio = safeContrast(color, background)
			return ratio === null ? null : { color, ratio }
		})
		.filter((entry): entry is { color: string; ratio: number } => entry !== null)

	if (scored.length === 0) {
		return { color: mode === "dark" ? INK : PAPER, ratio: 0, meetsAA: false, measured: false }
	}

	const best = scored.reduce((a, b) => (b.ratio > a.ratio ? b : a))
	return { color: best.color, ratio: Number(best.ratio.toFixed(2)), meetsAA: best.ratio >= 4.5, measured: true }
}

type ThemeModeLike = "light" | "dark"

/** `wcagContrast` throws on an unparseable colour; return `null` instead. */
function safeContrast(a: string, b: string): number | null {
	try {
		const ratio = wcagContrast(a, b)
		return Number.isFinite(ratio) ? ratio : null
	} catch {
		return null
	}
}
