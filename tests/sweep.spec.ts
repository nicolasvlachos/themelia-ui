/**
 * The three failures no other suite here can see.
 *
 *   OVERFLOW   content wider than the viewport at 390px; the visual suite runs at one width.
 *   CONSOLE    an error or warning from our own code. Production previews emit none;
 *              diagnostics are gated behind `import.meta.env.DEV`.
 *   BLANK      a route that renders no heading: a page that crashed on the way in.
 */
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, READABLE_ROUTES, shards, url, sweepTimeout, visitRoute } from "./routes"

const MOBILE = { width: 390, height: 844 }

/*
 * Console noise that is not our code. Connectivity: the map's third-party tiles fail without
 * DNS; only `net::ERR_` failures are skipped, so a 404 on something we ship still fails.
 */
const isNoise = (text: string) =>
	/net::ERR_NAME_NOT_RESOLVED|net::ERR_INTERNET_DISCONNECTED|net::ERR_CONNECTION/.test(text) ||
	/favicon|Download the React DevTools|sourcemap/i.test(text)

test.describe("route sweep", () => {
	test.setTimeout(sweepTimeout(COMPONENT_ROUTES.length))

	test("every route survives a narrow viewport with a clean console", async ({ page }) => {
		const overflow: string[] = []
		const noisy: string[] = []
		const blank: string[] = []
		const empty: string[] = []

		await page.setViewportSize(MOBILE)

		const seen: string[] = []
		/* One listener pair for the whole walk, reading into the current route's list. */
		let messages: string[] = []
		page.on("console", (message) => {
			if (message.type() === "error" || message.type() === "warning") messages.push(message.text())
		})
		page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`))

		for (const route of COMPONENT_ROUTES) {
			messages = []
			await visitRoute(page, route.path)
			await page.evaluate(() => document.fonts.ready)

			const headingText = await page.locator("h1").first().textContent().catch(() => null)
			seen.push(`${route.path} → ${headingText ?? "(none)"}`)
			if (!headingText) blank.push(route.path)

			/*
			 * `documentElement` rather than body: a body that fits inside an overflowing
			 * document reports nothing, and the scrollbar belongs to the document.
			 */
			const wide = await page.evaluate(() => {
				const root = document.documentElement
				if (root.scrollWidth <= root.clientWidth + 1) return null
				/*
				 * The outermost box past the viewport, not the widest: a scroller's track
				 * legitimately extends past it, and everything below the outermost is a consequence.
				 */
				const depth = (el: HTMLElement) => {
					let n = 0
					for (let p = el.parentElement; p; p = p.parentElement) n += 1
					return n
				}
				let worst: { tag: string; cls: string; right: number; depth: number; overflowX: string } | null = null
				for (const el of document.querySelectorAll<HTMLElement>("body *")) {
					const box = el.getBoundingClientRect()
					if (box.right <= root.clientWidth + 1) continue
					const d = depth(el)
					if (worst && d >= worst.depth) continue
					worst = {
						tag: el.tagName.toLowerCase(),
						cls: (el.getAttribute("class") ?? "").slice(0, 44),
						right: Math.round(box.right),
						depth: d,
						overflowX: getComputedStyle(el).overflowX,
					}
				}
				return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, worst }
			})
			if (wide) {
				const culprit = wide.worst
					? ` — outermost ${wide.worst.tag}.${wide.worst.cls} to ${wide.worst.right}px`
					: ""
				overflow.push(`${route.path}  ${wide.scrollWidth}px in ${wide.clientWidth}px${culprit}`)
			}

			const ours = messages.filter((m) => !isNoise(m))
			if (ours.length) noisy.push(`${route.path}  ${ours[0]?.slice(0, 120)}`)

			/* Every example renders something at this width. */
			for (const id of await page.evaluate(() =>
				[...document.querySelectorAll<HTMLElement>('main section[id] [class*="preview__preview"]')]
					.filter((el) => el.getBoundingClientRect().height <= 20)
					.map((el) => el.closest("section")!.id),
			)) empty.push(`${route.path}#${id}`)
		}

		/*
		 * Hash navigation is same-document, so `goto` can return before the router renders;
		 * distinct headings prove the page actually changed.
		 */
		const distinct = new Set(seen.map((s) => s.split(" → ")[1]))
		console.log(`visited ${seen.length} routes, ${distinct.size} distinct headings`)
		expect(seen.length, "no routes were visited").toBeGreaterThan(100)
		expect(distinct.size, `the page never changed — ${distinct.size} heading(s) across ${seen.length} routes`).toBeGreaterThan(50)

		expect(blank, `routes rendering no <h1>:\n  ${blank.join("\n  ")}`).toEqual([])
		expect(noisy, `routes logging an error or warning:\n  ${noisy.join("\n  ")}`).toEqual([])
		expect(overflow, `routes overflowing at ${MOBILE.width}px:\n  ${overflow.join("\n  ")}`).toEqual([])
		expect(empty, `examples rendering nothing at ${MOBILE.width}px:\n  ${empty.join("\n  ")}`).toEqual([])
	})

	/*
	 * The console again, under a pointer: Recharts builds its tooltip on first hover and clones
	 * `content` with its own props, so a warning or a leaked attribute appears only then.
	 */
	for (const shard of shards(COMPONENT_ROUTES, 3)) test(`no route logs to the console, or grows an attribute, under a pointer — ${shard.name}`, async ({ page }) => {
		/* Desktop: a chart that does not render at 390px cannot log anything. */
		await page.setViewportSize({ width: 1280, height: 900 })
		const noisy: string[] = []
		const stray: string[] = []
		let current = ""
		let hovered = 0

		page.on("console", (message) => {
			if (message.type() !== "error" && message.type() !== "warning") return
			const text = message.text()
			if (isNoise(text)) return
			noisy.push(`${current}  ${text.slice(0, 140).replace(/\s+/g, " ")}`)
		})
		page.on("pageerror", (error) => noisy.push(`${current}  pageerror: ${error.message.slice(0, 140)}`))

		for (const route of shard.routes) {
			current = route.path
			await visitRoute(page, route.path)
			await page.evaluate(() => document.fonts.ready)
			const svgs = page.locator("main svg")
			for (let i = 0; i < (await svgs.count()); i++) {
				const box = await svgs.nth(i).boundingBox().catch(() => null)
				/* Big enough to be a plotted chart rather than an icon. */
				if (!box || box.width < 120 || box.height < 60) continue
				await page.mouse.move(box.x + box.width * 0.4, box.y + box.height / 2)
				/* A couple of frames for Recharts to build its tooltip. */
				await page.waitForTimeout(30)
				hovered++
				for (const found of await page.evaluate(readChartAttributes)) stray.push(`${route.path}  ${found}`)
			}
		}

		/* Proof the sweep is not vacuous: the slice holding /chart must hover its charts. */
		if (shard.routes.some((route) => route.path === "/chart")) expect(hovered, "no chart was hovered").toBeGreaterThan(0)
		expect(noisy, `console output under a pointer:\n  ${noisy.join("\n  ")}`).toEqual([])
		expect(stray, `attributes Recharts leaked onto our markup:\n  ${stray.join("\n  ")}`).toEqual([])
	})
})

