/**
 * ThemeScope: one DOM node carrying a theme's variables. No React context: CSS variables
 * cascade to every descendant (UIProvider owns the JavaScript-side defaults). The mode class
 * sets the node's `color-scheme`, which picks each colour's half.
 */
import { forwardRef } from "react"

import { cx } from "@/lib/cx"

import type { ThemeScopeProps } from "./theme-tweaker.types"
import { themeToStyle } from "./theme-tweaker.utils"

/**
 * Applies a theme to an intentionally isolated subtree: one DOM node carrying the theme's
 * variables and its mode. An app-wide theme belongs on the shared root instead, through
 * useAppliedTheme.
 */
export const ThemeScope = forwardRef<HTMLDivElement, ThemeScopeProps>(function ThemeScope(
	{ theme, mode = theme.mode, className, style, children, ...props },
	ref,
) {
	return (
		<div
			{...props}
			ref={ref}
			data-theme={mode}
			className={cx("theme-scope--component", mode, className)}
			style={{ ...themeToStyle(theme), ...style }}
		>
			{children}
		</div>
	)
})
