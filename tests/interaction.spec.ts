/**
 * What a component does when someone uses it.
 *
 * Covers flows whose contract is a sequence rather than a state: focus that must return, a
 * menu that must close on Escape, arrow keys that must move a selection. Kept few and
 * specific; the a11y suite already runs axe over every page.
 */
import { PNG } from "pngjs"
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, ROUTES, shards, sweepTimeout, url, visitRoute } from "./routes"

/*
 * Helpers for the focus-paint sweep. Named functions because `page.evaluate` serialises
 * them; a closure over module scope arrives with its free variables undefined.
 */
type Control = { component: string; index: number; slot: string | undefined; tag: string }

function collectControls(): Control[] {
	const SEL = "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
	const scope = document.querySelector("main")
	if (!scope) return []
	const owner = (el: Element) => {
		const hook = el.closest("[class*='--component']")
		const cls = hook?.className
		const m = typeof cls === "string" ? cls.match(/([a-z0-9-]+)--component/) : null
		return m ? m[1] : "(unowned)"
	}
	const all = Array.from(scope.querySelectorAll<HTMLElement>(SEL))
	;(window as unknown as { __controls: HTMLElement[] }).__controls = all
	const out: Control[] = []
	const taken = new Set<string>()
	all.forEach((el, index) => {
		/* The docs site's own sidebar is not the kit, and an inert control is not a control. */
		if (el.closest("nav") || el.hasAttribute("disabled")) return
		if (el.tabIndex < 0 || el.getAttribute("aria-hidden") === "true") return
		const b = el.getBoundingClientRect()
		if (b.width === 0 || b.height === 0) return
		const component = owner(el)
		if (taken.has(component)) return
		taken.add(component)
		out.push({
			component,
			index,
			slot: el.dataset.slot || undefined,
			tag: el.tagName.toLowerCase(),
		})
	})
	return out
}

function placeControl(index: number) {
	const el = (window as unknown as { __controls: HTMLElement[] }).__controls[index]
	el.scrollIntoView({ block: "center", behavior: "instant" })
	/*
	 * The ring may be drawn on an ancestor (a field shell, a slider thumb wrapper), so measure
	 * the nearest element with a component hook, plus a margin for a ring outside the box.
	 */
	const hasOwnHook = [...el.classList].some((className) => className.includes("--"))
	const painted =
		el.closest("[data-field-shell]") ??
		(hasOwnHook ? el : el.closest("[class*='--component']")) ??
		el
	const b = painted.getBoundingClientRect()
	if (b.width === 0 || b.height === 0) return null
	const rect = { x: b.x - 6, y: b.y - 6, w: b.width + 12, h: b.height + 12 }
	/*
	 * Only return a rect the screenshot contains: a control a scroller kept out of view gives an
	 * empty crop, which reads the same as a ring that did not paint.
	 */
	if (rect.y + rect.h < 0 || rect.y > window.innerHeight) return null
	if (rect.x + rect.w < 0 || rect.x > window.innerWidth) return null
	return rect
}

/* The same rect, without scrolling — used to prove the layout held still. */
function readRect(index: number) {
	const el = (window as unknown as { __controls: HTMLElement[] }).__controls[index]
	if (!el?.isConnected) return null
	const hasOwnHook = [...el.classList].some((className) => className.includes("--"))
	const painted =
		el.closest("[data-field-shell]") ??
		(hasOwnHook ? el : el.closest("[class*='--component']")) ??
		el
	const b = painted.getBoundingClientRect()
	if (b.width === 0 || b.height === 0) return null
	const rect = { x: b.x - 6, y: b.y - 6, w: b.width + 12, h: b.height + 12 }
	if (rect.y + rect.h < 0 || rect.y > window.innerHeight) return null
	if (rect.x + rect.w < 0 || rect.x > window.innerWidth) return null
	return rect
}

function focusControl(index: number) {
	const el = (window as unknown as { __controls: HTMLElement[] }).__controls[index]
	el.focus({ preventScroll: true, focusVisible: true } as FocusOptions & { focusVisible: boolean })
	return document.activeElement === el
}

function prepareAdjacentKeyboardFocus(index: number) {
	const el = (window as unknown as { __controls: HTMLElement[] }).__controls[index]
	const sentinel = document.createElement("button")
	sentinel.type = "button"
	sentinel.dataset.focusSentinel = ""
	sentinel.style.cssText = "position:fixed;inline-size:1px;block-size:1px;opacity:0;pointer-events:none"
	el.before(sentinel)
	sentinel.focus({ preventScroll: true })
	return document.activeElement === sentinel
}

function controlHasFocus(index: number) {
	const el = (window as unknown as { __controls: HTMLElement[] }).__controls[index]
	return document.activeElement === el
}

