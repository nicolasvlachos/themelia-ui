/**
 * Sub-pixel geometry, across every page.
 *
 * Only small, shape-carrying elements are checked: a circle at 6.99px rasterises oval, while
 * a paragraph at a fractional height is text reflowing correctly.
 */
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, url, sweepTimeout, visitRoute } from "./routes"

type Finding = { kind: string; detail: string }

test("geometry is whole-pixel where it has to be", async ({ page }) => {
	test.setTimeout(sweepTimeout(COMPONENT_ROUTES.length))

	const report: Record<string, Finding[]> = {}

	for (const route of COMPONENT_ROUTES) {
		await page.goto(url(route.path))
		await page.waitForSelector("h1")
		await page.evaluate(() => document.fonts.ready)
		/*
		 * Exercise the roundest named preset (the theme's "Round" corners): nothing that is not a
		 * pill may round past the container radius it defines.
		 */
		await page.addStyleTag({ content: `
			:root, [data-ui-scope], [data-density], [data-theme], .light, .dark {
				--radius: 1.25rem !important;
				--radius-sm: 0.625rem !important;
			}
		` })

		const findings = await page.evaluate(() => {
			const out: { kind: string; detail: string }[] = []
			const seen = new Set<string>()
			const push = (kind: string, detail: string) => {
				const key = `${kind}|${detail}`
				if (seen.has(key) || out.length > 30) return
				seen.add(key)
				out.push({ kind, detail })
			}
			const name = (el: Element) =>
				(el.className.toString().match(/([a-z-]+)--component/) || [])[1] ||
				(el.className.toString().match(/[a-z0-9]__([a-zA-Z0-9]+)___/) || [])[1] ||
				el.tagName.toLowerCase()

			/*
			 * `--radius-sm` (or a radius derived from it) as resolved in this element's scope, since the
			 * theme tweaker re-points it per scope. Only probed for elements already in the awkward or
			 * near-circle band.
			 */
			const controlRadiusIn = (el: Element, expression = "var(--radius-sm)") => {
				const probe = document.createElement("div")
				probe.style.cssText = `position:absolute;visibility:hidden;border-radius:${expression}`
				/* A void or replaced element gives a child probe no box, so the probe goes beside it. */
				const host = /^(INPUT|TEXTAREA|SELECT|IMG|VIDEO|CANVAS)$/.test(el.tagName) ? el.parentElement ?? el : el
				host.appendChild(probe)
				const value = Number.parseFloat(getComputedStyle(probe).borderTopLeftRadius) || 0
				probe.remove()
				return value
			}

			/* Float noise; a larger offset from a whole pixel is what the rasteriser softens. */
			const TOLERANCE = 0.02
			const fractional = (value: number) => Math.abs(value - Math.round(value)) > TOLERANCE

			const main = document.querySelector("main")
			if (!main) return out

			/*
			 * The layout size, not the painted box: `getBoundingClientRect()` of a rotating element is
			 * its axis-aligned bounds (a 16px ring measures 22.6).
			 */
			const layoutSize = (el: Element, cs: CSSStyleDeclaration, rect: DOMRect) => {
				const width = Number.parseFloat(cs.width)
				const height = Number.parseFloat(cs.height)
				return Number.isFinite(width) && Number.isFinite(height)
					? { width, height }
					: { width: rect.width, height: rect.height }
			}

			for (const el of Array.from(main.querySelectorAll<HTMLElement>("*"))) {
				const rect = el.getBoundingClientRect()
				const cs = getComputedStyle(el)
				if (cs.display === "none" || cs.visibility === "hidden") continue
				if (rect.width === 0 || rect.height === 0) continue
				/* The visually-hidden native input behind a custom checkbox, radio or slider. */
				if (Number.parseFloat(cs.opacity) < 0.05) continue
				/* Base UI parks the hidden native input of a select or combobox at a fixed position. */
				if (cs.position === "fixed") continue
				/* SVG internals follow the icon's own coordinate system, not CSS layout. */
				if (el instanceof SVGElement) continue

				const round = cs.borderTopLeftRadius
				/* A circle, not a pill: only a box square within a pixel is held to whole pixels. */
				const square = Math.abs(Number.parseFloat(cs.width) - Number.parseFloat(cs.height)) < 1 ||
					Math.abs(rect.width - rect.height) < 1
				/*
				 * A clipped element paints no curve. Without this a VisuallyHidden 1x1 box (`inset(50%)`)
				 * counts as a circle with a radius of zero.
				 */
				const clipped = cs.clipPath !== "none" || cs.clip !== "auto"

				/*
				 * A designed circle: 50%, a pill, or a radius past half the box. A square control that
				 * is round only because the theme's item radius reaches half of it (a 16px glyph under
				 * the Round preset) is a control at its contract radius, and is judged as one.
				 */
				const roundByRadius = Number.parseFloat(round) > 0 &&
					Number.parseFloat(round) >= Math.min(rect.width, rect.height) / 2 - 0.5
				const isCircle =
					square &&
					!clipped &&
					(round === "50%" ||
						round === "999px" ||
						(roundByRadius && Math.abs(Number.parseFloat(round) - controlRadiusIn(el)) > 0.5))

				/* A small round element must be whole-pixel in size and position; its curve is drawn from its own box. */
				const size = layoutSize(el, cs, rect)
				if (isCircle && size.width <= 24 && size.height <= 24) {
					if (fractional(size.width) || fractional(size.height)) {
						push(
							"fractional-circle",
							`${name(el)} ${size.width.toFixed(2)}x${size.height.toFixed(2)}`,
						)
					} else if (!location.hash.includes("/scale")) {
						/*
						 * Vertical offset within the parent, not the viewport: scroll offsets are
						 * fractional, and glyph advances make horizontal ones fractional too. The scale
						 * page is exempt from this check only; its rows are fractional by design. A
						 * transformed element's painted position is not its layout position, so it is skipped.
						 */
						const parent = cs.transform === "none" ? el.parentElement : null
						/*
						 * A parent with no box (`display: contents`, as Button's label span) reports a
						 * zero rect at the viewport origin, so it cannot be measured against.
						 */
						const parentRect = parent?.getBoundingClientRect()
						if (parent && parentRect && (parentRect.width > 0 || parentRect.height > 0)) {
							const within = rect.top - parentRect.top
							if (fractional(within)) {
								push("half-pixel-circle", `${name(el)} +${within.toFixed(2)} in parent`)
							}
						}
					}
				}

				/*
				 * A radius of 65–95% of half-height reads as a failed pill. The family's own control
				 * radius (`--radius-sm`) is exempt: a chip taking it matches every other control.
				 * Only checked where the corner paints; a link's focus-ring radius has no visible corner.
				 */
				const paints =
					!/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) ||
					Number.parseFloat(cs.borderTopWidth) > 0
				const radius = Number.parseFloat(round)
				const intentionalPill = round === "999px" || round === "50%"
				/* 20px: the Round preset's `--radius` (1.25rem) injected above. */
				if (paints && !intentionalPill && !isCircle && radius > 20.05) {
					push("excessive-radius", `${name(el)} r=${radius}px`)
				}

				if (paints && !isCircle && rect.height > 0 && rect.height <= 28 && rect.width > rect.height) {
					const half = rect.height / 2
					const awkward = radius > 0 && radius / half > 0.65 && radius / half < 0.95
					if (awkward && Math.abs(radius - controlRadiusIn(el)) > 0.5) {
						push(
							"awkward-radius",
							`${name(el)} r=${radius}px on ${rect.height}px (${Math.round((radius / half) * 100)}% of pill)`,
						)
					}
				}

				/*
				 * A small square whose corner nearly closes it into a circle: a radius that is neither
				 * the item radius nor a pill. Every control takes `--radius-sm` at every size, the
				 * checkbox included (TOKENS.md), so the item radius is the contract even where the
				 * Round preset makes an 18px box nearly round; so is a data mark's or arrow tip's
				 * `--radius-sm / 4` (the heatmap cell). Anything else in the band is a stray corner.
				 */
				if (paints && !isCircle && !intentionalPill && rect.height > 0 && rect.height <= 28 && Math.abs(rect.width - rect.height) < 1) {
					const half = rect.height / 2
					if (radius / half > 0.65 && radius / half < 0.99) {
						const atRadius = (expression: string) => Math.abs(radius - controlRadiusIn(el, expression)) <= 0.5
						if (!atRadius("var(--radius-sm)") && !atRadius("calc(var(--radius-sm) / 4)")) {
							push("near-circle", `${name(el)} r=${radius}px on ${Math.round(rect.height)}px (${Math.round((radius / half) * 100)}% of a circle)`)
						}
					}
				}

				/* A scroll container smaller than a line of text cannot be scrolled usefully. */
				if (/auto|scroll/.test(cs.overflowX + cs.overflowY) && rect.height < 28 && rect.width < 200) {
					push("tiny-scroller", `${name(el)} ${Math.round(rect.width)}x${Math.round(rect.height)}`)
				}
			}
			return out
		})

		if (findings.length) report[route.path] = findings
	}

	const lines = Object.entries(report).flatMap(([path, findings]) =>
		findings.map((finding) => `${path} — ${finding.kind}: ${finding.detail}`),
	)
	expect(lines, lines.join("\n")).toEqual([])
})

