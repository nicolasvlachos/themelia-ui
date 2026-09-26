import { createContext } from "react"

import { DEFAULT_UI_CONFIG } from "./defaults"
import type { ResolvedUIConfig, UIConfig } from "./types"

export const UIConfigContext = createContext<ResolvedUIConfig>(DEFAULT_UI_CONFIG)

/**
 * Whether a root or scope is above this point. `UIProvider` uses it to decide between
 * owning the document (outermost) and scoping its own subtree (nested).
 */
export const UINestedContext = createContext(false)

/**
 * Where a popup should render so it keeps its scope. Theme and density inherit down the
 * DOM, so popups portal into an element inside the scope rather than `document.body`.
 */
export type UIPortalContainer = HTMLElement | ShadowRoot | null

/** Published by `UIPortalHost`; read through `useUIPortalContainer`. */
export const UIPortalHostContext = createContext<UIPortalContainer>(null)

/**
 * Merges a config over its parent. A scope inherits everything it does not name, down to
 * the record fields: setting `theme.colors.primary` keeps the parent's other colours.
 */
export function mergeUIConfig(parent: ResolvedUIConfig, config: UIConfig = {}): ResolvedUIConfig {
	return {
		...parent,
		...config,
		colorScheme: config.colorScheme ?? parent.colorScheme,
		density: config.density ?? parent.density,
		scale: config.scale ?? parent.scale,
		theme: {
			...parent.theme,
			...config.theme,
			colors: mergeRecord(parent.theme?.colors, config.theme?.colors),
			palette: mergeRecord(parent.theme?.palette, config.theme?.palette),
			vars: mergeRecord(parent.theme?.vars, config.theme?.vars),
		},
		typography: {
			...parent.typography,
			...config.typography,
			fonts: mergeRecord(parent.typography?.fonts, config.typography?.fonts),
			sizes: mergeRecord(parent.typography?.sizes, config.typography?.sizes),
		},
		motion: {
			...parent.motion,
			...config.motion,
			durations: mergeRecord(parent.motion?.durations, config.motion?.durations),
		},
		overlay: { ...parent.overlay, ...config.overlay },
		formatting: { ...parent.formatting, ...config.formatting },
		forms: { ...parent.forms, ...config.forms },
		money: { ...parent.money, ...config.money },
		dates: { ...parent.dates, ...config.dates },
		defaults: mergeDefaults(parent.defaults, config.defaults),
	}
}

/** Merge two flat records; `undefined` when neither has one, so no empty records appear. */
function mergeRecord<T extends object>(parent: T | undefined, config: T | undefined): T | undefined {
	if (!parent) return config
	if (!config) return parent
	return { ...parent, ...config }
}

/** Component defaults merge per family, so overriding one prop keeps the siblings. */
function mergeDefaults(
	parent: UIConfig["defaults"],
	config: UIConfig["defaults"],
): UIConfig["defaults"] {
	if (!parent) return config
	if (!config) return parent

	const parentFamilies = parent as Record<string, object | undefined>
	const configFamilies = config as Record<string, object | undefined>
	const merged: Record<string, object | undefined> = { ...parentFamilies }

	for (const family of Object.keys(configFamilies)) {
		merged[family] = { ...parentFamilies[family], ...configFamilies[family] }
	}
	return merged as UIConfig["defaults"]
}