function clearFocusProbe() {
	;(document.activeElement as HTMLElement | null)?.blur()
	document.querySelector<HTMLElement>("[data-focus-sentinel]")?.remove()
}

/*
 * Counted inside the rect rather than clipped at capture: Playwright's `clip` and
 * `getBoundingClientRect` disagree once the page has scrolled. Screenshots use CSS-pixel
 * scale so DOM rects match on high-DPI profiles. A channel must move by more than 8 to count,
 * so antialiasing noise is ignored.
 */
function changedPixels(a: Buffer, b: Buffer, r: { x: number; y: number; w: number; h: number }) {
	const before = PNG.sync.read(a)
	const after = PNG.sync.read(b)
	let n = 0
	for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(before.height, Math.ceil(r.y + r.h)); y++) {
		for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(before.width, Math.ceil(r.x + r.w)); x++) {
			const i = (y * before.width + x) * 4
			if (
				Math.abs(before.data[i] - after.data[i]) > 8 ||
				Math.abs(before.data[i + 1] - after.data[i + 1]) > 8 ||
				Math.abs(before.data[i + 2] - after.data[i + 2]) > 8
			) {
				n++
			}
		}
	}
	return n
}

test.describe("keyboard and focus", () => {
	test("shared and feature toolbars use named roving focus", async ({ page }) => {
		for (const probe of [
			{ path: "/toolbar", name: "Formatting" },
			{ path: "/rich-text-editor", name: "Formatting" },
			/* The table's own toolbar, not DataView's above it on the same page. */
			{ path: "/data-view", name: "Table controls", scope: "#table" },
		] as { path: string; name: string; scope?: string }[]) {
			await page.goto(url(probe.path))
			await page.waitForSelector("h1")

			const root = probe.scope ? page.locator(probe.scope) : page
			const toolbar = root.getByRole("toolbar", { name: probe.name }).first()
			await expect(toolbar, `${probe.path} must expose a named toolbar`).toBeVisible()
			const buttons = toolbar.getByRole("button")
			expect(await buttons.count(), `${probe.path} needs at least two toolbar controls`).toBeGreaterThan(1)

			const enabled = toolbar.locator("button:not([disabled])")
			const first = enabled.nth(0)
			const second = enabled.nth(1)
			await first.focus()
			await first.press("ArrowRight")
			await expect(second, `${probe.path} must move focus with ArrowRight`).toBeFocused()
		}
	})

	test("mobile docs keep theme and layer filtering on screen", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 })
		await page.goto(url("/components"))
		await page.waitForSelector("h1")

		await expect(page.getByRole("button", { name: /Switch to (dark|light) theme/ })).toBeVisible()
		const search = page.getByRole("button", { name: "Search components" })
		await expect(search).toBeVisible()
		await expect(search.locator("kbd")).toBeHidden()
		const searchLabel = search.getByText("Search components…", { exact: true })
		expect(
			await searchLabel.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
			"the mobile header must show the search label without ellipsis",
		).toBe(true)
		const layer = page.getByRole("combobox", { name: "Filter by layer" })
		await expect(layer).toBeVisible()
		const count = page.locator("main [aria-live='polite']").first()
		const allText = await count.textContent()
		await layer.selectOption("features")
		await expect(count).toBeVisible()
		const filteredText = await count.textContent()
		expect(filteredText).not.toBe(allText)
		const numbers = filteredText?.match(/(\d+) of (\d+)/)?.slice(1).map(Number)
		expect(numbers?.[0]).toBeLessThan(numbers?.[1] ?? 0)
		await expect(page.getByRole("radiogroup", { name: "Filter by layer" })).toBeHidden()

		await page.getByRole("button", { name: "Search components" }).click()
		const box = await page.getByRole("dialog", { name: "Search components" }).boundingBox()
		expect(box).not.toBeNull()
		/* Inside the 390px viewport with at least a 12px gutter each side. */
		expect(box!.x).toBeGreaterThanOrEqual(12)
		expect(box!.x + box!.width).toBeLessThanOrEqual(378)
	})

	test("the theme toggle reflects the effective system theme", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" })
		await page.goto(url("/badge"))
		await page.waitForSelector("h1")

		const toggle = page.getByRole("button", { name: "Switch to light theme" })
		await expect(toggle).toBeVisible()
		await toggle.click()
		await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible()
		await expect(page.locator("[data-ui-scope]").first()).toHaveAttribute("data-theme", "light")
	})

	test("documentation navigation exposes twelve task-shaped groups, sectioned where long", async ({ page }) => {
		await page.goto(url("/badge"))
		await page.waitForSelector("h1")

		const nav = page.getByRole("navigation", { name: "Documentation" })
		const groups = nav.getByRole("button")
		await expect(groups).toHaveCount(12)
		/* Named by the group alone: the page count beside it is a visual cue, hidden from the name. */
		const names = [
			"GET STARTED",
			"FOUNDATIONS",
			"APP LAYOUT",
			"NAVIGATION",
			"ACTIONS",
			"FORMS",
			"DATA DISPLAY",
			"OVERLAYS & MENUS",
			"FEEDBACK & STATUS",
			"VALUES & FORMATTING",
			"FEATURES",
			"BLOCKS",
		]
		for (const [index, name] of names.entries()) {
			await expect(groups.nth(index)).toHaveAccessibleName(name)
		}
		await expect(nav.getByRole("link", { name: "Review (internal)" })).toHaveCount(0)
		const links = nav.locator("a[href]")
		await expect(links).toHaveCount(ROUTES.filter((route) => route.path !== "/review").length)
		const hrefs = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))
		expect(new Set(hrefs).size).toBe(hrefs.length)
		/* The group holding the current page opens itself, with its sections labelled. */
		await expect(nav.getByRole("button", { name: "DATA DISPLAY" })).toHaveAttribute("aria-expanded", "true")
		await expect(nav.getByText("Content", { exact: true })).toBeVisible()
	})

	test("site search is one command dialog for click and keyboard use", async ({ page }) => {
		await page.goto(url("/badge"))
		await page.waitForSelector("h1")

		const trigger = page.getByRole("button", { name: "Search components" })
		await trigger.click()

		const dialog = page.getByRole("dialog", { name: "Search components" })
		await expect(dialog).toBeVisible()
		const box = await dialog.boundingBox()
		expect(box).not.toBeNull()
		/* Centred in the 1280px-wide viewport. */
		expect(Math.abs((box!.x + box!.width / 2) - 640)).toBeLessThanOrEqual(1)
		const input = dialog.getByPlaceholder("Search components…")
		await expect(input).toBeFocused()
		await input.fill("toolbar")
		await page.keyboard.press("Enter")
		await expect(page).toHaveURL(/#\/toolbar$/)
		await expect(dialog).toBeHidden()

		await page.keyboard.press("Control+k")
		await input.fill("button")
		await expect(dialog.getByText("Button", { exact: true })).toBeVisible()
		await expect(dialog.getByText("Breadcrumbs", { exact: true })).toBeHidden()

		await page.keyboard.press("Escape")
		await expect(dialog).toBeHidden()
		await expect(trigger).toBeFocused()

		await page.keyboard.press("Control+k")
		await expect(dialog).toBeVisible()
		// Terms may match separate metadata fields ("dark mode" + "palette").
		await input.fill("dark palette")
		await expect(dialog.getByText("Tokens & theming", { exact: true })).toBeVisible()
		await page.keyboard.press("Enter")
		await expect(page).toHaveURL(/#\/tokens$/)
		await expect(dialog).toBeHidden()
	})

	test("a menu opens with the keyboard, moves with arrows, and closes with Escape", async ({ page }) => {
		await page.goto(url("/dropdown-menu"))
		await page.waitForSelector("h1")

		const trigger = page.locator("main [aria-haspopup='menu'], main button[aria-expanded]").first()
		await trigger.focus()
		await page.keyboard.press("Enter")

		const menu = page.locator("[role='menu']").first()
		await expect(menu).toBeVisible()

		/*
		 * An item takes focus, not the trigger. Asserted on the active element because which item
		 * highlights first differs between opening by Enter and by ArrowDown.
		 */
		await page.keyboard.press("ArrowDown")
		const focusedRole = await page.evaluate(() => document.activeElement?.getAttribute("role"))
		expect(focusedRole, "arrow keys moved focus nowhere inside the menu").toMatch(/^menuitem/)

		await page.keyboard.press("Escape")
		await expect(menu).toBeHidden()
		/* Focus comes BACK. A menu that drops focus on the body strands a keyboard user. */
		await expect(trigger).toBeFocused()
	})

	test("a carousel moves and tracks its slide in RTL, with mirrored arrows", async ({ page }) => {
		await visitRoute(page, "/carousel")
		const root = page.locator("main .carousel--component").first()
		/* WebKit keeps the scroll offset across a runtime dir flip, so start from the RTL start. */
		await root.evaluate((element) => {
			element.setAttribute("dir", "rtl")
			const viewport = [...element.querySelectorAll<HTMLElement>("*")].find((node) => node.scrollWidth > node.clientWidth + 1)
			viewport?.scrollTo({ left: 0 })
			viewport?.dispatchEvent(new Event("scroll"))
		})
		const next = root.getByRole("button", { name: /next/i }).first()
		const current = () => root.locator("[aria-current='true']").first().getAttribute("aria-label")
		await expect.poll(current).toMatch(/1/)
		await next.click()
		await expect.poll(current).toMatch(/2/)
		/* Next points toward the end, which is on the left in RTL. */
		await expect(next.locator("svg")).toHaveCSS("scale", "-1 1")
	})

	test("an accordion opens and closes from the keyboard", async ({ page }) => {
		await page.goto(url("/accordion"))
		await page.waitForSelector("h1")

		const trigger = page.locator("main button[aria-expanded]").first()
		await trigger.focus()
		const before = await trigger.getAttribute("aria-expanded")

		await page.keyboard.press("Enter")
		await expect(trigger).not.toHaveAttribute("aria-expanded", before ?? "false")

		await page.keyboard.press("Enter")
		await expect(trigger).toHaveAttribute("aria-expanded", before ?? "false")
	})

	test("a tab strip moves with arrow keys, not only with clicks", async ({ page }) => {
		await page.goto(url("/tabs"))
		await page.waitForSelector("h1")

		const tabs = page.locator("main [role='tab']")
		const first = tabs.first()
		await first.focus()
		await expect(first).toHaveAttribute("aria-selected", "true")

		await page.keyboard.press("ArrowRight")
		/* The roving tabindex moved: a different tab is focused AND selected. */
		await expect(first).not.toBeFocused()
		await expect(tabs.nth(1)).toBeFocused()
	})

	for (const shard of shards(COMPONENT_ROUTES, 8)) test(`every focused control paints something — ${shard.name}`, async ({ page }) => {
		/*
		 * Focus each control and require some pixel in or around it to change. Style checks are not
		 * enough: an `overflow: hidden` ancestor erases an outer box-shadow ring, and a ring can sit
		 * on a wrapper the selector never matches.
		 */
		test.setTimeout(sweepTimeout(shard.routes.length) * 2)
		/* Offline, as visual.spec is: map tiles arriving mid-measure made /map flaky on Linux WebKit. */
		await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => route.abort())
		const invisible: string[] = []
		let measured = 0

		for (const route of shard.routes) {
			await visitRoute(page, route.path)
			/* Web fonts change line boxes, and a page measured mid-swap reports stale geometry. */
			await page.evaluate(() => document.fonts.ready)
			/* Prime keyboard modality in engines that do not yet honor FocusOptions.focusVisible. */
			await page.keyboard.press("Tab")
			await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
			/* One representative per component: 25,000 screenshots would not finish. */
			const candidates = await page.evaluate(collectControls)
			for (const c of candidates) {
				if (!(await page.evaluate(placeControl, c.index))) continue

				/*
				 * Two attempts, because the page may still be settling (the AI chat transcript scrolls to
				 * its newest message after mount) and a shifted crop misses the ring.
				 */
				let painted: number | null = null
				for (let attempt = 0; attempt < 2 && painted === null; attempt++) {
					const rect = await page.evaluate(readRect, c.index)
					if (!rect) break
					const needsRealKeyboardFocus = c.slot === "tab" || c.slot === "tab-panel"
					if (
						needsRealKeyboardFocus &&
						!(await page.evaluate(prepareAdjacentKeyboardFocus, c.index))
					) break
					const before = await page.screenshot({ animations: "disabled", scale: "css" })
					if (needsRealKeyboardFocus) {
						await page.keyboard.press("Tab")
						if (!(await page.evaluate(controlHasFocus, c.index))) {
							await page.evaluate(clearFocusProbe)
							break
						}
					} else if (!(await page.evaluate(focusControl, c.index))) break
					const after = await page.screenshot({ animations: "disabled", scale: "css" })
					const settled = await page.evaluate(readRect, c.index)
					await page.evaluate(clearFocusProbe)
					if (!settled || Math.abs(settled.y - rect.y) > 1 || Math.abs(settled.x - rect.x) > 1) continue
					painted = changedPixels(before, after, rect)
				}

				if (painted === null) continue
				measured++
				if (painted === 0) invisible.push(`${route.path} ${c.component} <${c.tag}>`)
			}
		}

		/* Proof the slice is not vacuous: about four controls a route measure across the whole sweep. */
		expect(measured, "no control was measured in this slice").toBeGreaterThan(shard.routes.length)
		expect(invisible, `focus painted nothing:\n  ${invisible.join("\n  ")}`).toEqual([])
	})

	/**
	 * The same check under `forced-colors: active`, where Chromium drops box-shadow and so every
	 * `var(--focus-ring)` ring. A representative sample: the rule under test is global, and each
	 * control costs two screenshots.
	 */
	const FORCED_COLOR_ROUTES = [
		"/button", "/input", "/tabs", "/select", "/checkbox", "/radio-group", "/switch",
		"/accordion", "/dropdown-menu", "/typography", "/pagination", "/side-nav",
		"/combobox", "/textarea", "/date-picker", "/action-menu",
	]

	test("every focused control paints something in forced-colors too", async ({ page }) => {
		test.setTimeout(sweepTimeout(FORCED_COLOR_ROUTES.length))
		await page.emulateMedia({ forcedColors: "active" })

		const invisible: string[] = []
		let measured = 0

		for (const path of FORCED_COLOR_ROUTES) {
			await visitRoute(page, path)
			await page.evaluate(() => document.fonts.ready)
			await page.keyboard.press("Tab")
			await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())

			const candidates = await page.evaluate(collectControls)
			for (const c of candidates.slice(0, 6)) {
				if (!(await page.evaluate(placeControl, c.index))) continue
				const rect = await page.evaluate(readRect, c.index)
				if (!rect) continue
				const before = await page.screenshot({ animations: "disabled", scale: "css" })
				if (!(await page.evaluate(focusControl, c.index))) continue
				const after = await page.screenshot({ animations: "disabled", scale: "css" })
				const settled = await page.evaluate(readRect, c.index)
				await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
				if (!settled || Math.abs(settled.y - rect.y) > 1 || Math.abs(settled.x - rect.x) > 1) continue

				measured++
				if (changedPixels(before, after, rect) === 0) invisible.push(`${path} ${c.component} <${c.tag}>`)
			}
		}

		console.log(`forced-colors focus measured on ${measured} controls`)
		expect(measured, "no control was measured under forced-colors").toBeGreaterThan(30)
		expect(invisible, `no focus indicator under forced-colors:\n  ${invisible.join("\n  ")}`).toEqual([])
	})
})

