import { useContext, useMemo } from "react"

import { UIConfigContext, UIPortalHostContext, type UIPortalContainer } from "./context"
import type { ComponentDefaults, ResolvedUIConfig } from "./types"

/**
 * The whole resolved configuration at this point in the tree. Prefer a narrower hook, which
 * says what a component depends on.
 */
export function useUIConfig(): ResolvedUIConfig {
	return useContext(UIConfigContext)
}

/**
 * The scope's locale, shared by the primitives' number formatting. Money and dates read it
 * through their own hooks as well.
 */
export function useFormatting() {
	return useContext(UIConfigContext).formatting
}

/**
 * Currency policy — the default code, the display code, how an amount is written and how a
 * pair is rendered: what Money reads when a prop is absent.
 */
export function useMoneyConfig() {
	return useContext(UIConfigContext).money
}

/**
 * Date and time presentation defaults, read by the date primitives and pickers: week start,
 * the fallback pattern, the date-fns locale, and the relative-time hook.
 */
export function useDatesConfig() {
	return useContext(UIConfigContext).dates
}

/**
 * Overlay policy — whether dropdown and context menus render dark (by default they do),
 * and the modal scrim's blur.
 */
export function useOverlayConfig() {
	return useContext(UIConfigContext).overlay
}

/** Typographic defaults, such as the size components fall back to when they set none. */
export function useTypographyConfig() {
	return useContext(UIConfigContext).typography
}

/**
 * The resolved density, with the scale factor beside it. The visual effect comes from the
 * `data-density` attribute; this is for logic that must branch on it.
 */
export function useDensity() {
	const { density, scale } = useContext(UIConfigContext)
	return { density, scale }
}

/**
 * The resolved `--scale` factor as a number, for a measurement JavaScript has to compute
 * rather than let CSS derive. Components read tokens, not this — it is for callers.
 */
export function useScale(): number {
	return useContext(UIConfigContext).scale
}

/**
 * Per-component prop defaults for one family. The component passes its OWN defaults and
 * the scope's overrides merge over them, which keeps the values beside the component, makes
 * the call order-independent, and lets an unused module tree-shake away.
 */
export function useDefaults<K extends keyof ComponentDefaults>(
	family: K,
	fallback: ComponentDefaults[K],
): ComponentDefaults[K] {
	const config = useContext(UIConfigContext)
	// `ComponentDefaults` is empty until a family augments it, so the generic collapses to
	// `never` here; the cast stays on this line and callers stay typed.
	const override = config.defaults?.[family] as object | undefined
	return useMemo(
		() => (override ? ({ ...(fallback as object), ...override } as ComponentDefaults[K]) : fallback),
		[fallback, override],
	)
}

/**
 * The container a portal in this subtree should use: the caller's `explicit` value, else
 * the nearest `UIPortalHost`, else `undefined` so the primitive keeps its own default.
 * `undefined` rather than `document.body` on purpose: the primitive's default is the thing
 * that knows about shadow roots, SSR and nested portals.
 */
export function useUIPortalContainer(explicit?: UIPortalContainer): UIPortalContainer | undefined {
	const scoped = useContext(UIPortalHostContext)
	return explicit ?? scoped ?? undefined
}
