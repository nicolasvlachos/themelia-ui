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
