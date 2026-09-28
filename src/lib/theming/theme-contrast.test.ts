/**
 * Contrast of the theme's own pairs, in both modes: text, and the focus ring, against the
 * grounds they sit on. Below the floor fails: WCAG AA, 4.5:1 for text and 3:1 for the ring.
 * Supporting text that reads as strongly as body text on a main ground is reported, not
 * failed: it flattens the hierarchy without shutting anyone out.
 *
 * Values are read from the stylesheets, so a retuned colour is measured as it ships, and
 * mapped into sRGB first, as a standard display shows them.
 * tests/contrast.spec.ts measures the pages; this measures the theme alone, including pairs
 * no page happens to show.
 */
import { readFileSync } from "node:fs"
import { converter, interpolate, parse, toGamut, wcagContrast, type Color, type Rgb } from "culori"
import { describe, expect, it } from "vitest"

type Mode = "light" | "dark"

const TEXT_FLOOR = 4.5
const RING_FLOOR = 3
/* Past this, supporting text stops reading as supporting. */
const SUPPORTING_CEILING = 7

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "")

const colourCss = strip(readFileSync("src/styles/theme/colour.css", "utf8"))
const rootBlock = /:root\s*\{([\s\S]*?)\n\}/.exec(colourCss)?.[1] ?? ""
const declared = new Map(
	[...rootBlock.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1] ?? "", (match[2] ?? "").trim()]),
)

/* How far each tone's ink mixes toward the text colour in light mode (styles/tone.css). */
const toneCss = strip(readFileSync("src/styles/tone.css", "utf8"))
const inkShare = new Map(
	[...toneCss.matchAll(/data-tone="([a-z]+)"[^{]*\{([^}]*)\}/g)].map((match) => [
		match[1] ?? "",
		Number(/--_tone-ink:\s*([\d.]+)%/.exec(match[2] ?? "")?.[1] ?? 100) / 100,
	]),
)

const toRgb = converter("rgb")
const toSrgb = toGamut("rgb", "oklch")

function halves(value: string): [string, string] {
	if (!value.startsWith("light-dark(")) return [value, value]
	const inner = value.slice("light-dark(".length, -1)
	let depth = 0
	for (let index = 0; index < inner.length; index++) {
		const character = inner[index]
		if (character === "(") depth++
		else if (character === ")") depth--
		else if (character === "," && depth === 0) return [inner.slice(0, index).trim(), inner.slice(index + 1).trim()]
	}
	throw new Error(`Unbalanced light-dark(): ${value}`)
}

function colour(name: string, mode: Mode): Color {
	const value = declared.get(name)
	if (!value) throw new Error(`${name} is not declared in styles/theme/colour.css`)
	const parsed = parse(halves(value)[mode === "light" ? 0 : 1])
	if (!parsed) throw new Error(`${name} does not parse in ${mode}`)
	return toSrgb(parsed)
}

/** A colour painted over an opaque ground, composited in sRGB as the browser does. */
function over(paint: Color, ground: Color): Rgb {
	const top = toRgb(paint)
	const bottom = toRgb(ground)
	const alpha = top.alpha ?? 1
	return {
		mode: "rgb",
		r: top.r * alpha + bottom.r * (1 - alpha),
		g: top.g * alpha + bottom.g * (1 - alpha),
		b: top.b * alpha + bottom.b * (1 - alpha),
	}
}

/** `color-mix(in oklab, a share, b)`. */
const mix = (a: Color, b: Color, share: number) => interpolate([b, a], "oklab")(share)

/** The tone rule's ink: the hue in dark mode, mixed toward the text colour in light. */
function ink(tone: string, mode: Mode): Color {
	const hue = colour(`--${tone}`, mode)
	return mode === "dark" ? hue : toSrgb(mix(hue, colour("--foreground", mode), inkShare.get(tone) ?? 1))
}

const tint = Number.parseFloat(declared.get("--tint") ?? "10") / 100
/** A soft fill: `color-mix(in oklab, var(--x) var(--tint), transparent)` over a ground. */
const soft = (hue: Color, ground: Color) => over({ ...toRgb(hue), alpha: tint }, ground)

