/**
 * Token conformance.
 *
 * Reads each audited property's resolved value off the real element and requires it to
 * match the resolved value of a custom property in scope there. A stylesheet grep cannot see
 * through `var()` chains or `calc()` over a factor.
 */
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, shards, sweepTimeout, url, visitRoute } from "./routes"

type Violation = { component: string; property: string; value: string; sample: string }

/**
 * Properties worth policing. `background-color` and `border-color` are left out: they are
 * often a `color-mix` over a token, and the mix result is not itself a token.
 */
const AUDITED = [
	"border-top-left-radius",
	"border-bottom-right-radius",
	"transition-duration",
	"transition-timing-function",
	"row-gap",
	"column-gap",
	"padding-top",
	"padding-left",
	"font-size",
	"font-weight",
	"color",
]

/** Sized in `em` so they follow the surrounding line (a mention chip in a heading or a caption). */
const EM_RELATIVE = new Set(["mention-chip"])

/**
 * Elements whose colour is per-item data (an inline tint) that no token can hold. Skipped by
 * the element's own marker, so an untinted sibling in the same family is still audited.
 */
const DATA_TINTED_SELECTOR = "[data-tinted]"

/**
 * Reports properties whose resolved value matches no token in scope. The allowed set comes
 * from assigning each token to the audited property on a probe and reading it back, so the
 * browser does the calc and unit normalisation on both sides.
 */
function audit([audited, emRelativeList, dataTinted]: [string[], string[], string]): Violation[] {
	const emRelative = new Set(emRelativeList)
	/*
	 * Declared inside: page.evaluate serialises only this function. Splits on top-level commas
	 * so `cubic-bezier(…)` stays one entry.
	 */
	const splitTopLevel = (value: string): string[] => {
		const parts: string[] = []
		let depth = 0
		let current = ""
		for (const char of value) {
			if (char === "(") depth++
			else if (char === ")") depth--
			if (char === "," && depth === 0) {
				parts.push(current.trim())
				current = ""
			} else current += char
		}
		if (current.trim()) parts.push(current.trim())
		return parts
	}

	const violations: Violation[] = []
	const seen = new Set<string>()
	const inert = new Set([
		"", "none", "0px", "normal", "auto", "0s", "rgba(0, 0, 0, 0)", "transparent",
		/* The UA default easing and the identity curve are not invented values. */
		"ease", "linear",
	])

	const tokenNames = Array.from(getComputedStyle(document.documentElement)).filter((name) =>
		name.startsWith("--"),
	)
	/* An edge-to-edge child of a bordered wrapper or item, and a data mark or arrow tip. */
	const DERIVED_RADII = [
		"calc(var(--radius) - var(--border-width))",
		"calc(var(--radius-sm) - var(--border-width))",
		"calc(var(--radius-sm) / 4)",
	]

	/*
	 * Allowed values are built per scope and cached: `[data-ui-scope]`, `[data-density]` and a
	 * ThemeScope redefine tokens for their subtree.
	 */
	const scopeCache = new Map<Element, Record<string, Set<string>>>()

	const allowedFor = (scope: Element): Record<string, Set<string>> => {
		const cached = scopeCache.get(scope)
		if (cached) return cached

		const probe = document.createElement("div")
		probe.style.position = "absolute"
		probe.style.visibility = "hidden"
		scope.appendChild(probe)

		const allowed: Record<string, Set<string>> = {}
		for (const property of audited) {
			const values = new Set<string>()
			/* A corner may also be the contract's arithmetic on the two radii (TOKENS.md). */
			const derived = property.includes("radius") ? DERIVED_RADII : []
			for (const value of [...tokenNames.map((name) => `var(${name})`), ...derived]) {
				probe.style.setProperty(property, value)
				for (const part of splitTopLevel(getComputedStyle(probe).getPropertyValue(property))) {
					if (part) values.add(part)
				}
			}
			probe.style.removeProperty(property)
			allowed[property] = values
		}
		probe.remove()

		scopeCache.set(scope, allowed)
		return allowed
	}

	const SCOPE_SELECTOR = "[data-ui-scope], [data-density], .theme-scope--component"

	for (const el of Array.from(document.querySelectorAll('[class*="--component"]'))) {
		const rect = el.getBoundingClientRect()
		if (rect.width === 0 && rect.height === 0) continue

		const cs = getComputedStyle(el)
		const component = (el.className.toString().match(/([a-z-]+)--component/) || [])[1]
		if (!component) continue

		if (emRelative.has(component)) continue
		if (el.matches(dataTinted)) continue

		const allowed = allowedFor(el.closest(SCOPE_SELECTOR) ?? document.body)

		for (const property of audited) {
			const raw = cs.getPropertyValue(property).trim()
			if (!raw || inert.has(raw)) continue

			for (const part of splitTopLevel(raw)) {
				if (!part || inert.has(part)) continue
				if (allowed[property].has(part)) continue
				/* Within one layout unit: Firefox snaps laid-out padding to 1/60px; the unlaid-out probe does not. */
				if (/^-?[\d.]+px$/.test(part)) {
					const px = Number.parseFloat(part)
					if ([...allowed[property]].some((v) => /^-?[\d.]+px$/.test(v) && Math.abs(Number.parseFloat(v) - px) <= 1 / 60 + 0.001)) continue
				}

				/* A fully round control's radius is half its own height, not a scale step. */
				if (property.includes("radius")) {
					if (part === "50%" || part === "999px") continue
					const pill = Math.min(rect.width, rect.height) / 2
					if (Math.abs(Number.parseFloat(part) - pill) <= 1) continue
				}

				const key = `${component}|${property}|${part}`
				if (seen.has(key)) continue
				seen.add(key)
				violations.push({
					component,
					property,
					value: part,
					sample: `${el.tagName.toLowerCase()}.${el.className.toString().split(" ")[0]}`,
				})
			}
		}
	}
	return violations
}