test.describe("reduced motion", () => {
	test.setTimeout(sweepTimeout(Math.ceil(COMPONENT_ROUTES.length / 3)) * 2)

	/*
	 * The same pages under `prefers-reduced-motion`: a literal duration the zeroed tokens cannot
	 * reach keeps moving, and Base UI warns when a panel reports both a transition and an
	 * animation.
	 */
	for (const shard of shards(COMPONENT_ROUTES, 3)) test(`nothing moves, and nothing complains, when the reader asks for less motion — ${shard.name}`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" })
		const moving = new Set<string>()
		const noisy = new Set<string>()
		let current = ""
		let elements = 0

		page.on("console", (message) => {
			if (message.type() !== "error" && message.type() !== "warning") return
			const text = message.text()
			if (isNoise(text)) return
			noisy.add(`${current}  ${text.slice(0, 120).replace(/\s+/g, " ")}`)
		})

		for (const route of shard.routes) {
			current = route.path
			await visitRoute(page, route.path)
			const found = await page.evaluate(stillMoving)
			elements += found.checked
			for (const one of found.moving) moving.add(`${route.path}  ${one}`)
			/* Open a disclosure: the panel only reports its animation type once it runs. */
			const trigger = page.locator("main [aria-expanded='false']").first()
			if (await trigger.count()) {
				await trigger.click({ timeout: 3000 }).catch(() => {})
				await page.waitForTimeout(60)
			}
		}

		/* Proof the slice is not vacuous: with nothing rendered, nothing can move. */
		expect(elements, "no element was measured").toBeGreaterThan(shard.routes.length * 5)
		expect(
			[...moving],
			`still moving under prefers-reduced-motion:\n  ${[...moving].join("\n  ")}`,
		).toEqual([])
		expect([...noisy], `console output under the preference:\n  ${[...noisy].join("\n  ")}`).toEqual([])
	})
})