const GROUNDS = ["--background", "--card", "--popover", "--muted", "--accent", "--secondary"]
const MAIN_GROUNDS = ["--background", "--card", "--popover"]
const INKED_TONES = ["primary", "info", "success", "warning", "destructive"]
const FILLS = ["card", "popover", "accent", "secondary", "primary", "destructive", "success", "warning", "info", "sidebar-accent"]

interface Pair {
	label: string
	ratio: number
}

function measure(label: string, text: Color, ground: Color): Pair {
	return { label, ratio: Number(wcagContrast(text, ground).toFixed(2)) }
}

function textPairs(mode: Mode): Pair[] {
	const pairs: Pair[] = []
	for (const ground of GROUNDS) {
		pairs.push(measure(`--foreground on ${ground}`, colour("--foreground", mode), colour(ground, mode)))
		pairs.push(measure(`--muted-foreground on ${ground}`, colour("--muted-foreground", mode), colour(ground, mode)))
		pairs.push(measure(`--link on ${ground}`, colour("--link", mode), colour(ground, mode)))
	}
	for (const fill of FILLS) {
		pairs.push(measure(`--${fill}-foreground on --${fill}`, colour(`--${fill}-foreground`, mode), colour(`--${fill}`, mode)))
	}
	pairs.push(measure("--sidebar-foreground on --sidebar", colour("--sidebar-foreground", mode), colour("--sidebar", mode)))
	for (const tone of INKED_TONES) {
		for (const ground of [...MAIN_GROUNDS, "--muted", "--accent"]) {
			pairs.push(measure(`${tone} ink on ${ground}`, ink(tone, mode), colour(ground, mode)))
		}
		for (const ground of MAIN_GROUNDS) {
			const wash = soft(colour(`--${tone}`, mode), colour(ground, mode))
			pairs.push(measure(`${tone} ink on its tint over ${ground}`, ink(tone, mode), wash))
		}
	}
	/* A selected row: the text on the primary tint over any ground. */
	for (const ground of MAIN_GROUNDS) {
		const selected = soft(colour("--primary", mode), colour(ground, mode))
		pairs.push(measure(`--foreground on the primary tint over ${ground}`, colour("--foreground", mode), selected))
	}
	/* A soft badge in a selected table or list row, which sit on the page or a card. */
	for (const ground of ["--background", "--card"]) {
		const selected = soft(colour("--primary", mode), colour(ground, mode))
		for (const tone of INKED_TONES) {
			const badge = soft(colour(`--${tone}`, mode), selected)
			pairs.push(measure(`${tone} ink on its tint in a selected row over ${ground}`, ink(tone, mode), badge))
		}
	}
	return pairs
}

function ringPairs(mode: Mode): Pair[] {
	return [
		...[...MAIN_GROUNDS, "--muted"].map((ground) => measure(`--ring on ${ground}`, colour("--ring", mode), colour(ground, mode))),
		measure("--sidebar-ring on --sidebar", colour("--sidebar-ring", mode), colour("--sidebar", mode)),
	]
}

const below = (pairs: Pair[], floor: number) =>
	pairs.filter((pair) => pair.ratio < floor).map((pair) => `${pair.label}: ${pair.ratio}`)

describe.each(["light", "dark"] as const)("the %s theme", (mode) => {
	it(`holds text at ${TEXT_FLOOR}:1 on every ground it sits on`, () => {
		const pairs = textPairs(mode)
		const strong = pairs.filter(
			(pair) =>
				pair.label.startsWith("--muted-foreground") &&
				MAIN_GROUNDS.some((ground) => pair.label.endsWith(ground)) &&
				pair.ratio > SUPPORTING_CEILING,
		)
		if (strong.length) {
			console.info(`${mode}: supporting text above ${SUPPORTING_CEILING}:1\n${strong.map((pair) => `  ${pair.label}: ${pair.ratio}`).join("\n")}`)
		}
		expect(below(pairs, TEXT_FLOOR)).toEqual([])
	})

	it(`holds the focus ring at ${RING_FLOOR}:1`, () => {
		expect(below(ringPairs(mode), RING_FLOOR)).toEqual([])
	})
})