/**
 * Nothing may scroll the page to itself on mount. `scrollIntoView` in an effect scrolls every
 * scrollable ancestor, the document included, even with `block: "nearest"`.
 */
test("no page arrives already scrolled", async ({ page }) => {
	test.setTimeout(sweepTimeout(COMPONENT_ROUTES.length))

	const jumped: string[] = []

	for (const route of COMPONENT_ROUTES) {
		await page.goto(url(route.path))
		await page.waitForSelector("h1")
		await page.evaluate(() => document.fonts.ready)
		const y = await page.evaluate(() => window.scrollY)
		if (y !== 0) jumped.push(`${route.path} — landed at ${Math.round(y)}px`)
	}

	expect(jumped, jumped.join("\n")).toEqual([])
})

/*
 * Skeleton geometry equals the geometry it stands in for, or the page jumps when data lands.
 * Line stacks are checked at several counts so a `gap` (applied n-1 times) cannot pass.
 */
test("a skeleton reserves exactly what its content will occupy", async ({ page }) => {
	await page.goto(url("/skeleton"))
	await page.waitForSelector("h1")
	await page.evaluate(() => document.fonts.ready)

	const result = await page.evaluate(() => {
		const withPrefix = (prefix: string) =>
			[...document.querySelectorAll(`[class*="skeleton__${prefix}___"]`)].filter((el) =>
				[...el.classList].some((c) => c.startsWith(`skeleton__${prefix}___`)),
			)
		const classOf = (el: Element, prefix: string) =>
			[...el.classList].find((c) => c.startsWith(`skeleton__${prefix}___`)) ?? ""

		const lineEl = withPrefix("line")[0]
		const linesEl = withPrefix("lines")[0]
		if (!lineEl || !linesEl) return { error: "skeleton line elements not found" }

		const lineClass = classOf(lineEl, "line")
		const rootClass = classOf(lineEl, "root")
		const linesClass = classOf(linesEl, "lines")

		const measure = (build: (host: HTMLElement) => void, cssText: string) => {
			const host = document.createElement("div")
			host.style.cssText = `position:absolute;visibility:hidden;width:400px;${cssText}`
			build(host)
			document.body.appendChild(host)
			const height = host.getBoundingClientRect().height
			host.remove()
			return height
		}

		const stacks = [1, 2, 3, 5, 8].map((lines) => {
			const skeleton = measure((host) => {
				host.className = linesClass
				host.innerHTML = Array.from({ length: lines }, () => `<div class="${rootClass} ${lineClass}"></div>`).join("")
			}, "")
			const text = measure((host) => {
				host.innerHTML = Array.from({ length: lines }, () => "<div>x</div>").join("")
			}, "font-size:var(--text-sm);line-height:var(--text-sm--line-height)")
			return { lines, skeleton, text }
		})

		const probe = document.createElement("div")
		probe.style.cssText = "position:absolute;visibility:hidden;height:var(--size-avatar)"
		document.body.appendChild(probe)
		const liveAvatar = probe.getBoundingClientRect().height
		probe.remove()

		/*
		 * A header action stands in for a Button, so it is measured against a real Button root
		 * (the page chrome always renders one, which puts its class on the page) in the same scope.
		 */
		const actionEl = withPrefix("action")[0]
		const buttonClass = [...document.querySelectorAll(".button--component")]
			.flatMap((el) => [...el.classList])
			.find((c) => c.startsWith("button__root___"))
		let action: { skeleton: number; live: number } | null = null
		if (actionEl && buttonClass) {
			const button = document.createElement("button")
			button.className = buttonClass
			button.textContent = "Action"
			button.style.cssText = "position:absolute;visibility:hidden"
			const parent = actionEl.parentElement ?? document.body
			parent.appendChild(button)
			action = { skeleton: actionEl.getBoundingClientRect().height, live: button.getBoundingClientRect().height }
			button.remove()
		}

		return {
			stacks,
			avatar: { skeleton: withPrefix("avatar")[0]?.getBoundingClientRect().height ?? null, live: liveAvatar },
			action,
		}
	})

	expect(result.error, result.error ?? "").toBeUndefined()

	const drifted = (result.stacks ?? []).filter((s) => Math.abs(s.text - s.skeleton) > 0.5)
	expect(
		drifted.map((s) => `${s.lines} line(s): skeleton ${s.skeleton}px vs text ${s.text}px`),
		"a skeleton line stack must occupy the same height as the text it replaces",
	).toEqual([])

	expect(result.avatar?.skeleton, "the skeleton avatar must be --size-avatar").toBeCloseTo(
		result.avatar?.live ?? -1,
		1,
	)

	expect(result.action, "the skeleton header action or a Button to measure it against is missing").toBeTruthy()
	expect(result.action?.skeleton, "a skeleton header action must be a Button's height").toBeCloseTo(
		result.action?.live ?? -1,
		1,
	)
})

