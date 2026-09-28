import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type { CSSProperties } from "react"

export interface ScopeProps extends useRender.ComponentProps<"div"> {
	/** Custom properties to set. Keys include the leading `--`. */
	vars: Record<string, string | number>
	/** Removes the element from layout with `display: contents`; custom properties still inherit. */
	transparent?: boolean
}

/**
 * `<Scope>` — a region with its own theme variables, without the config machinery. Every
 * component inside reads the variables it sets, and the element leaves layout alone. Use it
 * when the change is purely variables, and `<UIProvider>` when JavaScript config changes
 * too. `render` picks the element, e.g. `render={<section />}`.
 *
 *   <Scope vars={{ "--control-height": "2.5rem" }}>
 *     <Toolbar />
 *   </Scope>
 */
export function Scope({ vars, transparent = true, render, className, style, ...props }: ScopeProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps<"div">(
			/* Custom properties are not in React's typed style, nor data attributes in its props. */
			{
				className,
				style: { ...(transparent ? { display: "contents" } : null), ...vars, ...style } as CSSProperties,
				"data-ui-scope": "",
			} as Record<string, unknown>,
			props,
		),
		render,
	})
}
