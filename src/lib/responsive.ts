import type { CSSProperties } from "react"

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl"

export const BREAKPOINTS: Breakpoint[] = ["base", "sm", "md", "lg", "xl", "2xl"]

/**
 * Each `--bp-*` min-width from styles/theming/breakpoints.css in px (rem × 16), for the
 * JavaScript that cannot read a custom media query. responsive.test.ts holds them in step.
 */
export const BREAKPOINT_MIN_WIDTH: Record<Exclude<Breakpoint, "base">, number> = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
}

/** A literal value, or a per-breakpoint object. Every responsive prop accepts both. */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

/**
 * Turns a responsive prop into per-breakpoint custom properties (`--{name}-{breakpoint}`).
 * The module reads each in one media query per breakpoint, falling back to the next one
 * down. In `lib` so any family can use it.
 */
export function responsiveVars<T extends string | number | boolean>(
	name: string,
	value: ResponsiveValue<T> | undefined,
	transform: (value: T) => string = String,
): CSSProperties {
	if (value === undefined) return {}

	// A bare value is the base breakpoint; everything above inherits it.
	if (typeof value !== "object") {
		return { [`--${name}-base`]: transform(value) } as CSSProperties
	}

	const vars: Record<string, string> = {}
	for (const breakpoint of BREAKPOINTS) {
		const step = (value as Partial<Record<Breakpoint, T>>)[breakpoint]
		if (step !== undefined) vars[`--${name}-${breakpoint}`] = transform(step)
	}
	return vars as CSSProperties
}

/** Merges several responsive prop maps into one style object. */
export function mergeVars(...parts: CSSProperties[]): CSSProperties {
	return Object.assign({}, ...parts)
}
