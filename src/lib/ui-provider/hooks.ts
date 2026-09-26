import { useContext, useMemo } from "react"

import { UIConfigContext, UIPortalHostContext, type UIPortalContainer } from "./context"
import type { ComponentDefaults, ResolvedUIConfig } from "./types"

/** The whole resolved config for this scope. Prefer a narrower hook below. */
export function useUIConfig(): ResolvedUIConfig {
	return useContext(UIConfigContext)
}

/** The scope's locale. Money and dates read it through their own hooks as well. */
export function useFormatting() {
	return useContext(UIConfigContext).formatting
}

/** Currency policy — the default code, the display code, and how a pair is rendered. */
export function useMoneyConfig() {
	return useContext(UIConfigContext).money
}

/** Week start, the fallback pattern, the date-fns locale, and the relative-time hook. */
export function useDatesConfig() {
	return useContext(UIConfigContext).dates
}

/** Overlay policy — whether menus render dark, and the modal scrim's blur. */
export function useOverlayConfig() {
	return useContext(UIConfigContext).overlay
}

export function useTypographyConfig() {
	return useContext(UIConfigContext).typography
}

export function useDensity() {
	const { density, scale } = useContext(UIConfigContext)
	return { density, scale }
}

/** The scope's geometry factor. Components read tokens, not this — it is for callers. */
export function useScale(): number {
	return useContext(UIConfigContext).scale
}

/**
 * Per-component prop defaults for one family: the component passes its own defaults and
 * the scope's overrides merge on top, so defaults stay beside their component.
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
 */
export function useUIPortalContainer(explicit?: UIPortalContainer): UIPortalContainer | undefined {
	const scoped = useContext(UIPortalHostContext)
	return explicit ?? scoped ?? undefined
}
