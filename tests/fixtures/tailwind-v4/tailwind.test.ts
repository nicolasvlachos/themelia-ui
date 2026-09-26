/**
 * The Tailwind CSS v4 bridge, compiled for real and resolved in a real browser.
 *
 * The utilities must address the kit's tokens (`bg-primary` compiles to `var(--primary)`,
 * not a copied value), and the kit's tokens must survive Tailwind's colliding `@theme` names,
 * whose layer sits above the kit's when the kit is imported first. Each test also runs
 * without the bridge; that half must fail the way the bridge exists to fix.
 */
import { existsSync, readFileSync } from "node:fs"

import { compile } from "@tailwindcss/node"
import { expect, test, type Page } from "@playwright/test"

/** Every utility the tests below reach for, compiled in one pass. */
const CANDIDATES = [
	"bg-primary",
	"text-muted-foreground",
	"rounded-sm",
	"text-sm",
	"shadow-md",
	"p-md",
	"font-sans",
]

/*
 * The built stylesheet, because a consumer resolves `themelia-ui/style.css`. The release flow
 * builds first; a fresh clone running `npm test` gets a clear error instead.
 */
if (!existsSync("dist/style.css")) {
	throw new Error(
		"tests/fixtures/tailwind-v4 needs the built stylesheet — run `npm run build:lib` first.",
	)
}

const KIT_CSS = readFileSync("dist/style.css", "utf8")
const BRIDGE = readFileSync("src/styles/tailwind.css", "utf8")

/**
 * Tailwind's output for this entry. `base` is the repo root so `@import "tailwindcss"`
 * resolves out of node_modules as it does for a consumer.
 */
async function tailwind(withBridge: boolean, bridge = BRIDGE): Promise<string> {
	const entry = `@import "tailwindcss";\n${withBridge ? bridge : ""}`
	const compiled = await compile(entry, { base: process.cwd(), onDependency: () => {} })
	return compiled.build(CANDIDATES)
}

/**
 * The consumer's real import order: the kit's stylesheet, then their Tailwind entry. Reversed,
 * the kit would win by layer order alone, which a consumer cannot be asked to rely on.
 */
function page(twCss: string, body: string, rootAttrs = ""): string {
	return `<!doctype html><html ${rootAttrs}><head>
		<style>${KIT_CSS}</style>
		<style>${twCss}</style>
	</head><body>${body}</body></html>`
}

const rootVar = (p: Page, name: string) =>
	p.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name)

const styleOf = (p: Page, selector: string, prop: string) =>
	p.evaluate(
		([s, k]) => getComputedStyle(document.querySelector(s!)!)[k as never] as string,
		[selector, prop],
	)

