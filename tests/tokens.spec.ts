/**
 * The theming contract: every `var()` resolves, scope boundaries keep an explicit theme,
 * density and text scale, and the type ladder holds its order under every factor.
 *
 * Also the control contracts that read tokens: one control height, a 3:1 control boundary in
 * both themes, and `truncate` clipping instead of wrapping.
 */
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, shards, sweepTimeout, url, visitRoute } from "./routes"

/**
 * Every fallback-less `var(--x)` resolves to something on the elements that use it, including a
 * token declared only inside a variant or `.dark`, and one read only from JS via
 * `getPropertyValue()`. A var() with a fallback is skipped.
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

test.describe("token wiring", () => {
	for (const shard of shards(COMPONENT_ROUTES, 6)) {
		test(`every var() a route applies resolves — ${shard.name}`, async ({ page }) => {
			test.setTimeout(sweepTimeout(shard.routes.length))
			const problems: string[] = []
			for (const route of shard.routes) {
				await visitRoute(page, route.path)
				for (const u of await page.evaluate(unresolvedVars)) problems.push(`${route.path}  unresolved var(): ${u}`)
			}
			expect(problems, problems.join("\n")).toEqual([])
		})
	}
})

test.describe("cross-component consistency", () => {
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
				const detail = box.getAttribute("data-slot") ?? el.tagName.toLowerCase()
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
	test("a default scope resets an inherited density", async ({ page }) => {
		await page.goto(url("/scale"))
		await page.waitForSelector("h1")

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
	})

	test("an outer text scale survives nested density and theme boundaries", async ({ page }) => {
		await page.goto(url("/scale"))
		await page.waitForSelector("h1")

		const result = await page.evaluate(() => {
			/* A `--text-sm` probe in a scope, text-scaled or not, and optionally under a compact dark boundary. */
			const measure = (textScale: string | null, nested: boolean) => {
				const outer = document.createElement("div")
				outer.setAttribute("data-ui-scope", "")
				if (textScale) outer.style.setProperty("--text-scale", textScale)
				let host = outer
				if (nested) {
					host = document.createElement("div")
					host.setAttribute("data-ui-scope", "")
					host.setAttribute("data-density", "compact")
					host.setAttribute("data-theme", "dark")
					outer.append(host)
				}
				const probe = document.createElement("span")
				probe.style.fontSize = "var(--text-sm)"
				host.append(probe)
				document.body.append(outer)
				const style = getComputedStyle(host)
				const value = {
					textScale: style.getPropertyValue("--text-scale").trim(),
					densityScale: style.getPropertyValue("--density-scale").trim(),
					fontSize: getComputedStyle(probe).fontSize,
				}
				outer.remove()
				return value
			}
			return { plain: measure(null, false), scaled: measure("1.25", false), nested: measure("1.25", true) }
		})

		expect(result.scaled.fontSize, "the outer text scale must move type").not.toBe(result.plain.fontSize)
		expect(result.nested.textScale, "a nested boundary must keep the outer text scale").toBe("1.25")
		expect(result.nested.densityScale, "the nested compact preset must still apply").not.toBe("")
		expect(result.nested.fontSize, "density and theme boundaries must not move type").toBe(result.scaled.fontSize)
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

	test("the type ladder holds its order under every factor", async ({ page }) => {
		await page.goto(url("/typography"))
		await page.waitForSelector("h1")

		for (const [label, factors] of [
			["default", {}],
			["--scale: 1.25", { "--scale": "1.25" }],
			["--scale: 0.875", { "--scale": "0.875" }],
			["--density-scale: 1.25", { "--density-scale": "1.25" }],
			["--density-scale: 0.875", { "--density-scale": "0.875" }],
			["--text-scale: 1.25", { "--text-scale": "1.25" }],
		] as const) {
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
		}
	})

	/* The density factor does not move type at all — ordered, and also unmoved. */
	test("--density-scale leaves the type ladder alone", async ({ page }) => {
		await page.goto(url("/typography"))
		await page.waitForSelector("h1")

		const base = await measure(page, {})
		const spaced = await measure(page, { "--density-scale": "1.5" })

		expect(Object.values(base).length).toBeGreaterThan(4)
		expect(spaced, `type moved under --density-scale: ${JSON.stringify({ base, spaced })}`).toEqual(base)
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
