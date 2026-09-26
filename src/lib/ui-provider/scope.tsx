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
 * `<Scope>` — a token boundary without the config machinery. Derived tokens re-compute
 * only at a scope boundary (styles/SCOPES.md), so a factor set on a plain `div` changes
 * nothing; this renders `data-ui-scope`. Use `<UIProvider>` when JavaScript config changes too.
 * `render` picks the element, e.g. `render={<section />}`.
 *
 *   <Scope vars={{ "--density-scale": 0.8 }}>
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