/**
 * An icon is square, or something sized its container and not the `<svg>`: an unsized lucide
 * icon keeps its 24px height attribute and takes whatever width the box allows. Reads the
 * declared size, since a rotating spinner's bounding box is its diagonal.
 */
test("every icon is square", async ({ page }) => {
	test.setTimeout(sweepTimeout(COMPONENT_ROUTES.length))
	const findings: string[] = []

	for (const route of COMPONENT_ROUTES) {
		await visitRoute(page, route.path)

		const bad = await page.evaluate(() => {
			const out = new Set<string>()
			for (const svg of document.querySelectorAll("main svg")) {
				const cs = getComputedStyle(svg)
				const w = Number.parseFloat(cs.width)
				const h = Number.parseFloat(cs.height)
				/* Illustrations, charts and sparklines are drawings, not interface icons; so is Leaflet's 12x8 attribution flag. */
				if (!w || !h || w > 48 || h > 48 || svg.classList.contains("leaflet-attribution-flag")) continue
				if (Math.abs(w - h) < 0.5) continue
				const parent = svg.parentElement
				const cls = (parent?.className as unknown as { baseVal?: string })?.baseVal ?? parent?.className ?? ""
				out.add(`${cs.width} x ${cs.height} in ${String(cls).replace(/([a-z0-9])__(?=[a-z])/gi, "$1.").slice(0, 48)}`)
			}
			return [...out]
		})

		for (const entry of bad) findings.push(`${route.path}  ${entry}`)
	}

	expect(findings, "an icon rendering non-square has a container that was sized while its svg was not").toEqual([])
})