/**
 * Every fallback-less `var(--x)` resolves to something on the elements that use it. The static
 * `verify wiring` check misses a token declared only inside a variant or `.dark`, and one read
 * only from JS via `getPropertyValue()`. A var() with a fallback is skipped.
 */
function unresolvedVars() {
	const out: string[] = []
	const seen = new Set<string>()
	for (const sheet of [...document.styleSheets]) {
		let top: CSSRuleList
		try { top = sheet.cssRules } catch { continue } // cross-origin, nothing of ours
		const walk = (list: CSSRuleList) => {
			for (const rule of [...list] as CSSRule[]) {
				if ((rule as CSSGroupingRule).cssRules) walk((rule as CSSGroupingRule).cssRules)
				const style = (rule as CSSStyleRule).style
				const selector = (rule as CSSStyleRule).selectorText
				if (!style || !selector) continue
				for (let i = 0; i < style.length; i += 1) {
					const value = style.getPropertyValue(style[i])
					for (const m of value.matchAll(/var\((--[a-z0-9-]+)\s*\)/g)) {
						const key = `${selector}|${m[1]}`
						if (seen.has(key)) continue
						seen.add(key)
						let els: Element[] = []
						try { els = [...document.querySelectorAll(selector)].slice(0, 2) } catch { continue }
						for (const el of els) {
							if (getComputedStyle(el).getPropertyValue(m[1]).trim() === "") {
								out.push(`${m[1]} resolves to nothing on ${selector.slice(0, 60)}`)
								break
							}
						}
					}
				}
			}
		}
		walk(top)
	}
	return [...new Set(out)]
}

test.describe("token conformance", () => {
	for (const shard of shards(COMPONENT_ROUTES, 6)) {
		test(`every route uses tokens — ${shard.name}`, async ({ page }) => {
			test.setTimeout(sweepTimeout(shard.routes.length))
			const problems: string[] = []
			for (const route of shard.routes) {
				await visitRoute(page, route.path)
				/* A page with no components would pass everything below without asserting a thing. */
				if ((await page.locator('[class*="--component"]').count()) === 0) problems.push(`${route.path}  no components rendered`)
				const violations = await page.evaluate(audit, [AUDITED, [...EM_RELATIVE], DATA_TINTED_SELECTOR] as [string[], string[], string])
				for (const v of violations) problems.push(`${route.path}  ${v.component}: ${v.property} = ${v.value}  (${v.sample}) traces to no token in scope`)
				/* Same page, no extra load: does every var() it applies actually resolve? */
				for (const u of await page.evaluate(unresolvedVars)) problems.push(`${route.path}  unresolved var(): ${u}`)
			}
			expect(problems, problems.join("\n")).toEqual([])
		})
	}
})

