/**
 * The theming contract: every `var()` resolves, a region keeps an explicit scheme, density and
 * type factor however deep it sits, and the type ladder holds its order under every factor.
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
				const resolve = (value: string, scope: ParentNode = document.body) => {
					const probe = document.createElement("span")
					probe.style.color = value
					scope.append(probe)
					const color = getComputedStyle(probe).color
					probe.remove()
					return toRgba(color)
				}

				const backgrounds = ["var(--background)", "var(--card)"].map(value => resolve(value))
				/* The idle edge, the hover edge fields.css mixes, and the focus outline. */
				const edges: Record<string, string> = {
					idle: "var(--input)",
					hover: "color-mix(in oklab, var(--input), var(--foreground) 35%)",
					focus: "var(--ring)",
				}
				const measured = Object.fromEntries(Object.entries(edges).map(([edge, value]) => {
					const color = resolve(value)
					return [edge, Math.min(...backgrounds.map(background =>
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
					field.style.outlineColor = "var(--input)"
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
			expect(measurements.fieldBorder, `${theme}: shared field bypassed --input`).toEqual(
				measurements.fieldControlBorder,
			)
			/*
			 * The idle control edge is deliberately below 3:1 (about 2.4:1 in both themes) and has its
			 * own floor; hover and focus still clear 3:1.
			 */
			const floor: Record<string, number> = { idle: 2.3 }
			for (const [edge, ratio] of Object.entries(measurements.measured)) {
				expect(ratio, `${theme} ${edge} edge: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(floor[edge] ?? 3)
			}
		}
	})
})

test.describe("scopes and schemes", () => {
	/* A length and a used colour, read through probes: a variable holding light-dark() reads back unresolved. */
	const probeScript = () => {
		;(window as unknown as { probe: (markup: string) => Record<string, string> }).probe = (markup: string) => {
			const host = document.createElement("div")
			host.innerHTML = markup
			document.body.append(host)
			const target = host.querySelector("span")!
			const read = (property: string, value: string) => {
				const probe = document.createElement("i")
				probe.style.setProperty(property, value)
				target.append(probe)
				const out = getComputedStyle(probe).getPropertyValue(property)
				probe.remove()
				return out
			}
			const result = {
				padding: read("padding-top", "var(--padding)"),
				text: read("font-size", "calc(var(--text-sm) * var(--text-scale))"),
				colours: ["--background", "--foreground", "--primary", "--popover", "--success", "--ring"]
					.map((name) => read("color", `var(${name})`))
					.join(" | "),
			}
			host.remove()
			return result
		}
	}
	type Probe = { padding: string; text: string; colours: string }
	const probe = (page: import("@playwright/test").Page, markup: string) =>
		page.evaluate((m) => (window as unknown as { probe: (markup: string) => Probe }).probe(m), markup)

	test("a default scope resets an inherited density", async ({ page }) => {
		await page.goto(url("/scale"))
		await page.waitForSelector("h1")
		await page.evaluate(probeScript)

		const compact = await probe(page, '<div data-density="compact"><span></span></div>')
		const reset = await probe(page, '<div data-density="compact"><div data-density="default"><span></span></div></div>')
		const plain = await probe(page, "<span></span>")
		expect(compact.padding, "the compact preset must tighten").not.toBe(plain.padding)
		expect(reset.padding, "an explicit default scope must reset an inherited density preset").toBe(plain.padding)
	})

	test("an outer type factor survives nested density and theme boundaries", async ({ page }) => {
		await page.goto(url("/scale"))
		await page.waitForSelector("h1")
		await page.evaluate(probeScript)

		const plain = await probe(page, "<div><span></span></div>")
		const scaled = await probe(page, '<div style="--text-scale: 1.25"><span></span></div>')
		const nested = await probe(page, '<div style="--text-scale: 1.25"><div data-density="compact" data-theme="dark"><span></span></div></div>')
		const compact = await probe(page, '<div data-density="compact"><span></span></div>')

		expect(scaled.text, "the outer type factor must move type").not.toBe(plain.text)
		expect(nested.text, "density and theme boundaries must not move type").toBe(scaled.text)
		expect(nested.padding, "the nested compact preset must still apply").toBe(compact.padding)
	})

	/* A colour follows the scheme of the element that paints it, however deep the island. */
	test("a region nested under an explicit dark ancestor paints dark", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "light" })
		await page.goto(url("/tokens"))
		await page.waitForSelector("h1")
		await page.evaluate(probeScript)

		const read = async (markup: string) => (await probe(page, markup)).colours
		const dark = await read('<div class="dark"><span></span></div>')
		const light = await read('<div data-theme="light"><span></span></div>')

		expect(dark, "the probe must tell the schemes apart").not.toBe(light)
		expect(await read('<div class="dark"><div data-ui-scope=""><span></span></div></div>'), "a `<Scope>` under `.dark` stays dark").toBe(dark)
		expect(await read('<div data-theme="dark"><div data-density="compact"><span></span></div></div>'), "a `data-density` region under `[data-theme=dark]` stays dark").toBe(dark)
		expect(await read('<div data-theme="dark"><div data-ui-scope=""><div data-density="comfortable"><span></span></div></div></div>'), "two boundaries deep stays dark").toBe(dark)
		expect(await read('<div data-theme="dark"><div data-ui-scope="" data-theme="light"><span></span></div></div>'), "a light island inside dark stays light").toBe(light)
		expect(await read('<div data-theme="light"><div class="dark"><div data-ui-scope=""><span></span></div></div></div>'), "a dark island inside light is dark").toBe(dark)
	})

	/*
	 * An explicit light choice outranks the OS preference however it is spelled: the `.light`
	 * class on <html> (next-themes' class strategy), or a light island holding a boundary.
	 */
	test("an explicit light choice holds under an OS dark preference", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" })
		await page.goto(url("/tokens"))
		await page.waitForSelector("h1")
		await page.evaluate(probeScript)

		const html = page.locator("html")
		await html.evaluate((element) => {
			element.classList.remove("dark", "light")
			element.removeAttribute("data-theme")
		})
		const read = async (markup: string) => (await probe(page, markup)).colours
		const light = await read('<div data-theme="light"><span></span></div>')
		const dark = await read('<div class="dark"><span></span></div>')

		expect(dark, "the probe must tell the schemes apart").not.toBe(light)
		expect(await read("<span></span>"), "with no explicit choice the OS preference applies").toBe(dark)
		expect(await read('<div data-ui-scope=""><span></span></div>'), "a boundary follows the OS preference").toBe(dark)
		expect(await read('<div class="light"><span></span></div>'), "a `.light` island stays light").toBe(light)
		expect(await read('<div class="light"><div data-ui-scope=""><span></span></div></div>'), "a `<Scope>` inside a `.light` island stays light").toBe(light)
		expect(await read('<div data-theme="light"><div data-density="compact"><span></span></div></div>'), "a `data-density` region inside `[data-theme=light]` stays light").toBe(light)

		await html.evaluate((element) => element.classList.add("light"))
		expect(await read("<span></span>"), "`<html class=\"light\">` outranks the OS preference").toBe(light)
		expect(await read('<div data-ui-scope=""><span></span></div>'), "a boundary under `<html class=\"light\">` stays light").toBe(light)
	})

	/** Text's sizes, as Text computes them: each step times the type factor. */
	const LADDER = ["xs", "pxs", "sm", "base", "lg", "xl", "2xl"] as const
	const measure = (page: import("@playwright/test").Page, wrapper: string) =>
		page.evaluate(
			({ roles, wrapper }) => {
				const host = document.createElement("div")
				host.innerHTML = wrapper
				document.body.append(host)
				const target = host.querySelector("span")!
				const probe = document.createElement("i")
				target.append(probe)
				const out = Object.fromEntries(roles.map((role) => {
					probe.style.fontSize = `calc(var(--text-${role}) * var(--text-scale))`
					return [role, parseFloat(getComputedStyle(probe).fontSize)]
				}))
				host.remove()
				return out as Record<string, number>
			},
			{ roles: [...LADDER], wrapper },
		)

	test("the type ladder climbs under every type factor", async ({ page }) => {
		await page.goto(url("/typography"))
		await page.waitForSelector("h1")

		for (const wrapper of [
			"<span></span>",
			'<div style="--text-scale: 1.25"><span></span></div>',
			'<div style="--text-scale: 0.875"><span></span></div>',
		]) {
			const sizes = await measure(page, wrapper)
			const detail = `${wrapper} → ${JSON.stringify(sizes)}`
			/* Non-vacuity: a ladder of seven roles that all measure the same is not a ladder. */
			expect(new Set(Object.values(sizes)).size, detail).toBeGreaterThan(4)
			for (let i = 1; i < LADDER.length; i++) {
				expect(sizes[LADDER[i]!]!, `${LADDER[i]} must climb above ${LADDER[i - 1]} — ${detail}`)
					.toBeGreaterThan(sizes[LADDER[i - 1]!]!)
			}
		}
	})

	/* A density preset moves spacing and control heights; type keeps its size. */
	test("a density preset leaves the type ladder alone", async ({ page }) => {
		await page.goto(url("/typography"))
		await page.waitForSelector("h1")

		const base = await measure(page, "<span></span>")
		for (const density of ["compact", "comfortable"]) {
			const spaced = await measure(page, `<div data-density="${density}"><span></span></div>`)
			expect(spaced, `type moved under ${density}: ${JSON.stringify({ base, spaced })}`).toEqual(base)
		}
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
