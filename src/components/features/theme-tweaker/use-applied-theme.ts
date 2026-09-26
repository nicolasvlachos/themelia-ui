/**
 * Writes an edited theme onto a live element and removes it on cleanup. Each property is
 * restored (value and `!important` priority) only if it still holds the value this effect
 * set, so later writes by others are left alone.
 */
import { useEffect, type RefObject } from "react"

import type { ThemeDefinition, ThemeTweakerTarget } from "./theme-tweaker.types"
import { themeToStyle } from "./theme-tweaker.utils"

interface UseAppliedThemeOptions {
	/** Writes the theme while `true`; `false` removes what it wrote. */
	apply: boolean
	/** Manages `.light` / `.dark` on the target. `false` when UIProvider owns the colour scheme. */
	manageModeClass: boolean
	/** The editor's own element, which a `self` target means. */
	selfRef: RefObject<HTMLDivElement | null>
	/**
	 * Where the theme goes: `document` for document-wide values, an element, or a function
	 * returning one; `null` applies nothing. A `self` target is left to ThemeScope's inline style.
	 */
	target: ThemeTweakerTarget
	theme: ThemeDefinition
}

function resolveTarget(
	target: ThemeTweakerTarget,
	selfRef: RefObject<HTMLDivElement | null>,
): HTMLElement | null {
	if (target === null) return null
	if (target === "self") return selfRef.current
	if (target === "document") {
		return typeof document === "undefined" ? null : document.documentElement
	}
	if (typeof target === "function") return target()
	return target
}

/**
 * Writes an edited theme onto a live element and removes it on cleanup. Keep it mounted with
 * `target: "document"` and `apply: true` to apply document-wide values; set
 * `manageModeClass: false` when UIProvider owns the colour scheme.
 */
export function useAppliedTheme({
	apply,
	manageModeClass,
	selfRef,
	target,
	theme,
}: UseAppliedThemeOptions): void {
	useEffect(() => {
		// `self` is handled by ThemeScope's inline style.
		if (!apply || target === "self") return

		const element = resolveTarget(target, selfRef)
		if (!element) return

		const style = themeToStyle(theme)
		const originals = new Map<string, { value: string; priority: string }>()
		const applied = new Map<string, string>()

		for (const [name, value] of Object.entries(style)) {
			if (typeof value !== "string") continue
			originals.set(name, {
				value: element.style.getPropertyValue(name),
				priority: element.style.getPropertyPriority(name),
			})
			element.style.setProperty(name, value)
			applied.set(name, value)
		}

		const hadLight = element.classList.contains("light")
		const hadDark = element.classList.contains("dark")
		if (manageModeClass) {
			element.classList.toggle("light", theme.mode === "light")
			element.classList.toggle("dark", theme.mode === "dark")
		}

		return () => {
			for (const [name, expected] of applied) {
				// Someone else owns it now (see the file header).
				if (element.style.getPropertyValue(name) !== expected) continue
				const original = originals.get(name)
				if (original?.value) element.style.setProperty(name, original.value, original.priority)
				else element.style.removeProperty(name)
			}
			if (manageModeClass) {
				element.classList.toggle("light", hadLight)
				element.classList.toggle("dark", hadDark)
			}
		}
	}, [apply, manageModeClass, selfRef, target, theme])
}