test.describe("cross-component consistency", () => {
	/** Every dimmed control dims by the same opacity. */
	test("disabled controls share one opacity", async ({ page }) => {
		await page.goto(url("/review"))
		await page.waitForSelector("h1")

		const opacities = await page.evaluate(() => {
			const found: Record<string, string> = {}
			const selector = '[disabled], [aria-disabled="true"], [data-disabled]'
			for (const el of Array.from(document.querySelectorAll(selector))) {
				const cs = getComputedStyle(el)
				if (cs.opacity === "1") continue
				/* Opacity 0 is hidden, not dimmed (a dropzone's file input, a custom checkbox's native input). */
				if (cs.opacity === "0") continue
				const name =
					(el.className.toString().match(/([a-z-]+)--component/) || [])[1] ||
					el.tagName.toLowerCase()
				found[name] = cs.opacity
			}
			return found
		})

		const distinct = [...new Set(Object.values(opacities))]
		expect(distinct.length, `disabled opacities: ${JSON.stringify(opacities, null, 1)}`)
			.toBeLessThanOrEqual(1)
	})

	/**
	 * One focus ring per kind of control: a field firms its edge and adds a halo, any other
	 * control carries the solid ring. Driven by real Tab presses because `:focus-visible` only
	 * matches keyboard focus.
	 */
	test("focused controls share one ring per kind", async ({ page }) => {
		await page.goto(url("/review"))
		await page.waitForSelector("h1")

		const rings = new Map<string, string>()
		for (let i = 0; i < 60; i++) {
			await page.keyboard.press("Tab")
			const hit = await page.evaluate(async () => {
				const el = document.activeElement
				if (!el || el === document.body) return null
				if (!el.matches(":focus-visible")) return null
				const name = (el.className.toString().match(/([a-z-]+)--component/) || [])[1]
				if (!name) return null

				/* The ring is a transitioned box-shadow; wait for it to settle before reading. */
				await Promise.all(
					el.getAnimations().map((animation) => animation.finished.catch(() => {})),
				)

				/* Compare only the last layer: a field keeps its elevation shadow under the ring. */
				const shadow = getComputedStyle(el).boxShadow
				let depth = 0
				let current = ""
				const layers: string[] = []
				for (const char of shadow) {
					if (char === "(") depth++
					else if (char === ")") depth--
					if (char === "," && depth === 0) {
						layers.push(current.trim())
						current = ""
					} else current += char
				}
				if (current.trim()) layers.push(current.trim())
				/* `--focus-ring-inset` draws the same ring inside the box; only colour and width must agree. */
				const field = el.hasAttribute("data-field-control")
				return {
					name: `${field ? "field" : "control"}:${name}`,
					ring: (layers[layers.length - 1] ?? "").replace(/\s*\binset\b\s*/, " ").trim(),
				}
			})
			if (hit?.ring && hit.ring !== "none") rings.set(hit.name, hit.ring)
		}

		expect(rings.size, "no focusable component was reached in 60 tabs").toBeGreaterThan(2)
		for (const kind of ["field", "control"]) {
			const ofKind = [...rings].filter(([c]) => c.startsWith(`${kind}:`))
			expect(ofKind.length, `no ${kind} was reached in 60 tabs`).toBeGreaterThan(0)
			expect(
				[...new Set(ofKind.map(([, r]) => r))].length,
				`${kind} focus rings differ:\n${ofKind.map(([c, r]) => `  ${c}: ${r}`).join("\n")}`,
			).toBe(1)
		}
	})

	/** Buttons, inputs and selects land on one control height so they line up in a row. */
	test("single-line controls share one height", async ({ page }) => {
		await page.goto(url("/review"))
		await page.waitForSelector("h1")

		const heights = await page.evaluate(() => {
			const found: Record<string, string[]> = {}
			const selector =
				'input[data-field-control], select[data-field-control], .button--component:not([data-app-theme-launcher])'

			for (const el of Array.from(document.querySelectorAll(selector))) {
				/* Measure the field shell: inside one, the raw <input> gives up its own height. */
				const box = el.closest("[data-field-shell]") ?? el
				const rect = box.getBoundingClientRect()
				if (rect.height === 0) continue

				/*
				 * Skip inline --*-scale overrides, which the review page demonstrates on purpose.
				 * `[data-ui-scope]` is not a rescale: the provider puts it on the app root.
				 */
				if (el.closest('[style*="-scale"]')) continue

				/* Icon-only and inline text buttons are their own shape, not a control row. */
				if (rect.width < 32) continue
				/* Inline prose that happens to be a button. Not a control row. */
				if (el.matches('[data-slot="text-button"]')) continue

				const name =
					(el.className.toString().match(/([a-z-]+)--component/) || [])[1] ||
					el.tagName.toLowerCase()
				const detail = (box.className.toString().match(/[a-z0-9]__([a-zA-Z0-9]+)___/) || [])[1] || el.tagName.toLowerCase()
				;(found[name] ||= []).push(`${Math.round(rect.height)}px ${detail}`)
			}
			return Object.fromEntries(
				Object.entries(found).map(([k, v]) => [k, [...new Set(v)]]),
			) as Record<string, string[]>
		})

		const distinct = [...new Set(Object.values(heights).flat().map((entry) => entry.split(" ")[0]))]
		expect(distinct.length, `control heights: ${JSON.stringify(heights, null, 1)}`).toBe(1)
	})

	test("control boundaries retain 3:1 contrast in both themes", async ({ page }) => {
		for (const theme of ["light", "dark"] as const) {
			await page.emulateMedia({ colorScheme: theme })
			await page.goto(url("/review"))
			await page.waitForSelector("h1")
			await page.addStyleTag({
				content: "*, *::before, *::after { transition: none !important; animation: none !important; }",
			})
			await page.evaluate(() => new Promise<void>(resolve => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			}))

			const measurements = await page.evaluate(() => {
				const canvas = document.createElement("canvas")
				const context = canvas.getContext("2d", { willReadFrequently: true })!
				const toRgba = (color: string) => {
					context.clearRect(0, 0, 1, 1)
					context.fillStyle = "rgba(0,0,0,0)"
					context.fillStyle = color
					context.fillRect(0, 0, 1, 1)
					const [r, g, b, alpha] = context.getImageData(0, 0, 1, 1).data
					return [r, g, b, alpha / 255]
				}
				const over = (top: number[], bottom: number[]) => [
					top[0] * top[3] + bottom[0] * (1 - top[3]),
					top[1] * top[3] + bottom[1] * (1 - top[3]),
					top[2] * top[3] + bottom[2] * (1 - top[3]),
					1,
				]
				const luminance = (rgb: number[]) => {
					const [r, g, b] = rgb.map(channel => {
						const value = channel / 255
						return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
					})
					return 0.2126 * r + 0.7152 * g + 0.0722 * b
				}
				const ratio = (a: number[], b: number[]) => {
					const first = luminance(a)
					const second = luminance(b)
					return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
				}
				const resolve = (token: string, scope: ParentNode = document.body) => {
					const probe = document.createElement("span")
					probe.style.color = `var(${token})`
					scope.append(probe)
					const color = getComputedStyle(probe).color
					probe.remove()
					return toRgba(color)
				}

				const backgrounds = ["--background", "--card"].map(token => resolve(token))
				const tokens = ["--control-border", "--control-border-hover", "--focus-ring-color"]
				const measured = Object.fromEntries(tokens.map(token => {
					const color = resolve(token)
					return [token, Math.min(...backgrounds.map(background =>
						ratio(over(color, background), background),
					))]
				}))

				const field = Array.from(
					document.querySelectorAll<HTMLInputElement>("input[data-field-control]"),
				).find(element => {
					const style = getComputedStyle(element)
					return !element.closest("[data-field-shell]")
						&& !element.matches(":hover, :focus-visible, [aria-invalid='true']")
						&& Number.parseFloat(style.borderTopWidth) > 0
				})
				let fieldControlBorder: number[] | null = null
				if (field) {
					const previous = field.style.outlineColor
					field.style.outlineColor = "var(--control-border)"
					fieldControlBorder = toRgba(getComputedStyle(field).outlineColor)
					field.style.outlineColor = previous
				}
				return {
					measured,
					fieldBorder: field ? toRgba(getComputedStyle(field).borderTopColor) : null,
					fieldControlBorder,
				}
			})

			expect(measurements.fieldBorder, `${theme}: no shared field was rendered`).not.toBeNull()
			expect(measurements.fieldBorder, `${theme}: shared field bypassed --control-border`).toEqual(
				measurements.fieldControlBorder,
			)
			/*
			 * The idle control edge is deliberately below 3:1 (about 2.4:1 in both themes) and has its
			 * own floor; hover (about 4.3:1) and focus still clear 3:1. The Switch's off track paints
			 * --control-border as a fill, so this floor holds it too. See theming/focus.css.
			 */
			const floor: Record<string, number> = { "--control-border": 2.3 }
			for (const [token, ratio] of Object.entries(measurements.measured)) {
				expect(ratio, `${theme} ${token}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(floor[token] ?? 3)
			}
		}
	})
})

test.describe("the scale chain", () => {
	test("density presets change geometry and spacing without changing readable type", async ({
		page,
	}) => {
		await page.goto(url("/scale"))
		await page.waitForSelector("#density")

		const measurements = await page.locator("#density [data-ui-scope]").evaluateAll((nodes) =>
			nodes.map((scope) => {
				const button = scope.querySelector<HTMLElement>("button")
				const row = scope.querySelector<HTMLElement>("code")?.parentElement
				if (!button || !row) throw new Error("density demo is missing its button or row probe")
				const style = getComputedStyle(scope)
				return {
					density: scope.getAttribute("data-density") ?? "default",
					scale: parseFloat(style.getPropertyValue("--scale")),
					/* Unset until a preset or consumer sets it; the lengths then fall back to --scale. */
					densityScale: parseFloat(style.getPropertyValue("--density-scale")) || parseFloat(style.getPropertyValue("--scale")),
					textScale: style.getPropertyValue("--text-scale").trim() || "follows-scale",
					buttonText: parseFloat(getComputedStyle(button).fontSize),
					buttonHeight: button.getBoundingClientRect().height,
					gap: parseFloat(getComputedStyle(row).gap),
				}
			}),
		)

		/* Density-scaled lengths are rounded to whole pixels: 34px and 12px times the factor. */
		for (const measurement of measurements) {
			expect(measurement.buttonHeight, measurement.density).toBe(Math.round(34 * measurement.densityScale))
			expect(measurement.gap, measurement.density).toBe(Math.round(12 * measurement.densityScale))
		}
		/* Five decimals: the built stylesheet writes the compact preset as `.941177`. */
		expect(measurements.map(({ buttonHeight: _height, gap: _gap, densityScale, ...values }) => ({ ...values, densityScale: Number(densityScale.toFixed(5)) }))).toEqual([
			{
				density: "compact",
				scale: 1,
				densityScale: 0.94118,
				textScale: "follows-scale",
				buttonText: 14,
			},
			{
				density: "default",
				scale: 1,
				densityScale: 1,
				textScale: "follows-scale",
				buttonText: 14,
			},
			{
				density: "comfortable",
				scale: 1,
				densityScale: 1.075,
				textScale: "follows-scale",
				buttonText: 14,
			},
		])

		const reset = await page.evaluate(() => {
			const outer = document.createElement("div")
			outer.setAttribute("data-ui-scope", "")
			outer.setAttribute("data-density", "compact")
			const inner = document.createElement("div")
			inner.setAttribute("data-ui-scope", "")
			inner.setAttribute("data-density", "default")
			outer.append(inner)
			document.body.append(outer)
			const value = getComputedStyle(inner).getPropertyValue("--density-scale").trim()
			outer.remove()
			return value
		})
		/* Reset to unset, so the lengths fall back to --scale again. */
		expect(reset, "an explicit default scope must reset an inherited density preset").toBe("")

		const inheritedType = await page.evaluate(() => {
			const outer = document.createElement("div")
			outer.setAttribute("data-ui-scope", "")
			outer.style.setProperty("--text-scale", "1.25")

			const inner = document.createElement("div")
			inner.setAttribute("data-ui-scope", "")
			inner.setAttribute("data-density", "compact")
			inner.setAttribute("data-theme", "dark")

			const probe = document.createElement("span")
			probe.style.fontSize = "var(--text-sm)"
			inner.append(probe)
			outer.append(inner)
			document.body.append(outer)

			const style = getComputedStyle(inner)
			const result = {
				textScale: style.getPropertyValue("--text-scale").trim(),
				/* Five decimals: the built stylesheet writes the compact preset as `.941177`. */
				densityScale: Number(Number(style.getPropertyValue("--density-scale")).toFixed(5)),
				fontSize: parseFloat(getComputedStyle(probe).fontSize),
			}
			outer.remove()
			return result
		})

		expect(
			inheritedType,
			"density and theme boundaries must preserve an explicit outer typography scale",
		).toEqual({ textScale: "1.25", densityScale: 0.94118, fontSize: 17.5 })
	})

	/*
	 * The explicit dark block must reach every nested boundary, or a bare `<Scope>` or
	 * `data-density` region under `.dark` re-declares the light values.
	 */
	test("a bare boundary nested under an explicit dark ancestor keeps the dark theme", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "light" })
		await page.goto(url("/tokens"))
		await page.waitForSelector("h1")

		const result = await page.evaluate(() => {
			const tokens = ["--background", "--foreground", "--primary", "--popover", "--success", "--focus-ring-color"]
			const build = (html: string) => {
				const host = document.createElement("div")
				host.innerHTML = html
				document.body.append(host)
				const style = getComputedStyle(host.querySelector("span")!)
				const value = tokens.map((token) => style.getPropertyValue(token).trim()).join(" | ")
				host.remove()
				return value
			}
			return {
				dark: build('<div class="dark"><span></span></div>'),
				light: build('<div data-theme="light"><span></span></div>'),
				classScope: build('<div class="dark"><div data-ui-scope=""><span></span></div></div>'),
				attributeDensity: build('<div data-theme="dark"><div data-density="compact"><span></span></div></div>'),
				chain: build('<div data-theme="dark"><div data-ui-scope=""><div data-density="comfortable"><span></span></div></div></div>'),
				lightIsland: build('<div data-theme="dark"><div data-ui-scope="" data-theme="light"><span></span></div></div>'),
				darkIslandInLight: build('<div data-theme="light"><div class="dark"><div data-ui-scope=""><span></span></div></div></div>'),
			}
		})

		expect(result.dark, "the probe must tell the themes apart").not.toBe(result.light)
		expect(result.classScope, "a `<Scope>` under `.dark` must stay dark").toBe(result.dark)
		expect(result.attributeDensity, "a `data-density` region under `[data-theme=dark]` must stay dark").toBe(result.dark)
		expect(result.chain, "two bare boundaries deep must still be dark").toBe(result.dark)
		expect(result.lightIsland, "an explicit light scope inside dark stays light").toBe(result.light)
		expect(result.darkIslandInLight, "a dark island inside light re-derives dark").toBe(result.dark)
	})

	/*
	 * The OS-preference twin must honour an explicit light choice however it is spelled: the
	 * `.light` class on <html> (next-themes' class strategy), or a light island holding a bare
	 * boundary. Otherwise the twin's `:root:not(…)` outranks `.light` and the app paints dark.
	 */
	test("an explicit light choice holds under an OS dark preference", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" })
		await page.goto(url("/tokens"))
		await page.waitForSelector("h1")

		const result = await page.evaluate(() => {
			const tokens = ["--background", "--foreground", "--primary", "--popover", "--success", "--focus-ring-color"]
			const html = document.documentElement
			const saved = { className: html.className, theme: html.getAttribute("data-theme") }
			const read = (element: Element) => {
				const style = getComputedStyle(element)
				return tokens.map((token) => style.getPropertyValue(token).trim()).join(" | ")
			}
			const build = (markup: string) => {
				const host = document.createElement("div")
				host.innerHTML = markup
				document.body.append(host)
				const value = read(host.querySelector("span")!)
				host.remove()
				return value
			}
			const probes = () => ({
				root: read(html),
				bare: build("<span></span>"),
				bareScope: build('<div data-ui-scope=""><span></span></div>'),
			})
			try {
				/* No explicit choice anywhere, as `colorScheme: "system"` leaves the document. */
				html.classList.remove("dark", "light")
				html.removeAttribute("data-theme")
				const system = {
					...probes(),
					light: build('<div data-theme="light"><span></span></div>'),
					dark: build('<div class="dark"><span></span></div>'),
					classIsland: build('<div class="light"><span></span></div>'),
					scopeInClassIsland: build('<div class="light"><div data-ui-scope=""><span></span></div></div>'),
					densityInAttributeIsland: build('<div data-theme="light"><div data-density="compact"><span></span></div></div>'),
				}
				html.classList.add("light")
				return { system, htmlLight: probes() }
			} finally {
				html.className = saved.className
				if (saved.theme === null) html.removeAttribute("data-theme")
				else html.setAttribute("data-theme", saved.theme)
			}
		})

		const { system, htmlLight } = result
		expect(system.dark, "the probe must tell the themes apart").not.toBe(system.light)
		expect(system.root, "with no explicit choice the OS preference applies").toBe(system.dark)
		expect(system.bareScope, "a bare boundary follows the OS preference").toBe(system.dark)
		expect(system.classIsland, "a `.light` island stays light").toBe(system.light)
		expect(system.scopeInClassIsland, "a bare `<Scope>` inside a `.light` island stays light").toBe(system.light)
		expect(system.densityInAttributeIsland, "a `data-density` region inside `[data-theme=light]` stays light").toBe(system.light)
		expect(htmlLight.root, "`<html class=\"light\">` must outrank the OS preference").toBe(system.light)
		expect(htmlLight.bare, "the page under `<html class=\"light\">` is light").toBe(system.light)
		expect(htmlLight.bareScope, "a bare boundary under `<html class=\"light\">` stays light").toBe(system.light)
	})

	test("typography scale overrides type without changing control geometry", async ({ page }) => {
		await page.goto(url("/scale"))
		await page.waitForSelector("#type-factor")

		const scopes = page.locator("#type-factor [data-ui-scope]")
		await expect(scopes).toHaveCount(2)

		const measurements = await scopes.evaluateAll((nodes) =>
			nodes.map((scope) => {
				const prose = scope.querySelector<HTMLElement>("[data-typography]")
				const button = scope.querySelector<HTMLElement>("button")
				if (!prose || !button) throw new Error("scale demo is missing its prose or button probe")
				return {
					prose: parseFloat(getComputedStyle(prose).fontSize),
					buttonText: parseFloat(getComputedStyle(button).fontSize),
					buttonHeight: button.getBoundingClientRect().height,
					scale: getComputedStyle(scope).getPropertyValue("--scale").trim(),
					textScale: getComputedStyle(scope).getPropertyValue("--text-scale").trim(),
				}
			}),
		)

		/* Type-only scope: every text role moves while the control box keeps its geometry. */
		expect(measurements[0]).toEqual({
			prose: 12.25,
			buttonText: 12.25,
			buttonHeight: 34,
			scale: "1",
			textScale: "0.875",
		})

		/* Geometry-only scope: an explicit type factor holds every text role at 1. */
		expect(measurements[1]).toEqual({
			prose: 14,
			buttonText: 14,
			buttonHeight: 30,
			scale: "0.875",
			textScale: "1",
		})
	})

	/**
	 * The type ladder keeps its order under every factor. Asserts order rather than values so a
	 * retune survives; a type role defined as a spacing step breaks it once the factors diverge.
	 */
	const LADDER = ["xs", "pxs", "sm", "base", "lg", "xl", "2xl"] as const

	const measure = (page: import("@playwright/test").Page, factors: Record<string, string>) =>
		page.evaluate(
			({ roles, set }) => {
				const root = document.documentElement
				const previous = Object.keys(set).map((k) => [k, root.style.getPropertyValue(k)] as const)
				for (const [k, v] of Object.entries(set)) root.style.setProperty(k, v)

				const probe = document.createElement("div")
				document.body.append(probe)
				const read = (role: string) => {
					probe.style.fontSize = getComputedStyle(root).getPropertyValue(`--text-${role}`).trim()
					return parseFloat(getComputedStyle(probe).fontSize)
				}
				const out = Object.fromEntries(roles.map((r) => [r, read(r)]))

				probe.remove()
				for (const [k, v] of previous) {
					if (v) root.style.setProperty(k, v)
					else root.style.removeProperty(k)
				}
				return out as Record<string, number>
			},
			{ roles: [...LADDER], set: factors },
		)

	for (const [label, factors] of [
		["default", {}],
		["--scale: 1.25", { "--scale": "1.25" }],
		["--scale: 0.875", { "--scale": "0.875" }],
		["--density-scale: 1.25", { "--density-scale": "1.25" }],
		["--density-scale: 0.875", { "--density-scale": "0.875" }],
		["--text-scale: 1.25", { "--text-scale": "1.25" }],
	] as const) {
		test(`type ladder holds its order at ${label}`, async ({ page }) => {
			await page.goto(url("/typography"))
			await page.waitForSelector("h1")

			const sizes = await measure(page, factors)
			const detail = `${label} → ${JSON.stringify(sizes)}`

			/* Non-vacuity: a ladder of seven roles that all measure the same is not a ladder. */
			expect(new Set(Object.values(sizes)).size, detail).toBeGreaterThan(4)

			for (let i = 1; i < LADDER.length; i++) {
				const below = LADDER[i - 1]!
				const above = LADDER[i]!
				/* Strictly climbing: no two steps share a size. */
				expect(sizes[above]!, `${above} must climb above ${below} — ${detail}`)
					.toBeGreaterThan(sizes[below]!)
			}
		})
	}

	/* The density factor does not move type at all — ordered, and also unmoved. */
	test("--density-scale leaves the type ladder alone", async ({ page }) => {
		await page.goto(url("/typography"))
		await page.waitForSelector("h1")

		const base = await measure(page, {})
		const spaced = await measure(page, { "--density-scale": "1.5" })

		expect(Object.values(base).length).toBeGreaterThan(4)
		expect(spaced, `type moved under --density-scale: ${JSON.stringify({ base, spaced })}`).toEqual(base)
	})

	test("mobile fields keep the shared typography pair under compact density", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 })
		await page.goto(url("/input"))
		await page.locator("[data-field-control]:visible").first().waitFor()

		const measure = () =>
			page.locator("[data-field-control]:visible").first().evaluate((field) => {
				const probe = document.createElement("span")
				probe.style.fontSize = "var(--text-sm)"
				probe.style.lineHeight = "var(--text-sm--line-height)"
				field.after(probe)
				const expected = getComputedStyle(probe)
				const actual = getComputedStyle(field)
				const result = {
					fontSize: actual.fontSize,
					lineHeight: actual.lineHeight,
					expectedFontSize: expected.fontSize,
					expectedLineHeight: expected.lineHeight,
					densityScale: actual.getPropertyValue("--density-scale").trim(),
				}
				probe.remove()
				return result
			})

		const normal = await measure()
		await page.evaluate(() => document.documentElement.setAttribute("data-density", "compact"))
		const compact = await measure()

		expect(normal.fontSize).toBe(normal.expectedFontSize)
		expect(normal.lineHeight).toBe(normal.expectedLineHeight)
		expect(compact.densityScale).not.toBe(normal.densityScale)
		expect(compact.fontSize).toBe(compact.expectedFontSize)
		expect(compact.lineHeight).toBe(compact.expectedLineHeight)
	})
})

