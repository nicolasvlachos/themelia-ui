/**
 * ThemeScope: one DOM node carrying a theme's variables. No React context: CSS variables
 * cascade to every descendant (UIProvider owns the JavaScript-side defaults). The mode
 * class is set too, since the kit's dark overrides also answer `.dark`.
 */
import { forwardRef } from "react"

import { cx } from "@/lib/cx"

import type { ThemeScopeProps } from "./theme-tweaker.types"
import { themeToStyle } from "./theme-tweaker.utils"

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
			style={{ ...themeToStyle(theme, mode), ...style }}
		>
			{children}
		</div>
	)
})
