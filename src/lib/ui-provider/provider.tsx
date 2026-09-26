import { useContext, type CSSProperties, type ReactNode } from "react"

import { UINestedContext } from "./context"
import { UIRoot } from "./root"
import { UIScope } from "./ui-scope"
import type { UIConfig } from "./types"

export interface UIProviderProps {
	/** Merged over the enclosing provider, or over the library defaults at the root. */
	config?: UIConfig
	/**
	 * Removes the wrapper from layout with `display: contents`; custom properties still
	 * inherit. Set `false` when the scope should be a real box, such as a themed panel.
	 */
	transparent?: boolean
	className?: string
	style?: CSSProperties
	children: ReactNode
}

/**
 * `<UIProvider>` — composes `UIRoot` and `UIScope`: outermost, a root that themes
 * `documentElement` plus a scope; nested, a scope only. Prefer `UIRoot` and `UIScope`
 * directly, which let a root decline the document.
 */
export function UIProvider({ config, transparent = true, className, style, children }: UIProviderProps) {
	const isNested = useContext(UINestedContext)

	if (isNested) {
		return (
			<UIScope config={config} transparent={transparent} className={className} style={style}>
				{children}
			</UIScope>
		)
	}

	return (
		<UIRoot config={config} documentTarget="documentElement">
			<UIScope config={config} transparent={transparent} className={className} style={style}>
				{children}
			</UIScope>
		</UIRoot>
	)
}