test.describe("surface axes", () => {
	test("surface padding keeps block and inline roles independent at every size", async ({ page }) => {
		await page.goto(url("/empty"))
		await page.waitForSelector("#empty-border")
		await page.evaluate(() => {
			document.documentElement.style.setProperty("--surface-x", "40px")
			document.documentElement.style.setProperty("--surface-y", "10px")
		})

		const selectors = [
			"#empty .empty--component",
			"#empty-border .empty--component:first-of-type",
			"#empty-border .empty--component:last-of-type",
		]
		const padding = await Promise.all(
			selectors.map((selector) =>
				page.locator(selector).evaluate((node) => {
					const style = getComputedStyle(node)
					return {
						blockStart: style.paddingBlockStart,
						blockEnd: style.paddingBlockEnd,
						inlineStart: style.paddingInlineStart,
						inlineEnd: style.paddingInlineEnd,
					}
				}),
			),
		)

		expect(padding).toEqual([
			{ blockStart: "10px", blockEnd: "10px", inlineStart: "40px", inlineEnd: "40px" },
			{ blockStart: "5px", blockEnd: "5px", inlineStart: "20px", inlineEnd: "20px" },
			/* The large step is 1.75x, rounded: 17.5px lands on 18. */
			{ blockStart: "18px", blockEnd: "18px", inlineStart: "70px", inlineEnd: "70px" },
		])
	})
})