test.describe("progress presentation", () => {
	test("range, inline-start direction, and reduced motion stay aligned", async ({ page }) => {
		await page.goto(url("/progress"))
		await page.waitForSelector("h1")

		const bars = page.locator('[data-slot="progress"]')
		const determinate = bars.first()
		const fill = determinate.locator(":scope > div")
		await expect(determinate).toHaveAttribute("aria-valuenow", "24")
		await expect(determinate).toHaveAttribute("aria-valuemax", "100")

		const ltr = await Promise.all([determinate.boundingBox(), fill.boundingBox()])
		expect(ltr[0]).not.toBeNull()
		expect(ltr[1]).not.toBeNull()
		expect(Math.abs(ltr[1]!.x - ltr[0]!.x)).toBeLessThanOrEqual(1)

		await page.evaluate(() => {
			document.documentElement.dir = "rtl"
		})
		const rtl = await Promise.all([determinate.boundingBox(), fill.boundingBox()])
		expect(rtl[0]).not.toBeNull()
		expect(rtl[1]).not.toBeNull()
		expect(Math.abs(rtl[1]!.x + rtl[1]!.width - (rtl[0]!.x + rtl[0]!.width))).toBeLessThanOrEqual(1)

		const indeterminate = bars.filter({ has: page.locator('[class*="indeterminate"]') }).first()
		await expect(indeterminate).not.toHaveAttribute("aria-valuenow")
		await expect(indeterminate).not.toHaveAttribute("aria-valuemax")

		await page.emulateMedia({ reducedMotion: "reduce" })
		const moving = await indeterminate.locator(":scope > div").evaluate((element) => {
			const style = getComputedStyle(element)
			return { duration: style.animationDuration, iterations: style.animationIterationCount }
		})
		expect(moving.duration).toBe("0s")
		expect(moving.iterations).toBe("1")

		const circles = page.locator('[data-slot="progress-circle"]')
		await expect(circles.first()).toHaveAttribute("aria-valuenow", "24")
		await expect(circles.first()).toHaveCSS("--progress-sweep", "24%")
	})
})