/*
 * Nested shapes are concentric: an item that paints within half its container's radius of a
 * corner has the container's radius less that inset, within a pixel. An item that paints only
 * on hover is judged with :hover forced through the DevTools protocol, so the page's own
 * handlers never run — Chromium only. That a state never changes a radius is `verify css`.
 */
test("nested radii are concentric", async ({ page, browserName }) => {
	test.skip(browserName !== "chromium", "forces :hover through CDP")
	test.setTimeout(sweepTimeout(COMPONENT_ROUTES.length))
	const client = await page.context().newCDPSession(page)
	await client.send("DOM.enable")
	await client.send("CSS.enable")
	const findings: string[] = []

	for (const route of COMPONENT_ROUTES) {
		await visitRoute(page, route.path)
		const candidates = await page.evaluate(() => {
			const px = (v: string) => Number.parseFloat(v) || 0
			const radii = (cs: CSSStyleDeclaration) => [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(px)
			const clear = (c: string) => c === "transparent" || /^rgba\(.*, 0\)$/.test(c)
			/* A background, a shadow or a full border: something whose corner shows. */
			const paints = (cs: CSSStyleDeclaration) => !clear(cs.backgroundColor) || cs.backgroundImage !== "none" || cs.boxShadow !== "none" ||
				["top", "right", "bottom", "left"].every((side) => px(cs.getPropertyValue(`border-${side}-width`)) > 0)
			const name = (el: Element) => String((el as HTMLElement).className).split(/\s+/).find((c) => c.includes("__"))?.replace(/___.*/, "") ?? el.tagName.toLowerCase()
			const out: { id: number; name: string; rest: boolean; own: number[]; want: number[] }[] = []
			for (const el of document.querySelectorAll<HTMLElement>("main *")) {
				const cs = getComputedStyle(el)
				const box = el.getBoundingClientRect()
				if (cs.display === "none" || box.width < 14 || box.height < 14) continue
				const own = radii(cs)
				if (Math.min(...own) >= Math.min(box.width, box.height) / 2 - 1) continue // a pill or a circle
				let parent = el.parentElement
				for (let depth = 0; parent && depth < 6; depth++, parent = parent.parentElement) {
					const pcs = getComputedStyle(parent)
					if (Math.max(...radii(pcs)) > 0 && (paints(pcs) || pcs.overflow !== "visible")) break
				}
				if (!parent) continue
				const pcs = getComputedStyle(parent)
				const p = parent.getBoundingClientRect()
				const edge = px(pcs.borderTopWidth)
				const inset = [
					[box.left - p.left - edge, box.top - p.top - edge], [p.right - edge - box.right, box.top - p.top - edge],
					[p.right - edge - box.right, p.bottom - edge - box.bottom], [box.left - p.left - edge, p.bottom - edge - box.bottom],
				]
				const want = radii(pcs).map((outer, k) => {
					const R = Math.max(0, outer - edge)
					const [dx, dy] = inset[k]
					const d = Math.max(dx, dy)
					/* Tight nesting only; a flush child is the container's business when it clips. */
					const tight = d > 0.5 ? d <= R / 2 + 0.5 : pcs.overflow === "visible"
					return R > 0 && dx >= -0.5 && dy >= -0.5 && tight ? Math.max(0, R - d) : -1
				})
				if (want.every((w) => w < 0)) continue
				el.dataset.radiusProbe = String(out.length)
				out.push({ id: out.length, name: `${name(el)} in ${name(parent)}`, rest: paints(cs), own, want })
			}
			return out
		})

		const off = (c: (typeof candidates)[number]) => c.want.some((w, k) => w >= 0 && Math.abs(c.own[k] - w) > 1.01)
		const report = (c: (typeof candidates)[number]) =>
			findings.push(`${route.path}  ${c.name}: ${c.own.join("/")} where concentric is ${c.want.map((w) => (w < 0 ? "–" : Math.round(w))).join("/")}`)
		for (const c of candidates.filter((c) => c.rest && off(c))) report(c)

		/* Only a candidate that paints nothing at rest needs :hover forced to know whether it paints at all. */
		const idle = candidates.filter((c) => !c.rest && off(c))
		if (!idle.length) continue
		const { root } = await client.send("DOM.getDocument", { depth: -1 })
		for (const c of idle) {
			const { nodeId } = await client.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-radius-probe="${c.id}"]` })
			if (!nodeId) continue
			await client.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["hover"] })
			const { computedStyle } = await client.send("CSS.getComputedStyleForNode", { nodeId })
			await client.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] })
			const fill = computedStyle.find((p) => p.name === "background-color")?.value ?? ""
			if (!/^(transparent|rgba\(.*, 0\))$/.test(fill)) report(c)
		}
	}

	/* The inset sidebar is concentric with the viewport; the preview frame around it is not one. */
	const expected = findings.filter((f) => !/^\/sidebar  sidebar__(inner|inset) in /.test(f))
	expect(expected, "a nested item off its container's curve").toEqual([])
})