test.describe("truncation", () => {
	/**
	 * `truncate` clips on every component that forwards it. Measured rather than class-checked,
	 * because `text-overflow` is inert on an inline box.
	 */
	test("truncate clips instead of wrapping", async ({ page }) => {
		await page.goto(url("/typography"))
		await page.waitForSelector("h1")

		const measured = await page.evaluate(() => {
			const out: {
				text: string; tag: string; clipped: boolean; block: boolean
				contained: boolean; lines: number; wrapped: boolean
			}[] = []
			for (const el of document.querySelectorAll<HTMLElement>("#truncate-demo [data-typography]")) {
				const style = getComputedStyle(el)
				const lines = Math.round(el.getBoundingClientRect().height / parseFloat(style.lineHeight))
				out.push({
					text: (el.textContent ?? "").slice(0, 28),
					tag: el.tagName.toLowerCase(),
					clipped: el.scrollWidth > el.clientWidth,
					/* The property that is inert on an inline box, and the reason for the prop. */
					block: style.display !== "inline",
					contained: style.overflow !== "visible",
					lines,
					wrapped: style.whiteSpace !== "nowrap",
				})
			}
			return out
		})

		/* Non-vacuity: the example renders three, two truncating and one not. */
		expect(measured.length, JSON.stringify(measured)).toBe(3)

		const truncating = measured.filter((m) => !m.wrapped)
		expect(truncating.length, JSON.stringify(measured)).toBe(2)
		for (const m of truncating) {
			expect(m.clipped, `"${m.text}" should overflow its box — ${JSON.stringify(m)}`).toBe(true)
			expect(m.lines, `"${m.text}" should be one line — ${JSON.stringify(m)}`).toBe(1)
			expect(m.block, `"${m.text}" must not be an inline box — ${JSON.stringify(m)}`).toBe(true)
			/*
			 * The ellipsis only paints where overflow is not visible, and a rendered ellipsis cannot be
			 * read back from the DOM, so this checks the mechanism.
			 */
			expect(m.contained, `"${m.text}" needs a non-visible overflow for the ellipsis to paint — ${JSON.stringify(m)}`).toBe(true)
		}

		/* A <span> proves the blockification; a <p> is a block already. */
		expect(truncating.some((m) => m.tag === "span"), JSON.stringify(truncating)).toBe(true)

		/* And the control: the same width of text, left to wrap, takes more than one line. */
		const wrapping = measured.filter((m) => m.wrapped)
		expect(wrapping.every((m) => m.lines > 1), JSON.stringify(wrapping)).toBe(true)
	})
})