/*
 * A disabled control either refuses the pointer (`pointer-events: none`) or shows
 * `not-allowed`; it must never keep an inviting cursor such as `grab`. Runs with no exception
 * list: needing one would mean the rule no longer holds.
 */
function invitingDisabledControls() {
	const scope = document.querySelector("main")
	if (!scope) return []
	const owner = (el: Element) => {
		const hook = el.closest("[class*='--component']")
		const cls = hook?.className
		const m = typeof cls === "string" ? cls.match(/([a-z0-9-]+)--component/) : null
		return m ? m[1] : "(unowned)"
	}
	/* Neutral, or an outright refusal. `text` is a caret over prose, not an invitation. */
	const CALM = new Set(["not-allowed", "default", "auto", "text"])
	const out: string[] = []
	for (const host of Array.from(scope.querySelectorAll<HTMLElement>("[disabled], [aria-disabled='true'], [data-disabled]"))) {
		for (const el of [host, ...Array.from(host.querySelectorAll<HTMLElement>("*"))]) {
			const box = el.getBoundingClientRect()
			if (box.width === 0 || box.height === 0) continue
			const style = getComputedStyle(el)
			if (style.pointerEvents === "none" || CALM.has(style.cursor)) continue
			out.push(`${owner(el)} <${el.tagName.toLowerCase()}> ${style.cursor}`)
		}
	}
	return out
}

