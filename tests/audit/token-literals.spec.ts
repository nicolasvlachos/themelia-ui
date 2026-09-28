/**
 * An on-demand audit that every audited property on every route resolves to a token in scope.
 *
 * Not a gate: `npm run audit` runs it when a visual change needs judging. Reads each audited
 * property's resolved value off the real element and requires it to match the resolved value
 * of a custom property in scope there. A stylesheet grep cannot see through `var()` chains or
 * `calc()` over a factor.
 */
import { expect, test } from "@playwright/test"

import { COMPONENT_ROUTES, shards, sweepTimeout, visitRoute } from "../routes"

type Violation = { component: string; property: string; value: string; sample: string }

/**
 * Properties worth policing. `background-color` and `border-color` are left out: they are
 * often a `color-mix` over a token, and the mix result is not itself a token.
 */
/*
 * Radii are left to stylelint's radius rule and the geometry audit's nesting check: a nested
 * corner is arithmetic on its container's, which no list of values can enumerate.
 */
const AUDITED = [
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
	/* Two of each: a length between or beyond the pair is simple arithmetic on it (TOKENS.md). */
	const LENGTHS = ["--padding", "--padding-sm", "--gap", "--gap-sm"]
	const DERIVED_LENGTHS = [
		...LENGTHS.flatMap((name) => [0.25, 0.5, 1.5, 2, 3].map((factor) => `calc(var(${name}) * ${factor})`)),
		"calc(var(--radius) - var(--radius-sm))",
		/* An inset that clears a control or an icon and the gap after it. */
		"calc(var(--control-height) + var(--gap-sm))",
		"calc(var(--icon-size) + var(--gap-sm))",
	]
	/* Text's steps as Text sizes them, and its four weights. */
	const DERIVED_TYPE = ["xs", "pxs", "sm", "base", "lg", "xl", "2xl"].map((step) => `calc(var(--text-${step}) * var(--text-scale))`)
	const WEIGHTS = ["400", "500", "600", "700"]
	const derivedFor = (property: string) =>
		/gap|padding/.test(property) ? DERIVED_LENGTHS
			: property === "font-size" ? DERIVED_TYPE
			: property === "font-weight" ? WEIGHTS
			: []

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
			for (const value of [...tokenNames.map((name) => `var(${name})`), ...derivedFor(property)]) {
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

	/* A region that sets its own variables, or a colour island that resolves them in its own scheme. */
	const SCOPE_SELECTOR = "[data-ui-scope], [data-density], [data-theme], .light, .dark, .theme-scope--component"

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
				/* A toned element's ink or foreground, which the tone rule declares on the element itself. */
				if (property === "color" && el.closest("[data-tone], [data-ref-tone]")) {
					const probe = document.createElement("i")
					el.appendChild(probe)
					const inks = ["var(--tone-ink)", "var(--tone-foreground)"].map((value) => {
						probe.style.color = value
						return getComputedStyle(probe).color
					})
					probe.remove()
					if (inks.includes(part)) continue
				}
				/* Within one layout unit: Firefox snaps laid-out padding to 1/60px; the unlaid-out probe does not. */
				if (/^-?[\d.]+px$/.test(part)) {
					const px = Number.parseFloat(part)
					if ([...allowed[property]].some((v) => /^-?[\d.]+px$/.test(v) && Math.abs(Number.parseFloat(v) - px) <= 1 / 60 + 0.001)) continue
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
			}
			expect(problems, problems.join("\n")).toEqual([])
		})
	}
})