/*
 * Durations that survive the reduced-motion override. A literal is identical to a token at
 * rest, so only the override reveals it.
 */
function stillMoving() {
	const scope = document.querySelector("main")
	if (!scope) return { moving: [] as string[], checked: 0 }
	const owner = (el: Element) => {
		const hook = el.closest("[class*='--component']")
		const cls = hook?.className
		const m = typeof cls === "string" ? cls.match(/([a-z0-9-]+)--component/) : null
		return m ? m[1] : "(unowned)"
	}
	const durations = (value: string) =>
		value.split(",").map((part) => {
			const one = part.trim()
			return one.endsWith("ms") ? Number.parseFloat(one) : one.endsWith("s") ? Number.parseFloat(one) * 1000 : 0
		})
	const moving: string[] = []
	let checked = 0
	for (const el of Array.from(scope.querySelectorAll<HTMLElement>("*"))) {
		const box = el.getBoundingClientRect()
		if (box.width === 0 || box.height === 0) continue
		checked++
		const style = getComputedStyle(el)
		/* Above 1ms, because the sweep leaves transitions at 0.01ms so their events fire. */
		const transition = durations(style.transitionDuration).filter((n) => n > 1)
		const animation = durations(style.animationDuration).filter((n) => n > 1)
		const name = typeof el.className === "string" ? el.className : ""
		const where = `${owner(el)} .${name.split(" ").map((c) => c.replace(/___.*/, "")).join(".").slice(0, 40)}`
		if (transition.length) moving.push(`transition ${Math.max(...transition)}ms  ${where}`)
		if (animation.length && style.animationName !== "none") {
			moving.push(`animation ${style.animationName} ${Math.max(...animation)}ms  ${where}`)
		}
	}
	return { moving, checked }
}

/*
 * What a chart surface is allowed to carry. `class` and `style` are ours; everything a
 * caller can legitimately forward is `id`/`role`/`title`/`lang`/`dir`/`hidden`/`slot`,
 * `tabindex`, or a `data-`/`aria-` attribute.
 */
function readChartAttributes(): string[] {
	const ALLOWED = new Set(["class", "style", "id", "role", "title", "lang", "dir", "hidden", "slot", "tabindex"])
	const out: string[] = []
	for (const selector of [".chart--tooltip", ".chart--legend"]) {
		for (const el of Array.from(document.querySelectorAll(selector))) {
			for (const attribute of Array.from(el.attributes)) {
				const name = attribute.name
				if (ALLOWED.has(name) || name.startsWith("data-") || name.startsWith("aria-")) continue
				out.push(`${selector} ${name}="${attribute.value.slice(0, 30)}"`)
			}
		}
	}
	return out
}

test.describe("documentation prose", () => {
	/**
	 * No page renders a backtick: backticks around a name are the site's prose convention and
	 * must be parsed wherever prose renders. Every route, since one page is enough to fail.
	 */
	test("no page renders a literal backtick", async ({ page }) => {
		test.setTimeout(sweepTimeout(READABLE_ROUTES.length))

		const offenders: string[] = []
		let scanned = 0

		for (const route of READABLE_ROUTES) {
			await page.goto(url(route.path))
			await page.waitForSelector("h1")
			const stray = await page.evaluate(() => {
				const main = document.querySelector("main")
				if (!main) return []
				/* `code` and `pre` legitimately hold source, which may contain backticks. */
				const clone = main.cloneNode(true) as HTMLElement
				for (const el of clone.querySelectorAll("code, pre")) el.remove()
				return (clone.innerText.match(/`[^`\n]{1,60}`/g) ?? []).slice(0, 3)
			})
			scanned += 1
			if (stray.length) offenders.push(`${route.path}  ${stray.join(" / ")}`)
		}

		/* Non-vacuity: a run that visited nothing proves nothing. */
		expect(scanned, "no routes were walked").toBeGreaterThan(100)
		expect(offenders, offenders.join("\n  ")).toEqual([])
	})
})