test.describe("affordances", () => {
	test("no disabled control invites a pointer", async ({ page }) => {
		test.setTimeout(sweepTimeout(COMPONENT_ROUTES.length))
		const inviting = new Set<string>()
		let disabled = 0

		for (const route of COMPONENT_ROUTES) {
			await visitRoute(page, route.path)
			disabled += await page.evaluate(
				() => document.querySelectorAll("main [disabled], main [aria-disabled='true'], main [data-disabled]").length,
			)
			for (const found of await page.evaluate(invitingDisabledControls)) inviting.add(`${route.path}  ${found}`)
		}

		/* Proof the sweep is not vacuous: with nothing disabled anywhere, it cannot fail. */
		console.log(`disabled elements seen: ${disabled}`)
		expect(disabled, "no disabled control was found on any route").toBeGreaterThan(20)
		expect([...inviting], `disabled controls showing an interactive cursor:\n  ${[...inviting].join("\n  ")}`).toEqual([])
	})

	test("a card that is one link covers itself, and nothing else", async ({ page }) => {
		/*
		 * `CardPrimaryAction` stretches an anchor over the card: the card must be its containing
		 * block, and a control nested in the card must sit above the anchor and take its own clicks.
		 */
		await page.goto(url("/card"))
		await page.waitForSelector("h1")

		const report = await page.evaluate(() => {
			const faults: string[] = []
			const links = Array.from(document.querySelectorAll<HTMLElement>("main .card-primary-action--component"))
			let controls = 0
			for (const link of links) {
				const card = link.closest("[class*='cards__root']") as HTMLElement | null
				if (!card) {
					faults.push("a primary action is not inside a card root")
					continue
				}
				const anchor = link.getBoundingClientRect()
				const box = card.getBoundingClientRect()
				/* Within the card's own border box, not some ancestor's — or the viewport's. */
				if (anchor.width > box.width + 2 || anchor.height > box.height + 2) {
					faults.push(`the anchor is ${anchor.width.toFixed(0)}x${anchor.height.toFixed(0)} inside a ${box.width.toFixed(0)}x${box.height.toFixed(0)} card`)
				}
				for (const el of Array.from(card.querySelectorAll<HTMLElement>("button, a[href]"))) {
					if (el === link) continue
					el.scrollIntoView({ block: "center", behavior: "instant" })
					const b = el.getBoundingClientRect()
					if (b.width < 4 || b.height < 4) continue
					controls++
					const topmost = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
					if (topmost !== el && !el.contains(topmost)) {
						faults.push(`the ${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 24)}" is covered by the card's own link`)
					}
				}
			}
			return { faults, links: links.length, controls }
		})

		/* Both counts guard against a vacuous pass; the nested control is the case that matters. */
		expect(report.links, "no CardPrimaryAction on the page").toBeGreaterThan(0)
		expect(report.controls, "no control nested inside a card that is one link").toBeGreaterThan(0)
		expect(report.faults, `card link faults:\n  ${report.faults.join("\n  ")}`).toEqual([])

		const primaryAction = page.getByRole("link", { name: "Open Northwind Traders" }).first()
		const linkedCard = primaryAction.locator("xpath=ancestor::*[@data-slot='card'][1]")
		const restingShadow = await linkedCard.evaluate((element) => getComputedStyle(element).boxShadow)
		await primaryAction.hover()
		await expect
			.poll(() => linkedCard.evaluate((element) => getComputedStyle(element).boxShadow))
			.not.toBe(restingShadow)
	})
})