test.describe("Tailwind v4 bridge", () => {
	test("the utilities address the kit's tokens rather than copying their values", async () => {
		const css = await tailwind(true)

		/* Non-vacuity: an empty compile would pass every "does not contain" assertion. */
		for (const candidate of CANDIDATES) {
			expect(css, `${candidate} was not generated — the compile produced nothing to assert on`)
				.toContain(`.${candidate.replace(/[^a-z0-9-]/g, "\\$&")}`)
		}

		/* Colours are bridged under a different key: a same-name key would emit `--primary: var(--primary)` and cycle. */
		expect(css).toMatch(/\.bg-primary\s*\{\s*background-color:\s*var\(--primary\);?\s*\}/)
		expect(css).toMatch(/\.text-muted-foreground\s*\{\s*color:\s*var\(--muted-foreground\);?\s*\}/)
		expect(css).toMatch(/\.p-md\s*\{\s*padding:\s*var\(--space-md\);?\s*\}/)
	})

	test("the kit keeps its small radius; without the bridge Tailwind takes it", async ({
		page: p,
	}) => {
		const withBridge = await tailwind(true)
		const without = await tailwind(false)

		/* `--radius-sm` is both a kit token and a Tailwind key; the bridge lands the utility on the kit's 0.5rem. */
		await p.setContent(page(withBridge, `<div id="r" class="rounded-sm"></div>`))
		expect(await styleOf(p, "#r", "borderRadius")).toBe("8px")

		/* Falsification: the same page without the bridge takes Tailwind's 0.25rem. */
		await p.setContent(page(without, `<div id="r" class="rounded-sm"></div>`))
		expect(await styleOf(p, "#r", "borderRadius")).toBe("4px")
	})

	test("explicit whole-UI scale still moves type; without the bridge it stops", async ({ page: p }) => {
		const body = `<p id="t" style="font-size: var(--text-sm)">x</p>`
		const scaled = `style="--scale: 0.875"`

		/*
		 * Explicit --scale is the whole-UI factor, so its --text-scale fallback takes 14px to
		 * 12.25px. Named density presets are geometry-only; the source token tests cover them.
		 */
		const withBridge = await tailwind(true)
		await p.setContent(page(withBridge, body))
		expect(await styleOf(p, "#t", "fontSize")).toBe("14px")
		await p.setContent(page(withBridge, body, scaled))
		expect(await styleOf(p, "#t", "fontSize")).toBe("12.25px")

		/* Falsification: Tailwind's flat `--text-sm: 0.875rem` carries no `var(--text-scale)`. */
		const without = await tailwind(false)
		await p.setContent(page(without, body, scaled))
		expect(await styleOf(p, "#t", "fontSize")).toBe("14px")
		expect(await rootVar(p, "--text-sm")).toBe("0.875rem")
	})

	test("a bridged colour still follows the dark theme", async ({ page: p }) => {
		const css = await tailwind(true)
		const body = `<div id="c" class="bg-primary"></div>`

		await p.setContent(page(css, body))
		const light = await styleOf(p, "#c", "backgroundColor")

		/*
		 * Colours are bridged as `var(--primary)`, never restated: a restated value on `:root` in the
		 * higher layer would beat `.dark` and flatten the dark palette.
		 */
		await p.setContent(page(css, `<div class="dark">${body}</div>`))
		const dark = await styleOf(p, "#c", "backgroundColor")

		expect(light).not.toBe(dark)
	})

	test("the bridge ships no rules of its own", async () => {
		/*
		 * Theme declarations only: a selector would ship CSS nobody asked for. The first block must
		 * be `inline` so keys resolve at the element (and follow a `.dark` subtree); the plain blocks
		 * may hold only literals.
		 */
		const withoutComments = BRIDGE.replace(/\/\*[\s\S]*?\*\//g, "").trim()
		const blocks = [...withoutComments.matchAll(/@theme( inline)? \{([^{}]*)\}/g)]
		expect(withoutComments.replace(/@theme( inline)? \{[^{}]*\}/g, "").trim()).toBe("")
		expect(blocks[0]?.[1]).toBe(" inline")
		expect(blocks[0]?.[2]).toContain("--color-background")
		for (const [, inline, body] of blocks.slice(1)) {
			expect(inline).toBeUndefined()
			expect(body).not.toContain("var(")
		}
	})

	test("a theme that moves the inner radius moves rounded-sm; inlined, it would not", async ({
		page: p,
	}) => {
		/*
		 * The provider writes `theme.radiusSm` as an inline `--radius-sm` on the root, which outranks
		 * Tailwind's `theme` layer. Inside `@theme inline` that literal would be copied into the
		 * utility, and `rounded-sm` would ignore the theme.
		 */
		const body = `<div id="r" class="rounded-sm"></div>`
		await p.setContent(page(await tailwind(true), body, `style="--radius-sm: 3px"`))
		expect(await styleOf(p, "#r", "borderRadius")).toBe("3px")

		/* Falsification: the same bridge with every block inline freezes the utility. */
		const allInline = BRIDGE.replace(/@theme \{/g, "@theme inline {")
		await p.setContent(page(await tailwind(true, allInline), body, `style="--radius-sm: 3px"`))
		expect(await styleOf(p, "#r", "borderRadius")).toBe("8px")
	})
})