/**
 * Multi-step contracts: open, move, commit, close, and leave focus where a keyboard user can
 * carry on.
 */
test.describe("selection and overlays", () => {
	test("a select opens, moves with arrows, commits, and returns focus", async ({ page }) => {
		await page.goto(url("/select"))
		await page.waitForSelector("h1")

		const trigger = page.locator("main [role='combobox']").first()
		await trigger.focus()
		const before = await trigger.textContent()

		await page.keyboard.press("Enter")
		// The closed site-search palette also owns a portal-mounted listbox.
		const listbox = page.locator("[role='listbox']:visible").first()
		await expect(listbox).toBeVisible()

		await page.keyboard.press("ArrowDown")
		await page.keyboard.press("Enter")
		await expect(listbox).toBeHidden()

		/* Focus returns to the trigger rather than dropping to the body. */
		await expect(trigger).toBeFocused()
		expect(await trigger.textContent(), "the arrow keys chose nothing").not.toBe(before)
	})

	test("escape closes a select without committing", async ({ page }) => {
		await page.goto(url("/select"))
		await page.waitForSelector("h1")

		const trigger = page.locator("main [role='combobox']").first()
		await trigger.focus()
		const before = await trigger.textContent()

		await page.keyboard.press("Enter")
		const listbox = page.locator("[role='listbox']:visible").first()
		await expect(listbox).toBeVisible()
		await page.keyboard.press("ArrowDown")
		await page.keyboard.press("Escape")

		await expect(listbox).toBeHidden()
		await expect(trigger).toBeFocused()
		expect(await trigger.textContent(), "Escape committed the highlighted option").toBe(before)
	})

	test("a dialog contains focus and gives it back", async ({ page }) => {
		await page.goto(url("/overlay"))
		await page.waitForSelector("h1")

		/* The Dialog preset's own example; the page opens with Overlay's placement demos. */
		const trigger = page.locator("#dialog [data-slot='overlay-trigger']").first()
		await trigger.focus()
		await page.keyboard.press("Enter")

		/* `getByRole`: a native `<dialog>` has an implicit role no attribute selector can see. */
		const dialog = page.getByRole("dialog").first()
		await expect(dialog).toBeVisible()

		/*
		 * Focus must never reach the page behind. Containment is not asserted on each press: a native
		 * modal's tab cycle passes through browser chrome, which reports as `body`.
		 */
		for (let press = 0; press < 10; press++) {
			await page.keyboard.press("Tab")
			const escaped = await page.evaluate(() => {
				const active = document.activeElement
				if (!active || active === document.body || active === document.documentElement) return null
				if (active.closest("dialog[open]")) return null
				return active.tagName + (active.textContent ?? "").trim().slice(0, 20)
			})
			expect(escaped, `focus reached the page behind after ${press + 1} tab(s)`).toBeNull()
		}

		await page.keyboard.press("Escape")
		await expect(dialog).toBeHidden()
		await expect(trigger, "the dialog kept focus after closing").toBeFocused()
	})

	test("a date picker can be driven from the keyboard alone", async ({ page }) => {
		await page.goto(url("/date-picker"))
		await page.waitForSelector("h1")

		const trigger = page.locator("main [data-slot='popover-trigger']").first()
		await trigger.focus()
		await page.keyboard.press("Enter")

		const grid = page.locator("[role='grid']").first()
		await expect(grid).toBeVisible()

		/*
		 * Opening should focus the selected (or today's) day; Tab is still walked in case focus is
		 * elsewhere. What matters is that the grid is reached and arrows move inside it.
		 */
		let landed = await page.evaluate(() => Boolean(document.activeElement?.closest("[data-day]")))
		for (let press = 0; press < 8 && !landed; press++) {
			await page.keyboard.press("Tab")
			landed = await page.evaluate(() => Boolean(document.activeElement?.closest("[data-day]")))
		}
		expect(landed, "tabbing never reached a day in the grid").toBe(true)

		/* A roving tabindex: arrows move between days rather than tab stops. */
		const before = await page.evaluate(() =>
			document.activeElement?.closest("[data-day]")?.getAttribute("data-day"),
		)
		await page.keyboard.press("ArrowRight")

		/*
		 * Polled: the calendar focuses the destination in a `requestAnimationFrame`, after a month
		 * change has mounted the target day.
		 */
		await expect
			.poll(
				() =>
					page.evaluate(() => document.activeElement?.closest("[data-day]")?.getAttribute("data-day")),
				{ message: "the arrow key did not move to another day" },
			)
			.not.toBe(before)

		await page.keyboard.press("Escape")
		await expect(trigger).toBeFocused()
	})

	/*
	 * Keyboard reordering, which both components announce in their accessible names. The axes
	 * differ on purpose: the repeater is a column (Up/Down), the gallery a row (Left/Right).
	 */
	test("a list reorders from the keyboard, on the axis its label promises", async ({ page }) => {
		await page.goto(url("/repeater"))
		await page.waitForSelector("h1")

		const rows = () =>
			page.evaluate(() =>
				Array.from(document.querySelectorAll<HTMLElement>("main [class*='repeater__row']"))
					.slice(0, 3)
					.map((row) => (row.querySelector("input") as HTMLInputElement | null)?.value ?? ""),
			)
		const handle = page.locator("main [class*='repeater__handle']").first()
		expect(await handle.getAttribute("aria-label"), "the handle does not promise arrow keys").toMatch(/arrow keys/i)

		const beforeRows = await rows()
		expect(beforeRows.filter(Boolean).length, "no repeater rows to reorder").toBeGreaterThan(1)
		await handle.focus()
		await page.keyboard.press("ArrowDown")
		await expect.poll(rows).not.toEqual(beforeRows)
		/* Down means down: the first row takes second place, not some other shuffle. */
		const afterRows = await rows()
		expect(afterRows[1]).toBe(beforeRows[0])

		await page.goto(url("/file-upload"))
		await page.waitForSelector("h1")
		const tiles = () =>
			page.evaluate(() =>
				Array.from(document.querySelectorAll<HTMLElement>("main [data-gallery-tile]"))
					.slice(0, 3)
					.map((tile) => tile.getAttribute("aria-label") ?? ""),
			)
		const tile = page.locator("main [data-gallery-tile]").first()
		expect(await tile.getAttribute("aria-label"), "the tile does not promise arrow keys").toMatch(/arrow keys/i)

		const beforeTiles = await tiles()
		expect(beforeTiles.filter(Boolean).length, "no gallery tiles to reorder").toBeGreaterThan(1)
		await tile.focus()
		await page.keyboard.press("ArrowRight")
		await expect.poll(tiles).not.toEqual(beforeTiles)
		/* The label carries the position, so it is re-read after the move rather than travelling with the tile. */
		expect((await tiles())[1]).toMatch(/position 2 of 3/)
	})

	test("a portal host keeps a popup inside its scope", async ({ page }) => {
		/*
		 * Custom properties inherit down the DOM tree and a portal leaves it, so only a real browser
		 * can compare a hosted popup's computed value with an unhosted one.
		 */
		await page.goto(url("/ui-root-scope"))
		await page.waitForSelector("h1")

		const triggers = page.locator("#ui-portal-host button", { hasText: "Actions" })
		await expect(triggers).toHaveCount(2)

		const read = async (index: number) => {
			await triggers.nth(index).click()
			const popup = page.locator("[data-slot='dropdown-menu-content']").first()
			await expect(popup).toBeVisible()
			const scale = await popup.evaluate((node) =>
				getComputedStyle(node).getPropertyValue("--density-scale").trim(),
			)
			await page.keyboard.press("Escape")
			await expect(popup).toBeHidden()
			return scale
		}

		const withoutHost = await read(0)
		const withHost = await read(1)

		/* Unset at the root: the lengths fall back to --scale. */
		expect(withoutHost, "the unhosted menu should sit at the root's density").toBe("")
		/* Numeric: the built stylesheet writes the preset with fewer digits (`.941177`). */
		expect(Number(withHost), "the hosted menu should inherit the compact scope").toBeCloseTo(0.9411764706, 5)
	})
})

test("a toast holds while it has keyboard focus, and Escape returns focus to the page", async ({ page }) => {
	await page.goto(url("/toast"))
	const trigger = page.getByRole("button", { name: "With undo" })
	await trigger.focus()
	await page.keyboard.press("Enter")
	const region = page.getByRole("region", { name: /notification/i })
	await expect(region).toHaveAttribute("aria-live", "polite")
	const action = region.locator("[data-toast-id] button").first()
	await action.focus()
	const box = await region.boundingBox()
	/* Pointer leave must not resume the timers while focus is inside; then outlast the 4000ms default. */
	await page.mouse.move(box!.x + 8, box!.y + 8)
	await page.mouse.move(2, 2)
	await page.waitForTimeout(4600)
	await expect(region.locator("[data-toast-id]")).toHaveCount(1)
	await page.keyboard.press("Escape")
	await expect(region.locator("[data-toast-id]:not([data-leaving])")).toHaveCount(0)
	await expect(trigger).toBeFocused()
})

test("a calendar keeps one tab stop that follows the keyboard cursor", async ({ page }) => {
	await page.goto(url("/calendar"))
	const calendars = page.locator(".calendar--component")
	for (const count of await calendars.evaluateAll((els) => els.map((el) => el.querySelectorAll('[data-day][tabindex="0"]').length))) {
		expect(count).toBe(1)
	}
	const calendar = calendars.first()
	const stop = calendar.locator('[data-day][tabindex="0"]')
	await stop.focus()
	const start = await stop.getAttribute("data-day")
	await page.keyboard.press("ArrowRight")
	await expect(calendar.locator('[data-day][tabindex="0"]')).not.toHaveAttribute("data-day", start!)
	await expect(calendar.locator('[data-day][tabindex="0"]')).toBeFocused()
	const focusedDay = () => page.evaluate(() => document.activeElement?.getAttribute("data-day") ?? "")
	const before = await focusedDay()
	/* Polled: PageDown re-renders the month before focus lands, a frame later in WebKit under load. */
	await page.keyboard.press("PageDown")
	await expect.poll(focusedDay).not.toBe(before)
	const after = await focusedDay()
	expect(new Date(after).getMonth()).toBe((new Date(before).getMonth() + 1) % 12)
	await page.keyboard.press("End")
	await expect.poll(async () => new Date(await focusedDay()).getDay()).toBe(0)
})
